"""Runtime configuration, read from the environment."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    """Environment-backed settings. See .env.example for the full key list."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # The service starts without a key so /health and the test suite work
    # offline; only the endpoints that actually call an LLM require one.
    anthropic_api_key: str | None = None
    xai_api_key: str | None = None
    gemini_api_key: str | None = None
    openrouter_api_key: str | None = None

    # xAI, Gemini and OpenRouter all speak the OpenAI wire format, so they share
    # one client and differ only in where it points.
    xai_base_url: str = "https://api.x.ai/v1"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    llm_provider: str = "grok"
    llm_model: str = "grok-4"
    # Generous, because on this model max_tokens caps thinking *and* the
    # response together — a tight budget truncates the JD mid-object.
    llm_max_tokens: int = 16000
    llm_timeout_seconds: float = 120.0

    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    prompts_dir: Path = APP_DIR / "prompts"


@lru_cache
def get_settings() -> Settings:
    return Settings()
