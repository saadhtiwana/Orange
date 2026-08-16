"""`LLMClient` for any OpenAI-compatible chat-completions endpoint.

xAI (Grok), Google Gemini and OpenRouter all expose the OpenAI wire format, so
one implementation covers all three — they differ only in base URL, model id and
credentials, which the factory supplies.

The contract is enforced in one place, at the bottom of `structured`: whatever
comes back is parsed as JSON and validated against the Pydantic model. A caller
gets a conforming instance or an `LLMError` — never a half-parsed dict.
"""

from __future__ import annotations

import json
from typing import Any, cast

from openai import AsyncOpenAI
from pydantic import ValidationError

from app.llm.base import (
    LLMError,
    LLMInvalidOutputError,
    LLMRefusalError,
    ModelT,
)
from app.llm.json_schema import SERVER_OWNED, to_strict_schema

_MAX_REPORTED_ERRORS = 5


def _describe(exc: ValidationError) -> str:
    """Flatten a ValidationError into `field.path: reason` pairs.

    Kept readable on purpose: when a provider drifts from the contract this
    string is what tells you which field to fix in the prompt.
    """
    reported = [
        f"{'.'.join(str(part) for part in error['loc']) or '<root>'}: {error['msg']}"
        for error in exc.errors()[:_MAX_REPORTED_ERRORS]
    ]
    hidden = exc.error_count() - len(reported)
    if hidden > 0:
        reported.append(f"(+{hidden} more)")
    return "; ".join(reported)


class OpenAICompatibleClient:
    """Structured output over the OpenAI chat-completions API."""

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        model: str,
        max_tokens: int,
        timeout_seconds: float,
        label: str,
        default_headers: dict[str, str] | None = None,
    ) -> None:
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout_seconds,
            default_headers=default_headers,
        )
        self._model = model
        self._max_tokens = max_tokens
        self._label = label

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
        response_format = {
            "type": "json_schema",
            "json_schema": {
                "name": schema.__name__,
                "schema": to_strict_schema(schema, exclude=SERVER_OWNED),
                "strict": True,
            },
        }

        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                max_tokens=self._max_tokens,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                response_format=cast(Any, response_format),
            )
        except Exception as exc:
            # Re-raised as our own type so callers never import a provider SDK
            # just to catch its errors.
            raise LLMError(f"{self._label} request failed: {exc}") from exc

        if not response.choices:
            raise LLMInvalidOutputError(f"{self._label} returned no choices.")

        choice = response.choices[0]
        message = choice.message

        # Order matters: a refusal or a truncation explains an unparseable body,
        # so report those before blaming the JSON.
        refusal = getattr(message, "refusal", None)
        if refusal:
            raise LLMRefusalError(f"The model declined this request: {refusal}")
        if choice.finish_reason == "length":
            raise LLMInvalidOutputError(
                "The model hit max_tokens before completing the object. "
                "Raise LLM_MAX_TOKENS or shorten the input."
            )

        content = message.content
        if not content or not content.strip():
            raise LLMInvalidOutputError(f"{self._label} returned an empty message.")

        try:
            payload = json.loads(content)
        except json.JSONDecodeError as exc:
            raise LLMInvalidOutputError(f"{self._label} did not return valid JSON: {exc}") from exc

        try:
            return schema.model_validate(payload)
        except ValidationError as exc:
            raise LLMInvalidOutputError(
                f"{self._label} returned JSON that violates {schema.__name__}: {_describe(exc)}"
            ) from exc
