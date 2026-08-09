"""Export the Pydantic contracts to JSON Schema.

The Pydantic models are the source of truth; `contracts/*.schema.json` and the
TypeScript types generated from them are build artifacts that happen to be
committed. Run this after any contract change:

    uv run python scripts/export_schemas.py

Two kinds of file come out:

* One readable schema per contract — what a human (or a non-Python service)
  reads to understand the interface.
* `orange.schema.json`, a single bundle of all three sharing one `$defs` block.
  This exists purely for TypeScript codegen: compiling the three separately
  would emit `Compensation` and friends once per file and collide on import.

`--check` exits non-zero if the committed artifacts are stale, which is how CI
catches a contract change that was not regenerated.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Any

from pydantic.json_schema import JsonSchemaMode, models_json_schema

from app.contracts.models import CandidateProfile, JobDescription, ScoreWithEvidence

if TYPE_CHECKING:
    from pydantic import BaseModel

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "contracts"
SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema"
BUNDLE_NAME = "orange"

# These schemas describe data on the wire, where a datetime is an ISO string
# rather than a Python object.
MODE: JsonSchemaMode = "serialization"

EXPORTS: dict[str, type[BaseModel]] = {
    "job_description": JobDescription,
    "candidate_profile": CandidateProfile,
    "score_with_evidence": ScoreWithEvidence,
}


def _render(schema: dict[str, Any], name: str) -> str:
    """Serialize a schema stably, so diffs show real changes only."""
    schema["$schema"] = SCHEMA_DIALECT
    schema["$id"] = f"https://orange.dev/contracts/{name}.schema.json"
    return json.dumps(schema, indent=2, sort_keys=True) + "\n"


def render_single(name: str, model: type[BaseModel]) -> str:
    return _render(model.model_json_schema(mode=MODE), name)


def _strip_property_titles(node: Any) -> None:
    """Drop the per-field `title` Pydantic adds to every property.

    The TypeScript generator turns any titled schema into a named type, so
    leaving these in mints an alias per field — `Name`, `Id`, `Min`, `Url` —
    which collide with each other and bury the types anyone actually imports.
    Titles on the `$defs` themselves are kept: those name the interfaces.
    """
    if isinstance(node, dict):
        properties = node.get("properties")
        if isinstance(properties, dict):
            for prop in properties.values():
                if isinstance(prop, dict):
                    prop.pop("title", None)
        for value in node.values():
            _strip_property_titles(value)
    elif isinstance(node, list):
        for item in node:
            _strip_property_titles(item)


def render_bundle() -> str:
    """All three contracts in one document with a shared `$defs` block."""
    _, combined = models_json_schema(
        [(model, MODE) for model in EXPORTS.values()],
        ref_template="#/$defs/{model}",
    )
    _strip_property_titles(combined)

    bundle: dict[str, Any] = {
        "title": "OrangeContracts",
        "description": "Codegen bundle. Read the per-contract schemas instead.",
        "type": "object",
        "properties": {
            key: {"$ref": f"#/$defs/{model.__name__}"} for key, model in EXPORTS.items()
        },
        "required": list(EXPORTS),
        "additionalProperties": False,
        "$defs": combined.get("$defs", {}),
    }
    return _render(bundle, BUNDLE_NAME)


def artifacts() -> dict[str, str]:
    rendered = {
        f"{name}.schema.json": render_single(name, model) for name, model in EXPORTS.items()
    }
    rendered[f"{BUNDLE_NAME}.schema.json"] = render_bundle()
    return rendered


def main() -> int:
    parser = argparse.ArgumentParser(description="Export contract schemas.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify committed schemas are up to date instead of writing them.",
    )
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stale: list[str] = []

    for filename, rendered in artifacts().items():
        path = OUTPUT_DIR / filename

        if args.check:
            current = path.read_text(encoding="utf-8") if path.exists() else ""
            if current != rendered:
                stale.append(str(path.relative_to(REPO_ROOT)))
            continue

        path.write_text(rendered, encoding="utf-8")
        print(f"wrote {path.relative_to(REPO_ROOT)}")

    if stale:
        print("Contracts are out of date. Run: uv run python scripts/export_schemas.py")
        for item in stale:
            print(f"  stale: {item}")
        return 1

    if args.check:
        print("Contract schemas are up to date.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
