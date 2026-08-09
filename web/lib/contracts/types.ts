/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source of truth: ai/app/contracts/models.py
 * Regenerate:      npm run gen:contracts
 */

export type DegreeLevel =
  "none" | "high_school" | "associate" | "bachelor" | "master" | "doctorate";
export type LanguageProficiency = "basic" | "conversational" | "professional" | "native";
export type CompensationPeriod = "hour" | "month" | "year";
export type DegreeLevel1 =
  "none" | "high_school" | "associate" | "bachelor" | "master" | "doctorate";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "temporary";
export type Importance = "must_have" | "nice_to_have";
export type RequirementKind =
  "skill" | "experience" | "education" | "certification" | "language" | "logistics";
export type Seniority =
  "intern" | "junior" | "mid" | "senior" | "staff" | "principal" | "lead" | "director" | "exec";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type ScoreDimension = "skills" | "experience" | "education" | "logistics";
/**
 * Whether a quote backs a claim, undercuts it, or is a noted absence.
 *
 * `absent` exists so the model can record "the CV never mentions Kubernetes"
 * as a first-class finding instead of staying silent about a gap.
 */
export type EvidencePolarity = "supports" | "contradicts" | "absent";
export type ScoreBand = "strong" | "good" | "fair" | "weak";
export type RequirementOutcome = "yes" | "partial" | "no" | "unknown";

/**
 * Codegen bundle. Read the per-contract schemas instead.
 */
export interface OrangeContracts {
  candidate_profile: CandidateProfile;
  job_description: JobDescription;
  score_with_evidence: ScoreWithEvidence;
}
/**
 * A parsed CV. Output of the CV parser, input to the ranker.
 */
export interface CandidateProfile {
  certifications?: Certification[];
  education?: Education[];
  emails?: string[];
  full_name: string;
  headline?: string | null;
  id?: string | null;
  languages?: LanguageSkill[];
  links?: Link[];
  location?: Location | null;
  logistics?: Logistics;
  phones?: string[];
  /**
   * Extracted CV text. Evidence quotes are verified against this.
   */
  raw_text?: string | null;
  schema_version?: string;
  skills?: Skill[];
  source: ProfileSource;
  summary?: string | null;
  total_years_experience?: number | null;
  work_experience?: WorkExperience[];
}
export interface Certification {
  expires?: string | null;
  issued?: string | null;
  issuer?: string | null;
  name: string;
}
export interface Education {
  degree_level: DegreeLevel;
  end?: string | null;
  field?: string | null;
  gpa?: number | null;
  /**
   * Scale the GPA is reported on, e.g. '4.0', '5.0', '10.0', '100'. Copy what the CV states; do not convert between scales.
   */
  gpa_scale?: string | null;
  institution: string;
  start?: string | null;
}
export interface LanguageSkill {
  /**
   * Language name, e.g. 'German'.
   */
  name: string;
  proficiency: LanguageProficiency;
}
export interface Link {
  label: string;
  url: string;
}
export interface Location {
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
}
export interface Logistics {
  desired_compensation?: Compensation | null;
  notice_period?: string | null;
  open_to_remote?: boolean | null;
  requires_sponsorship?: boolean | null;
  work_authorization?: string | null;
}
export interface Compensation {
  /**
   * ISO 4217 code, e.g. 'EUR'.
   */
  currency: string;
  max?: number | null;
  min?: number | null;
  period?: CompensationPeriod;
}
export interface Skill {
  category?: string | null;
  last_used?: string | null;
  name: string;
  years?: number | null;
}
export interface ProfileSource {
  file_name: string;
  /**
   * Extension or MIME type, e.g. 'pdf'.
   */
  file_type: string;
  parsed_at: string;
  /**
   * Hash of the extracted text, so evidence can be verified against the exact document that produced it.
   */
  text_sha256?: string | null;
}
export interface WorkExperience {
  company: string;
  end?: string | null;
  highlights?: string[];
  is_current?: boolean;
  location?: string | null;
  skills?: string[];
  start?: string | null;
  title: string;
}
/**
 * A structured role definition. Output of the Job Architect.
 */
export interface JobDescription {
  benefits?: string[];
  compensation?: Compensation | null;
  education?: EducationRequirement;
  employment_type: EmploymentType;
  experience_years?: ExperienceRange;
  /**
   * Set by the persistence layer, not the model.
   */
  id?: string | null;
  keywords?: string[];
  languages?: LanguageSkill[];
  locations?: string[];
  meta?: GenerationMeta | null;
  requirements?: Requirement[];
  responsibilities?: string[];
  schema_version?: string;
  seniority: Seniority;
  summary: string;
  title: string;
  work_mode: WorkMode;
}
export interface EducationRequirement {
  /**
   * Acceptable fields of study.
   */
  fields?: string[];
  minimum_level?: DegreeLevel1;
}
export interface ExperienceRange {
  max?: number | null;
  min?: number | null;
}
export interface GenerationMeta {
  generated_at: string;
  /**
   * Model id that produced this document.
   */
  model: string;
  prompt_version: string;
}
/**
 * One scoreable expectation of the role.
 *
 * `id` is the join key: `ScoreWithEvidence.requirement_results` references it,
 * so it must be stable for the life of the job description.
 */
export interface Requirement {
  /**
   * Stable slug, e.g. 'req_python_5y'.
   */
  id: string;
  importance: Importance;
  kind: RequirementKind;
  /**
   * Human-readable requirement, e.g. 'Python, 5+ years'.
   */
  label: string;
  min_years?: number | null;
  /**
   * Relative importance within the role. The ranker consumes this; the architect proposes it.
   */
  weight: number;
}
/**
 * A candidate scored against a job, with citations for every claim.
 *
 * Output of the ranker. Every element of `requirement_results` should point at
 * a requirement that exists on the job description being scored against.
 */
export interface ScoreWithEvidence {
  candidate_id: string;
  dimensions?: DimensionScore[];
  gaps?: string[];
  job_id: string;
  meta?: ScoreMeta | null;
  overall: OverallScore;
  requirement_results?: RequirementResult[];
  risks?: string[];
  schema_version?: string;
  strengths?: string[];
  summary: string;
}
export interface DimensionScore {
  dimension: ScoreDimension;
  evidence?: Evidence[];
  rationale: string;
  score: number;
  weight: number;
}
/**
 * A verbatim citation backing (or undercutting) a scoring claim.
 */
export interface Evidence {
  /**
   * Optional [start, end) offsets into raw_text.
   */
  char_span?: [unknown, unknown] | null;
  confidence: number;
  /**
   * Where the quote came from, e.g. 'work_experience[1].highlights[0]' or 'raw_text'.
   */
  locator: string;
  polarity?: EvidencePolarity;
  /**
   * Copied verbatim from the CV. Must appear in CandidateProfile.raw_text.
   */
  quote: string;
  /**
   * Requirement this citation speaks to, if any.
   */
  requirement_id?: string | null;
}
export interface ScoreMeta {
  latency_ms?: number | null;
  model: string;
  prompt_version: string;
  scored_at: string;
}
export interface OverallScore {
  band: ScoreBand;
  confidence: number;
  score: number;
}
export interface RequirementResult {
  evidence?: Evidence[];
  met: RequirementOutcome;
  /**
   * References JobDescription.requirements[].id.
   */
  requirement_id: string;
}
