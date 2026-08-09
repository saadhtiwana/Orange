"""Provider selection."""

from __future__ import annotations

from app.config import Settings
from app.llm.anthropic_client import AnthropicClient
from app.llm.base import LLMClient, LLMNotConfiguredError


def build_llm_client(settings: Settings) -> LLMClient:
    """Construct the client for the configured provider.

    Raises `LLMNotConfiguredError` when credentials are missing, so a
    misconfigured deployment fails at the request that needs the key rather
    than at import time (which would take /health down with it).
    """
    provider = settings.llm_provider.lower()

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

    raise LLMNotConfiguredError(f"Unknown LLM_PROVIDER: {settings.llm_provider!r}")
