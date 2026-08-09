"""Runtime configuration, read from the environment."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

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

    llm_provider: str = "anthropic"
    llm_model: str = "claude-opus-5"
    # Generous, because on this model max_tokens caps thinking *and* the
    # response together — a tight budget truncates the JD mid-object.
    llm_max_tokens: int = 16000
    llm_timeout_seconds: float = 120.0

    cors_origins: list[str] = ["http://localhost:3000"]
    prompts_dir: Path = APP_DIR / "prompts"


@lru_cache
def get_settings() -> Settings:
    return Settings()
