"""POST /job/architect.

The LLM is faked throughout — these tests run with no API key and cost nothing.
"""

from __future__ import annotations

from collections.abc import Callable

from fastapi.testclient import TestClient

from app.contracts.models import JobDescription
from app.llm.base import (
    LLMInvalidOutputError,
    LLMNotConfiguredError,
    LLMRefusalError,
)
from tests.conftest import FakeLLM


def test_returns_a_contract_conforming_job_description(
    client: TestClient, fake_llm: FakeLLM
) -> None:
    response = client.post(
        "/job/architect",
        json={"brief": "We need a senior backend engineer in Berlin."},
    )

    assert response.status_code == 200
    # Round-tripping through the contract is the real assertion: if the
    # response drifts from the schema, this raises.
    jd = JobDescription.model_validate(response.json()["job_description"])
    assert jd.title == "Senior Backend Engineer"
    assert jd.requirements[0].id == "req_python_5y"
    assert len(fake_llm.calls) == 1


def test_stamps_provenance_from_the_server_not_the_model(
    client: TestClient, fake_llm: FakeLLM
) -> None:
    body = client.post("/job/architect", json={"brief": "Backend engineer."}).json()

    meta = body["job_description"]["meta"]
    assert meta["model"] == fake_llm.model
    assert meta["prompt_version"] == "1"
    assert meta["generated_at"] is not None


def test_sends_the_versioned_prompt_as_the_system_message(
    client: TestClient, fake_llm: FakeLLM
) -> None:
    client.post("/job/architect", json={"brief": "Backend engineer."})

    system = fake_llm.calls[0]["system"]
    assert "Job Architect" in system
    assert fake_llm.calls[0]["schema"] is JobDescription


def test_includes_prior_turns_in_the_prompt(client: TestClient, fake_llm: FakeLLM) -> None:
    client.post(
        "/job/architect",
        json={
            "brief": "Make it hybrid in Berlin.",
            "history": [
                {"role": "user", "content": "I need a backend engineer."},
                {"role": "assistant", "content": "What seniority?"},
            ],
        },
    )

    prompt = fake_llm.calls[0]["prompt"]
    assert "I need a backend engineer." in prompt
    assert "What seniority?" in prompt
    assert prompt.strip().endswith("Make it hybrid in Berlin.")


def test_rejects_an_empty_brief(client: TestClient) -> None:
    response = client.post("/job/architect", json={"brief": ""})

    assert response.status_code == 422


def test_missing_credentials_report_service_unavailable(
    failing_client: Callable[[Exception], TestClient],
) -> None:
    response = failing_client(LLMNotConfiguredError("no key")).post(
        "/job/architect", json={"brief": "Backend engineer."}
    )

    assert response.status_code == 503
    assert response.json()["error"]["type"] == "LLMNotConfiguredError"


def test_provider_refusal_is_a_client_error(
    failing_client: Callable[[Exception], TestClient],
) -> None:
    response = failing_client(LLMRefusalError("declined")).post(
        "/job/architect", json={"brief": "Backend engineer."}
    )

    assert response.status_code == 422


def test_unusable_model_output_is_a_bad_gateway(
    failing_client: Callable[[Exception], TestClient],
) -> None:
    response = failing_client(LLMInvalidOutputError("truncated")).post(
        "/job/architect", json={"brief": "Backend engineer."}
    )

    assert response.status_code == 502
