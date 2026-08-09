"""Shared data contracts for the Orange platform.

This package is the single source of truth. JSON Schema and TypeScript types
are generated from these models; never hand-edit the generated artifacts.
"""

from app.contracts.models import (
    CandidateProfile,
    Evidence,
    JobDescription,
    Requirement,
    ScoreWithEvidence,
)

__all__ = [
    "CandidateProfile",
    "Evidence",
    "JobDescription",
    "Requirement",
    "ScoreWithEvidence",
]
