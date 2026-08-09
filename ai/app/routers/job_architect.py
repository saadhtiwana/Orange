"""POST /job/architect — turn a recruiter's brief into a structured JD."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.contracts.models import GenerationMeta, JobDescription
from app.dependencies import get_llm_client
from app.llm import LLMClient
from app.prompts import load_prompt

router = APIRouter(prefix="/job", tags=["job-intelligence"])

PROMPT_NAME = "job_architect"


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class JobArchitectRequest(BaseModel):
    brief: str = Field(
        min_length=1,
        description="What the recruiter just said about the role.",
    )
    history: list[ChatTurn] = Field(
        default_factory=list,
        description="Prior turns, oldest first. The service is stateless; "
        "the caller owns the conversation.",
    )


class JobArchitectResponse(BaseModel):
    job_description: JobDescription


def _build_conversation(request: JobArchitectRequest) -> str:
    lines: list[str] = []
    for turn in request.history:
        speaker = "Recruiter" if turn.role == "user" else "Job Architect"
        lines.append(f"{speaker}: {turn.content}")
    lines.append(f"Recruiter: {request.brief}")
    return "\n\n".join(lines)


@router.post("/architect", response_model=JobArchitectResponse)
async def architect_job(
    request: JobArchitectRequest,
    llm: LLMClient = Depends(get_llm_client),
) -> JobArchitectResponse:
    """Draft a contract-conforming JobDescription from a recruiter's brief."""
    prompt = load_prompt(PROMPT_NAME)

    job_description = await llm.structured(
        system=prompt.text,
        prompt=_build_conversation(request),
        schema=JobDescription,
    )

    # Stamp provenance server-side rather than trusting the model to report
    # which model and prompt produced it.
    job_description.meta = GenerationMeta(
        model=llm.model,
        prompt_version=prompt.version,
        generated_at=datetime.now(UTC),
    )

    return JobArchitectResponse(job_description=job_description)
