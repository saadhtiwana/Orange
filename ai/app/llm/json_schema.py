"""Adapt a contract model's JSON Schema for OpenAI-compatible structured output.

OpenAI-style `response_format={"type": "json_schema", "strict": true}` — which
xAI, Gemini and OpenRouter all implement — accepts only a subset of JSON Schema.
Handing it `JobDescription.model_json_schema()` verbatim is rejected, because
Pydantic emits keywords the strict validator does not implement (`pattern` from
`Field(pattern=...)`, `minimum`/`maximum` from `ge`/`le`) and because strict mode
requires *every* property to appear in `required`, which `default_factory` fields
do not.

So the schema sent to the model is a sanitised copy. This does **not** loosen the
contract: the constraints stripped here were only ever a hint to the model, and
the reply is still validated against the untouched Pydantic model, which raises
on any violation. Stripping them moves enforcement from "asked nicely" to
"checked on the way in", which is the stronger of the two.
"""

from __future__ import annotations

from collections.abc import Collection
from typing import Any

from pydantic import BaseModel

# Fields the server owns, excluded from the schema the model sees so it cannot
# invent them: the persistence layer assigns `id`, the router stamps `meta`
# after generation, and `schema_version` is a constant of the contract.
SERVER_OWNED: frozenset[str] = frozenset({"id", "meta", "schema_version"})

# Validation keywords the strict decoder rejects. Pydantic emits these from
# Field(...) constraints; they stay enforced by `model_validate`.
_UNSUPPORTED_KEYWORDS: frozenset[str] = frozenset(
    {
        "default",
        "examples",
        "exclusiveMaximum",
        "exclusiveMinimum",
        "format",
        "maxItems",
        "maxLength",
        "maximum",
        "minItems",
        "minLength",
        "minimum",
        "multipleOf",
        "pattern",
        "uniqueItems",
    }
)

# Keys under these hold *names* (field names, definition names), not schema
# keywords, so their keys must never be filtered — only their values recursed.
_NAME_KEYED = frozenset({"properties", "$defs", "definitions"})


def _strict(node: Any) -> Any:
    if isinstance(node, list):
        return [_strict(item) for item in node]
    if not isinstance(node, dict):
        return node

    cleaned: dict[str, Any] = {}
    for key, value in node.items():
        if key in _UNSUPPORTED_KEYWORDS:
            continue
        if key in _NAME_KEYED and isinstance(value, dict):
            cleaned[key] = {name: _strict(sub) for name, sub in value.items()}
        else:
            cleaned[key] = _strict(value)

    # Strict mode demands a closed object with every property required. Optional
    # fields already carry a `null` branch in their anyOf, so requiring them
    # costs nothing — the model answers `null` instead of omitting the key.
    properties = cleaned.get("properties")
    if isinstance(properties, dict):
        cleaned["additionalProperties"] = False
        cleaned["required"] = list(properties)

    return cleaned


def to_strict_schema(
    model: type[BaseModel],
    *,
    exclude: Collection[str] = (),
) -> dict[str, Any]:
    """Return `model`'s JSON Schema in the strict-structured-output dialect."""
    schema: dict[str, Any] = model.model_json_schema()

    if exclude:
        properties = schema.get("properties")
        if isinstance(properties, dict):
            for name in exclude:
                properties.pop(name, None)

    strict: dict[str, Any] = _strict(schema)
    return strict
