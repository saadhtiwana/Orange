"""Orange AI agent service."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.llm import LLMError, LLMNotConfiguredError, LLMRefusalError
from app.routers import job_architect

app = FastAPI(
    title="Orange AI",
    version="0.1.0",
    description="Job Architect, CV parsing, and ranking for the Orange hiring platform.",
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(LLMError)
async def handle_llm_error(_: Request, exc: LLMError) -> JSONResponse:
    """Map LLM failures onto status codes the web BFF can act on."""
    if isinstance(exc, LLMNotConfiguredError):
        status_code = 503  # our misconfiguration, not the caller's request
    elif isinstance(exc, LLMRefusalError):
        status_code = 422  # the request itself was declined
    else:
        status_code = 502  # upstream provider failed or broke the contract

    return JSONResponse(
        status_code=status_code,
        content={"error": {"type": type(exc).__name__, "message": str(exc)}},
    )


@app.get("/health", tags=["ops"])
async def health() -> dict[str, object]:
    """Liveness plus enough config to debug a bad deploy — never the key itself."""
    return {
        "status": "ok",
        "service": "orange-ai",
        "version": app.version,
        "llm": {
            "provider": settings.llm_provider,
            "model": settings.llm_model,
            "configured": bool(settings.anthropic_api_key),
        },
    }


app.include_router(job_architect.router)
