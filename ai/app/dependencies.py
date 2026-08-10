"""Shared FastAPI dependencies.

`get_llm_client` is the seam the test suite overrides, which is why the routers
depend on it rather than constructing a client themselves.
"""

from __future__ import annotations

from app.config import get_settings
from app.llm import LLMClient, build_llm_client


def get_llm_client() -> LLMClient:
    return build_llm_client(get_settings())
