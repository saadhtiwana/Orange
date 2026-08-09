"""Contract invariants and generated-artifact drift."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.contracts.models import (
    Evidence,
    EvidencePolarity,
    Importance,
    Requirement,
    RequirementKind,
)

AI_DIR = Path(__file__).resolve().parents[1]


def test_requirement_ids_must_be_stable_slugs() -> None:
    with pytest.raises(ValidationError):
        Requirement(
            id="Python 5 Years",  # spaces and capitals are not a slug
            kind=RequirementKind.SKILL,
            label="Python",
            importance=Importance.MUST_HAVE,
            weight=0.5,
        )


def test_weights_are_bounded() -> None:
    with pytest.raises(ValidationError):
        Requirement(
            id="req_python",
            kind=RequirementKind.SKILL,
            label="Python",
            importance=Importance.MUST_HAVE,
            weight=1.5,
        )


def test_unknown_fields_are_rejected() -> None:
    """A hallucinated field must fail loudly rather than being dropped."""
    with pytest.raises(ValidationError):
        Requirement(
            id="req_python",
            kind=RequirementKind.SKILL,
            label="Python",
            importance=Importance.MUST_HAVE,
            weight=0.5,
            confidence=0.9,  # type: ignore[call-arg]
        )


def test_evidence_defaults_to_supporting_a_claim() -> None:
    evidence = Evidence(
        quote="Led the migration to Kubernetes.",
        locator="work_experience[0].highlights[0]",
        confidence=0.9,
    )

    assert evidence.polarity is EvidencePolarity.SUPPORTS


def test_evidence_can_record_an_absence() -> None:
    """A gap has to be expressible, or 'auditable' means cherry-picked."""
    evidence = Evidence(
        quote="",
        locator="raw_text",
        polarity=EvidencePolarity.ABSENT,
        confidence=0.8,
        requirement_id="req_kubernetes",
    )

    assert evidence.polarity is EvidencePolarity.ABSENT


def test_committed_json_schemas_match_the_models() -> None:
    """Fails when the Pydantic models change without regenerating artifacts."""
    result = subprocess.run(
        [sys.executable, "scripts/export_schemas.py", "--check"],
        cwd=AI_DIR,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stdout + result.stderr
