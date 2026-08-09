"""Anthropic implementation of `LLMClient`."""

from __future__ import annotations

from typing import Any

from anthropic import AsyncAnthropic

from app.llm.base import (
    LLMError,
    LLMInvalidOutputError,
    LLMRefusalError,
    ModelT,
)


class AnthropicClient:
    """Returns contract models via the Messages API's structured output.

    `messages.parse` sends the Pydantic model's JSON Schema with the request and
    validates the reply against it, so a caller either gets a conforming model
    instance or an exception — never a half-parsed dict.
    """

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        max_tokens: int,
        timeout_seconds: float,
    ) -> None:
        self._client = AsyncAnthropic(api_key=api_key, timeout=timeout_seconds)
        self._model = model
        self._max_tokens = max_tokens

    @property
    def model(self) -> str:
        return self._model

    async def structured(
        self,
        *,
        system: str,
        prompt: str,
        schema: type[ModelT],
    ) -> ModelT:
        try:
            response = await self._client.messages.parse(
                model=self._model,
                max_tokens=self._max_tokens,
                system=system,
                messages=[{"role": "user", "content": prompt}],
                output_format=schema,
            )
        except Exception as exc:  # noqa: BLE001 - re-raised as our own error type
            raise LLMError(f"Anthropic request failed: {exc}") from exc

        # Check why generation stopped before touching the content: on a refusal
        # the parsed output is absent, and on max_tokens it is truncated.
        stop_reason: Any = getattr(response, "stop_reason", None)
        if stop_reason == "refusal":
            raise LLMRefusalError("The model declined this request.")
        if stop_reason == "max_tokens":
            raise LLMInvalidOutputError(
                "The model hit max_tokens before completing the object. "
                "Raise LLM_MAX_TOKENS or shorten the input."
            )

        parsed = response.parsed_output
        if parsed is None:
            raise LLMInvalidOutputError("The model returned no schema-conforming output.")
        return parsed
