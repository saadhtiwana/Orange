"""The schema sent to an OpenAI-compatible provider must be strict-dialect.

These tests pin the two things that break structured output in practice: an
unsupported validation keyword slipping through, and a property missing from
`required`.
"""

from __future__ import annotations

from typing import Any

from app.contracts.models import JobDescription
from app.llm.json_schema import SERVER_OWNED, to_strict_schema

_FORBIDDEN = {
    "default",
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


def _walk(node: Any) -> list[dict[str, Any]]:
    """Every object-schema dict in the tree, including $defs entries."""
    found: list[dict[str, Any]] = []
    if isinstance(node, list):
        for item in node:
            found.extend(_walk(item))
    elif isinstance(node, dict):
        found.append(node)
        for value in node.values():
            found.extend(_walk(value))
    return found


def test_strips_every_keyword_strict_mode_rejects() -> None:
    schema = to_strict_schema(JobDescription, exclude=SERVER_OWNED)

    offenders = {key for node in _walk(schema) for key in node if key in _FORBIDDEN}
    assert offenders == set()


def test_the_untouched_schema_would_have_been_rejected() -> None:
    """Guards the test above: prove the raw schema really does carry them."""
    raw = JobDescription.model_json_schema()

    offenders = {key for node in _walk(raw) for key in node if key in _FORBIDDEN}
    assert offenders, "expected Pydantic to emit strict-incompatible keywords"


def test_every_property_is_required_and_objects_are_closed() -> None:
    schema = to_strict_schema(JobDescription, exclude=SERVER_OWNED)

    for node in _walk(schema):
        properties = node.get("properties")
        if not isinstance(properties, dict):
            continue
        assert node["additionalProperties"] is False
        assert set(node["required"]) == set(properties)


def test_server_owned_fields_are_not_offered_to_the_model() -> None:
    schema = to_strict_schema(JobDescription, exclude=SERVER_OWNED)

    for name in SERVER_OWNED:
        assert name not in schema["properties"]
        assert name not in schema["required"]


def test_field_names_are_never_mistaken_for_schema_keywords() -> None:
    """`properties` holds field names; filtering its keys would drop fields."""
    schema = to_strict_schema(JobDescription, exclude=SERVER_OWNED)

    assert "title" in schema["properties"]
    assert "requirements" in schema["properties"]
