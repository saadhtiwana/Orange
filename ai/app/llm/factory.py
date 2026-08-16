"""Provider selection."""

from __future__ import annotations

from dataclasses import dataclass

from app.config import Settings
from app.llm.anthropic_client import AnthropicClient
from app.llm.base import LLMClient, LLMNotConfiguredError
from app.llm.openai_compatible import OpenAICompatibleClient


@dataclass(frozen=True)
class _Endpoint:
    """Everything that distinguishes one OpenAI-compatible provider from another."""

    label: str
    env_var: str
    api_key: str | None
    base_url: str
    headers: dict[str, str] | None = None


# Accepted values of LLM_PROVIDER, mapped to their canonical name. Aliases exist
# because "grok" is the model and "xai" the vendor, and both get typed.
_ALIASES: dict[str, str] = {
    "grok": "xai",
    "xai": "xai",
    "gemini": "gemini",
    "google": "gemini",
    "openrouter": "openrouter",
}


def _endpoints(settings: Settings) -> dict[str, _Endpoint]:
    return {
        "xai": _Endpoint(
            label="xAI (Grok)",
            env_var="XAI_API_KEY",
            api_key=settings.xai_api_key,
            base_url=settings.xai_base_url,
        ),
        "gemini": _Endpoint(
            label="Google Gemini",
            env_var="GEMINI_API_KEY",
            api_key=settings.gemini_api_key,
            base_url=settings.gemini_base_url,
        ),
        "openrouter": _Endpoint(
            label="OpenRouter",
            env_var="OPENROUTER_API_KEY",
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url,
            # OpenRouter attributes usage to a referring app when these are set.
            headers={
                "HTTP-Referer": "https://github.com/orange",
                "X-Title": "Orange",
            },
        ),
    }


def provider_is_configured(settings: Settings) -> bool:
    """Whether the *selected* provider has a key.

    Used by /health, which must answer for whichever provider LLM_PROVIDER
    names — reporting on a hardcoded one makes a healthy deploy look broken
    and, worse, a broken one look fine.
    """
    provider = settings.llm_provider.lower().strip()
    if provider == "anthropic":
        return bool(settings.anthropic_api_key)

    canonical = _ALIASES.get(provider)
    if canonical is None:
        return False
    return bool(_endpoints(settings)[canonical].api_key)


def build_llm_client(settings: Settings) -> LLMClient:
    """Construct the client for the configured provider.

    Raises `LLMNotConfiguredError` when credentials are missing, so a
    misconfigured deployment fails at the request that needs the key rather
    than at import time (which would take /health down with it).
    """
    provider = settings.llm_provider.lower().strip()

    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise LLMNotConfiguredError(
                "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
            )
        return AnthropicClient(
            api_key=settings.anthropic_api_key,
            model=settings.llm_model,
            max_tokens=settings.llm_max_tokens,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    canonical = _ALIASES.get(provider)
    if canonical is None:
        known = ", ".join(sorted({*_ALIASES, "anthropic"}))
        raise LLMNotConfiguredError(
            f"Unknown LLM_PROVIDER: {settings.llm_provider!r}. Expected one of: {known}."
        )

    endpoint = _endpoints(settings)[canonical]
    if not endpoint.api_key:
        raise LLMNotConfiguredError(
            f"{endpoint.env_var} is not set, but LLM_PROVIDER={settings.llm_provider!r} "
            f"selects {endpoint.label}. Copy .env.example to .env and add your key."
        )

    return OpenAICompatibleClient(
        api_key=endpoint.api_key,
        base_url=endpoint.base_url,
        model=settings.llm_model,
        max_tokens=settings.llm_max_tokens,
        timeout_seconds=settings.llm_timeout_seconds,
        label=endpoint.label,
        default_headers=endpoint.headers,
    )
