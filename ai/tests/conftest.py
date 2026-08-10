"""Test fixtures. No test in this suite reaches the network."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.contracts.models import (
    EducationRequirement,
    EmploymentType,
    Importance,
    JobDescription,
    Requirement,
    RequirementKind,
    Seniority,
    WorkMode,
)
from app.dependencies import get_llm_client
from app.llm.base import LLMError, ModelT
from app.main import app


def sample_job_description() -> JobDescription:
    """A minimal but valid JD, standing in for real model output."""
    return JobDescription(
        title="Senior Backend Engineer",
        seniority=Seniority.SENIOR,
        employment_type=EmploymentType.FULL_TIME,
        work_mode=WorkMode.HYBRID,
        locations=["Berlin, Germany"],
        summary="Own the payments platform end to end.",
        responsibilities=["Design and ship payment services."],
        requirements=[
            Requirement(
                id="req_python_5y",
                kind=RequirementKind.SKILL,
                label="Python, 5+ years",
                importance=Importance.MUST_HAVE,
                min_years=5,
                weight=0.6,
            ),
            Requirement(
                id="req_kubernetes",
                kind=RequirementKind.SKILL,
                label="Kubernetes in production",
                importance=Importance.NICE_TO_HAVE,
                weight=0.4,
            ),
        ],
        education=EducationRequirement(),
        keywords=["python", "payments"],
    )


class FakeLLM:
    """Records what it was asked and returns a canned contract model."""

    def __init__(
        self,
        result: BaseModel | None = None,
        error: Exception | None = None,
    ) -> None:
        self._result = result if result is not None else sample_job_description()
        self._error = error
        self.calls: list[dict[str, Any]] = []

    @property
    def model(self) -> str:
        return "fake-model-1"

    async def structured(
        self,
        *,
        system: str,
        prompt: str,
        schema: type[ModelT],
    ) -> ModelT:
        self.calls.append({"system": system, "prompt": prompt, "schema": schema})
        if self._error is not None:
            raise self._error
        assert isinstance(self._result, schema)
        return self._result


@pytest.fixture
def fake_llm() -> FakeLLM:
    return FakeLLM()


@pytest.fixture
def client(fake_llm: FakeLLM) -> Iterator[TestClient]:
    app.dependency_overrides[get_llm_client] = lambda: fake_llm
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def failing_client() -> Iterator[Any]:
    """Returns a factory that wires an LLM which raises the given error."""

    def _build(error: LLMError) -> TestClient:
        app.dependency_overrides[get_llm_client] = lambda: FakeLLM(error=error)
        return TestClient(app)

    yield _build
    app.dependency_overrides.clear()


@pytest.fixture
def frozen_now() -> datetime:
    return datetime(2026, 1, 1, tzinfo=UTC)
