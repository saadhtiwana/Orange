# Shared contracts

Three data shapes are the interface between every vertical in Orange:

| Contract           | Produced by            | Consumed by                        |
| ------------------ | ---------------------- | ---------------------------------- |
| `JobDescription`   | Job Architect (`ai/`)  | Web UI, persistence, the ranker    |
| `CandidateProfile` | CV parser (`ai/`)      | The ranker, candidate profile UI   |
| `ScoreWithEvidence`| Ranker (`ai/`)         | Shortlist UI, audit views          |

If you are about to define a type describing a job, a candidate, or a score — stop and use these instead. Duplicating them is how the verticals drift apart.

## One source of truth, two generated artifacts

```
ai/app/contracts/models.py          ← SOURCE OF TRUTH (Pydantic v2)
        │
        ├─ uv run python scripts/export_schemas.py
        │        ↓
        │  contracts/*.schema.json   ← generated, committed
        │        │
        │        └─ npm run gen:contracts
        │                 ↓
        │           web/lib/contracts/types.ts   ← generated, committed
```

Pydantic is the source of truth rather than a neutral JSON Schema file because the models do real work at runtime: they are what validates untrusted LLM output at the boundary where it enters the system. A hand-written schema would need a second, separately-maintained validator to do the same job.

`contracts/` holds one readable schema per contract plus `orange.schema.json`, a bundle of all three sharing a single `$defs` block. The bundle exists only for TypeScript codegen — compiling the three separately would emit `Compensation`, `Requirement` and friends once per file and collide on import. Read the per-contract files; ignore the bundle.

**Never hand-edit `contracts/*.schema.json` or `web/lib/contracts/types.ts`.** CI regenerates both and fails the build if the result differs from what is committed.

## Changing a contract

1. Edit `ai/app/contracts/models.py`.
2. `cd ai && uv run python scripts/export_schemas.py`
3. `cd web && npm run gen:contracts`
4. Commit the models *and* both generated artifacts in the same commit.

A change that removes or renames a field is a breaking change for the other verticals. Bump `SCHEMA_VERSION` in `models.py` and say so in the PR description.

## The design rule that ties them together

A `JobDescription` breaks a role into `Requirement` objects with stable ids. A `ScoreWithEvidence` points back at those ids and attaches a verbatim `quote` from the CV to every claim.

```
JobDescription.requirements[].id  ──────┐
                                        │  (join key)
ScoreWithEvidence.requirement_results[].requirement_id  ←┘
        └─ .evidence[].quote   ← verbatim from CandidateProfile.raw_text
```

That is what makes a ranking auditable rather than a black box: for any score, you can walk from the number to the requirement it addresses to the exact line of the CV that justifies it.

Two consequences worth respecting:

- **Requirement ids are permanent.** Once a job description is saved, its requirement ids are referenced by every score against it. Never reuse an id for a different requirement.
- **Evidence must be verifiable.** `quote` is copied verbatim and should appear in `CandidateProfile.raw_text`. `ProfileSource.text_sha256` records which document that text came from, so a quote can be checked against the source rather than trusted.

### `Evidence.polarity`

Evidence can `support` a claim, `contradict` it, or record an `absent` signal ("the CV never mentions Kubernetes"). The third value is why the evidence trail is honest: without it, a model can only cite what helps a candidate, and gaps become invisible.

## JobDescription

The output of the Job Architect.

| Field                | Notes                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| `title`, `summary`   | Required. `summary` is what a candidate reads.                            |
| `seniority`          | `intern` … `exec`                                                        |
| `employment_type`    | `full_time`, `part_time`, `contract`, `internship`, `temporary`          |
| `work_mode`          | `onsite`, `hybrid`, `remote`                                             |
| `requirements[]`     | The scoreable unit. See below.                                            |
| `education`          | `minimum_level` plus acceptable `fields`                                  |
| `experience_years`   | `min` / `max`, both optional                                             |
| `compensation`       | Null when the recruiter did not discuss pay — not zero                    |
| `meta`               | Stamped server-side: model, prompt version, timestamp                     |

### `Requirement`

| Field        | Notes                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| `id`         | `req_<lower_snake_case>`, stable forever                                      |
| `kind`       | `skill`, `experience`, `education`, `certification`, `language`, `logistics` |
| `label`      | Human-readable: "Python, 5+ years"                                            |
| `importance` | `must_have` or `nice_to_have`                                                 |
| `min_years`  | Optional                                                                      |
| `weight`     | 0–1, the requirement's share of the role. Weights should sum to roughly 1.     |

The architect proposes `weight`; the ranker consumes it. Neither infers it from `importance`.

## CandidateProfile

The output of the CV parser. `work_experience[]`, `education[]`, `skills[]`, and `certifications[]` carry the structured record; `raw_text` carries the extracted document so evidence quotes can be verified against it.

Dates are calendar months (`"2024-07"`), never full dates — CVs almost never carry day precision, and inventing one would fabricate evidence.

### Grades

`Education.gpa` has **no upper bound**, and `Education.gpa_scale` records what the number means (`"4.0"`, `"5.0"`, `"10.0"`, `"100"`).

Grading scales differ by country: 4.0 and 5.0 scales, CGPA out of 10, and raw percentages all appear on real CVs. An upper bound of 5 would not merely clamp an 8.5 CGPA — because these models are strict, it would raise a validation error and reject the **entire candidate profile** over one field.

Copy the scale the CV states; never convert between scales. A `gpa` without a `gpa_scale` is unscaled and should not be compared against anything.

## ScoreWithEvidence

The output of the ranker.

- `overall` — 0–100 score, a `band`, and a confidence.
- `dimensions[]` — one entry per scoring dimension (`skills`, `experience`, `education`, `logistics`), each with its own score, weight, rationale, and evidence.
- `requirement_results[]` — per-requirement outcome (`yes` / `partial` / `no` / `unknown`) with evidence.
- `strengths`, `gaps`, `risks` — short summaries for the shortlist view.

## Strictness

Every contract model sets `extra="forbid"`. This is load-bearing, not stylistic: these models parse LLM output, and forbidding unknown keys turns a hallucinated field into a loud validation error instead of silently dropped data.

Numeric bounds (`0 ≤ weight ≤ 1`, `0 ≤ score ≤ 100`) are enforced by Pydantic. JSON Schema drops some of these constraints when the schema is sent to the model, so the Python SDK validates them client-side on the way back — a model that returns `weight: 1.5` produces an error, not a bad ranking.
