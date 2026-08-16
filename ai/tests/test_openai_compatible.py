"""The OpenAI-compatible client, with the network faked.

No test here reaches a provider: a stub stands in for the SDK's
`chat.completions.create`, so the suite runs with no keys and costs nothing.
"""

from __future__ import annotations

import json
from typing import Any

import pytest

from app.contracts.models import JobDescription
from app.llm.base import LLMError, LLMInvalidOutputError, LLMRefusalError
from app.llm.openai_compatible import OpenAICompatibleClient
from tests.conftest import sample_job_description


class _Message:
    def __init__(self, content: str | None, refusal: str | None = None) -> None:
        self.content = content
        self.refusal = refusal


class _Choice:
    def __init__(self, message: _Message, finish_reason: str = "stop") -> None:
        self.message = message
        self.finish_reason = finish_reason


class _Completion:
    def __init__(self, choices: list[_Choice]) -> None:
        self.choices = choices


class _Completions:
    """Stands in for `AsyncOpenAI().chat.completions`."""

    def __init__(self, result: Any = None, error: Exception | None = None) -> None:
        self._result = result
        self._error = error
        self.kwargs: dict[str, Any] = {}

    async def create(self, **kwargs: Any) -> Any:
        self.kwargs = kwargs
        if self._error is not None:
            raise self._error
        return self._result


def _client(
    result: Any = None, error: Exception | None = None
) -> tuple[OpenAICompatibleClient, _Completions]:
    client = OpenAICompatibleClient(
        api_key="test-key",
        base_url="https://example.invalid/v1",
        model="test-model",
        max_tokens=1024,
        timeout_seconds=5.0,
        label="TestProvider",
    )
    completions = _Completions(result=result, error=error)
    # Replace the SDK's transport, keeping every code path above it real.
    client._client.chat.completions = completions  # type: ignore[assignment]
    return client, completions


def _body(payload: dict[str, Any]) -> _Completion:
    return _Completion([_Choice(_Message(json.dumps(payload)))])


def _well_formed_payload() -> dict[str, Any]:
    jd = sample_job_description()
    return jd.model_dump(mode="json", exclude={"id", "meta", "schema_version"})


async def test_parses_a_well_formed_reply_into_the_contract_model() -> None:
    client, _ = _client(_body(_well_formed_payload()))

    result = await client.structured(system="system", prompt="prompt", schema=JobDescription)

    assert isinstance(result, JobDescription)
    assert result.title == "Senior Backend Engineer"
    assert result.requirements[0].id == "req_python_5y"


async def test_sends_a_strict_json_schema_for_the_contract() -> None:
    client, completions = _client(_body(_well_formed_payload()))

    await client.structured(system="system", prompt="prompt", schema=JobDescription)

    response_format = completions.kwargs["response_format"]
    assert response_format["type"] == "json_schema"
    assert response_format["json_schema"]["strict"] is True
    assert response_format["json_schema"]["name"] == "JobDescription"
    assert completions.kwargs["model"] == "test-model"


async def test_rejects_json_that_violates_the_contract() -> None:
    payload = _well_formed_payload()
    payload["seniority"] = "wizard"  # not a member of the Seniority enum

    client, _ = _client(_body(payload))

    with pytest.raises(LLMInvalidOutputError) as excinfo:
        await client.structured(system="s", prompt="p", schema=JobDescription)

    # The message must name the offending field, or it is useless in a log.
    assert "seniority" in str(excinfo.value)


async def test_rejects_unknown_fields_rather_than_dropping_them() -> None:
    payload = _well_formed_payload()
    payload["salary_expectation"] = "lots"  # hallucinated key

    client, _ = _client(_body(payload))

    with pytest.raises(LLMInvalidOutputError) as excinfo:
        await client.structured(system="s", prompt="p", schema=JobDescription)

    assert "salary_expectation" in str(excinfo.value)


async def test_rejects_a_body_that_is_not_json() -> None:
    client, _ = _client(_Completion([_Choice(_Message("Sure! Here's the JD:"))]))

    with pytest.raises(LLMInvalidOutputError, match="valid JSON"):
        await client.structured(system="s", prompt="p", schema=JobDescription)


async def test_truncation_is_reported_as_truncation() -> None:
    body = _Completion([_Choice(_Message('{"title": "Senior'), finish_reason="length")])
    client, _ = _client(body)

    with pytest.raises(LLMInvalidOutputError, match="max_tokens"):
        await client.structured(system="s", prompt="p", schema=JobDescription)


async def test_a_refusal_is_its_own_error() -> None:
    body = _Completion([_Choice(_Message(None, refusal="I can't help with that."))])
    client, _ = _client(body)

    with pytest.raises(LLMRefusalError):
        await client.structured(system="s", prompt="p", schema=JobDescription)


async def test_an_empty_reply_is_invalid_output() -> None:
    client, _ = _client(_Completion([_Choice(_Message("   "))]))

    with pytest.raises(LLMInvalidOutputError, match="empty"):
        await client.structured(system="s", prompt="p", schema=JobDescription)


async def test_no_choices_is_invalid_output() -> None:
    client, _ = _client(_Completion([]))

    with pytest.raises(LLMInvalidOutputError, match="no choices"):
        await client.structured(system="s", prompt="p", schema=JobDescription)


async def test_transport_failures_surface_as_llm_errors() -> None:
    client, _ = _client(error=RuntimeError("connection reset"))

    with pytest.raises(LLMError, match="TestProvider request failed"):
        await client.structured(system="s", prompt="p", schema=JobDescription)
