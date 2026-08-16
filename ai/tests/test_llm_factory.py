"""LLM_PROVIDER selection. No client here opens a connection."""

from __future__ import annotations

import pytest

from app.config import Settings
from app.llm.anthropic_client import AnthropicClient
from app.llm.base import LLMNotConfiguredError
from app.llm.factory import build_llm_client, provider_is_configured
from app.llm.openai_compatible import OpenAICompatibleClient


def _settings(**overrides: object) -> Settings:
    # _env_file=None keeps a developer's real .env out of the test run.
    return Settings(_env_file=None, **overrides)  # type: ignore[arg-type]


@pytest.mark.parametrize(
    ("provider", "base_url"),
    [
        ("grok", "https://api.x.ai/v1"),
        ("xai", "https://api.x.ai/v1"),
        ("gemini", "https://generativelanguage.googleapis.com/v1beta/openai/"),
        ("google", "https://generativelanguage.googleapis.com/v1beta/openai/"),
        ("openrouter", "https://openrouter.ai/api/v1"),
    ],
)
def test_each_alias_selects_its_endpoint(provider: str, base_url: str) -> None:
    client = build_llm_client(
        _settings(
            llm_provider=provider,
            xai_api_key="k",
            gemini_api_key="k",
            openrouter_api_key="k",
        )
    )

    assert isinstance(client, OpenAICompatibleClient)
    assert str(client._client.base_url).rstrip("/") == base_url.rstrip("/")


def test_provider_matching_ignores_case_and_padding() -> None:
    client = build_llm_client(_settings(llm_provider="  GROK ", xai_api_key="k"))

    assert isinstance(client, OpenAICompatibleClient)


def test_anthropic_is_still_available() -> None:
    client = build_llm_client(
        _settings(llm_provider="anthropic", anthropic_api_key="k", llm_model="claude-opus-5")
    )

    assert isinstance(client, AnthropicClient)


def test_the_model_id_comes_from_settings() -> None:
    client = build_llm_client(_settings(llm_provider="grok", llm_model="grok-4", xai_api_key="k"))

    assert client.model == "grok-4"


def test_a_missing_key_names_the_variable_to_set() -> None:
    with pytest.raises(LLMNotConfiguredError, match="XAI_API_KEY"):
        build_llm_client(_settings(llm_provider="grok", xai_api_key=None))


def test_a_missing_key_is_reported_per_provider() -> None:
    with pytest.raises(LLMNotConfiguredError, match="OPENROUTER_API_KEY"):
        build_llm_client(_settings(llm_provider="openrouter", openrouter_api_key=None))


@pytest.mark.parametrize(
    ("provider", "key_field"),
    [
        ("grok", "xai_api_key"),
        ("gemini", "gemini_api_key"),
        ("openrouter", "openrouter_api_key"),
        ("anthropic", "anthropic_api_key"),
    ],
)
def test_configured_reports_on_the_selected_provider(provider: str, key_field: str) -> None:
    """/health must answer for LLM_PROVIDER, not for a hardcoded provider."""
    assert not provider_is_configured(_settings(llm_provider=provider))
    assert provider_is_configured(_settings(llm_provider=provider, **{key_field: "k"}))


def test_a_key_for_a_different_provider_does_not_count_as_configured() -> None:
    settings = _settings(llm_provider="grok", anthropic_api_key="k", xai_api_key=None)

    assert not provider_is_configured(settings)


def test_an_unknown_provider_is_never_configured() -> None:
    assert not provider_is_configured(_settings(llm_provider="llama", xai_api_key="k"))


def test_an_unknown_provider_lists_the_valid_ones() -> None:
    with pytest.raises(LLMNotConfiguredError) as excinfo:
        build_llm_client(_settings(llm_provider="llama"))

    message = str(excinfo.value)
    assert "llama" in message
    assert "anthropic" in message and "grok" in message
