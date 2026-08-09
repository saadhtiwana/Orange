"""The LLM interface the rest of the service codes against.

Everything above this layer asks for "a validated instance of this contract
model" and never sees a provider SDK. Swapping providers means adding one
implementation of `LLMClient`, not touching the routers.
"""

from __future__ import annotations

from typing import Protocol, TypeVar

from pydantic import BaseModel

ModelT = TypeVar("ModelT", bound=BaseModel)


class LLMError(RuntimeError):
    """Base class for every failure originating in the LLM layer."""


class LLMNotConfiguredError(LLMError):
    """No credentials for the configured provider."""


class LLMRefusalError(LLMError):
    """The provider declined the request on policy grounds."""


class LLMInvalidOutputError(LLMError):
    """The provider replied, but not with something matching the contract."""


class LLMClient(Protocol):
    """A provider that can return structured, schema-validated output."""

    @property
    def model(self) -> str:
        """Identifier of the model in use, recorded in contract metadata."""
        ...

    async def structured(
        self,
        *,
        system: str,
        prompt: str,
        schema: type[ModelT],
    ) -> ModelT:
        """Return an instance of `schema`, validated, or raise `LLMError`."""
        ...
