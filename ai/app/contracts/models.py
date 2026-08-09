"""Shared data contracts: JobDescription, CandidateProfile, ScoreWithEvidence.

These three models are the interface every Orange vertical codes against.

The design rule that ties them together: a `JobDescription` breaks the role into
`Requirement` objects with stable ids, and every claim in a `ScoreWithEvidence`
points back at one of those ids and carries a verbatim `quote` from the CV. That
is what makes a ranking auditable rather than a black box.

Changing anything here is a breaking change for web/ and ai/ alike. Bump
`schema_version` and regenerate the downstream artifacts.
"""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field

SCHEMA_VERSION = "1.0"

# A calendar month, e.g. "2024-07". Deliberately not a full date: CVs almost
# never carry day precision, and inventing one would fabricate evidence.
MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"


class ContractModel(BaseModel):
    """Base for every contract model.

    `extra="forbid"` is load-bearing rather than stylistic: these models parse
    LLM output, and forbidding unknown keys turns a hallucinated field into a
    validation error instead of silently dropped data.
    """

    model_config = ConfigDict(extra="forbid", use_enum_values=False)


# ---------------------------------------------------------------------------
# Shared enumerations
# ---------------------------------------------------------------------------


class Seniority(StrEnum):
    INTERN = "intern"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    STAFF = "staff"
    PRINCIPAL = "principal"
    LEAD = "lead"
    DIRECTOR = "director"
    EXEC = "exec"


class EmploymentType(StrEnum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    TEMPORARY = "temporary"


class WorkMode(StrEnum):
    ONSITE = "onsite"
    HYBRID = "hybrid"
    REMOTE = "remote"


class DegreeLevel(StrEnum):
    NONE = "none"
    HIGH_SCHOOL = "high_school"
    ASSOCIATE = "associate"
    BACHELOR = "bachelor"
    MASTER = "master"
    DOCTORATE = "doctorate"


class LanguageProficiency(StrEnum):
    BASIC = "basic"
    CONVERSATIONAL = "conversational"
    PROFESSIONAL = "professional"
    NATIVE = "native"


class RequirementKind(StrEnum):
    SKILL = "skill"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    CERTIFICATION = "certification"
    LANGUAGE = "language"
    LOGISTICS = "logistics"


class Importance(StrEnum):
    MUST_HAVE = "must_have"
    NICE_TO_HAVE = "nice_to_have"


class CompensationPeriod(StrEnum):
    HOUR = "hour"
    MONTH = "month"
    YEAR = "year"


class ScoreBand(StrEnum):
    STRONG = "strong"
    GOOD = "good"
    FAIR = "fair"
    WEAK = "weak"


class ScoreDimension(StrEnum):
    SKILLS = "skills"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    LOGISTICS = "logistics"


class RequirementOutcome(StrEnum):
    YES = "yes"
    PARTIAL = "partial"
    NO = "no"
    UNKNOWN = "unknown"


class EvidencePolarity(StrEnum):
    """Whether a quote backs a claim, undercuts it, or is a noted absence.

    `absent` exists so the model can record "the CV never mentions Kubernetes"
    as a first-class finding instead of staying silent about a gap.
    """

    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    ABSENT = "absent"


class LanguageSkill(ContractModel):
    name: str = Field(description="Language name, e.g. 'German'.")
    proficiency: LanguageProficiency


# ---------------------------------------------------------------------------
# JobDescription
# ---------------------------------------------------------------------------


class Requirement(ContractModel):
    """One scoreable expectation of the role.

    `id` is the join key: `ScoreWithEvidence.requirement_results` references it,
    so it must be stable for the life of the job description.
    """

    id: str = Field(
        pattern=r"^req_[a-z0-9_]+$",
        description="Stable slug, e.g. 'req_python_5y'.",
    )
    kind: RequirementKind
    label: str = Field(description="Human-readable requirement, e.g. 'Python, 5+ years'.")
    importance: Importance
    min_years: float | None = Field(default=None, ge=0, le=60)
    weight: float = Field(
        ge=0,
        le=1,
        description="Relative importance within the role. The ranker consumes this; "
        "the architect proposes it.",
    )


class EducationRequirement(ContractModel):
    minimum_level: DegreeLevel = DegreeLevel.NONE
    fields: list[str] = Field(default_factory=list, description="Acceptable fields of study.")


class ExperienceRange(ContractModel):
    min: float | None = Field(default=None, ge=0, le=60)
    max: float | None = Field(default=None, ge=0, le=60)


class Compensation(ContractModel):
    currency: str = Field(pattern=r"^[A-Z]{3}$", description="ISO 4217 code, e.g. 'EUR'.")
    min: float | None = Field(default=None, ge=0)
    max: float | None = Field(default=None, ge=0)
    period: CompensationPeriod = CompensationPeriod.YEAR


class GenerationMeta(ContractModel):
    model: str = Field(description="Model id that produced this document.")
    prompt_version: str
    generated_at: datetime


class JobDescription(ContractModel):
    """A structured role definition. Output of the Job Architect."""

    schema_version: str = SCHEMA_VERSION
    id: str | None = Field(default=None, description="Set by the persistence layer, not the model.")
    title: str
    seniority: Seniority
    employment_type: EmploymentType
    work_mode: WorkMode
    locations: list[str] = Field(default_factory=list)
    summary: str
    responsibilities: list[str] = Field(default_factory=list)
    requirements: list[Requirement] = Field(default_factory=list)
    education: EducationRequirement = Field(default_factory=EducationRequirement)
    experience_years: ExperienceRange = Field(default_factory=ExperienceRange)
    compensation: Compensation | None = None
    benefits: list[str] = Field(default_factory=list)
    languages: list[LanguageSkill] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    meta: GenerationMeta | None = None


# ---------------------------------------------------------------------------
# CandidateProfile
# ---------------------------------------------------------------------------


class ProfileSource(ContractModel):
    file_name: str
    file_type: str = Field(description="Extension or MIME type, e.g. 'pdf'.")
    parsed_at: datetime
    text_sha256: str | None = Field(
        default=None,
        pattern=r"^[a-f0-9]{64}$",
        description="Hash of the extracted text, so evidence can be verified against "
        "the exact document that produced it.",
    )


class Link(ContractModel):
    label: str
    url: str


class Location(ContractModel):
    city: str | None = None
    country: str | None = None
    timezone: str | None = None


class WorkExperience(ContractModel):
    company: str
    title: str
    start: str | None = Field(default=None, pattern=MONTH_PATTERN)
    end: str | None = Field(default=None, pattern=MONTH_PATTERN)
    is_current: bool = False
    location: str | None = None
    highlights: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class Education(ContractModel):
    institution: str
    degree_level: DegreeLevel
    field: str | None = None
    start: str | None = Field(default=None, pattern=MONTH_PATTERN)
    end: str | None = Field(default=None, pattern=MONTH_PATTERN)
    # Deliberately unbounded above. Grading scales vary by country — 4.0 and
    # 5.0 scales, CGPA out of 10, and raw percentages all appear on real CVs —
    # and because these models are strict, an out-of-range value would fail the
    # whole profile rather than just this field. `gpa_scale` is what makes the
    # number interpretable; without it, treat `gpa` as unscaled and untrusted.
    gpa: float | None = Field(default=None, ge=0)
    gpa_scale: str | None = Field(
        default=None,
        description="Scale the GPA is reported on, e.g. '4.0', '5.0', '10.0', '100'. "
        "Copy what the CV states; do not convert between scales.",
    )


class Skill(ContractModel):
    name: str
    category: str | None = None
    years: float | None = Field(default=None, ge=0, le=60)
    last_used: str | None = Field(default=None, pattern=MONTH_PATTERN)


class Certification(ContractModel):
    name: str
    issuer: str | None = None
    issued: str | None = Field(default=None, pattern=MONTH_PATTERN)
    expires: str | None = Field(default=None, pattern=MONTH_PATTERN)


class Logistics(ContractModel):
    work_authorization: str | None = None
    requires_sponsorship: bool | None = None
    notice_period: str | None = None
    open_to_remote: bool | None = None
    desired_compensation: Compensation | None = None


class CandidateProfile(ContractModel):
    """A parsed CV. Output of the CV parser, input to the ranker."""

    schema_version: str = SCHEMA_VERSION
    id: str | None = None
    source: ProfileSource
    full_name: str
    headline: str | None = None
    emails: list[str] = Field(default_factory=list)
    phones: list[str] = Field(default_factory=list)
    links: list[Link] = Field(default_factory=list)
    location: Location | None = None
    summary: str | None = None
    work_experience: list[WorkExperience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    languages: list[LanguageSkill] = Field(default_factory=list)
    total_years_experience: float | None = Field(default=None, ge=0, le=60)
    logistics: Logistics = Field(default_factory=Logistics)
    raw_text: str | None = Field(
        default=None,
        description="Extracted CV text. Evidence quotes are verified against this.",
    )


# ---------------------------------------------------------------------------
# ScoreWithEvidence
# ---------------------------------------------------------------------------


class Evidence(ContractModel):
    """A verbatim citation backing (or undercutting) a scoring claim."""

    quote: str = Field(
        description="Copied verbatim from the CV. Must appear in CandidateProfile.raw_text."
    )
    locator: str = Field(
        description="Where the quote came from, e.g. 'work_experience[1].highlights[0]' "
        "or 'raw_text'.",
    )
    char_span: tuple[int, int] | None = Field(
        default=None, description="Optional [start, end) offsets into raw_text."
    )
    polarity: EvidencePolarity = EvidencePolarity.SUPPORTS
    confidence: float = Field(ge=0, le=1)
    requirement_id: str | None = Field(
        default=None, description="Requirement this citation speaks to, if any."
    )


class OverallScore(ContractModel):
    score: float = Field(ge=0, le=100)
    band: ScoreBand
    confidence: float = Field(ge=0, le=1)


class DimensionScore(ContractModel):
    dimension: ScoreDimension
    score: float = Field(ge=0, le=100)
    weight: float = Field(ge=0, le=1)
    rationale: str
    evidence: list[Evidence] = Field(default_factory=list)


class RequirementResult(ContractModel):
    requirement_id: str = Field(
        pattern=r"^req_[a-z0-9_]+$",
        description="References JobDescription.requirements[].id.",
    )
    met: RequirementOutcome
    evidence: list[Evidence] = Field(default_factory=list)


class ScoreMeta(ContractModel):
    model: str
    prompt_version: str
    scored_at: datetime
    latency_ms: int | None = Field(default=None, ge=0)


class ScoreWithEvidence(ContractModel):
    """A candidate scored against a job, with citations for every claim.

    Output of the ranker. Every element of `requirement_results` should point at
    a requirement that exists on the job description being scored against.
    """

    schema_version: str = SCHEMA_VERSION
    job_id: str
    candidate_id: str
    overall: OverallScore
    dimensions: list[DimensionScore] = Field(default_factory=list)
    requirement_results: list[RequirementResult] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    summary: str
    meta: ScoreMeta | None = None
