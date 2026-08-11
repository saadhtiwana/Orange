# Mock API

Contract-shaped endpoints under `/api/mock/*` that serve hand-written fixture
data, so every screen can be built before the CV parser and ranker exist.
Responses use the exact types in `web/lib/contracts/types.ts` (generated from
the contracts) plus the pipeline shapes in `web/lib/pipeline/types.ts`. When a
real endpoint ships, consumers switch the URL and change nothing else.

State is in-memory: stage moves persist across requests but reset when the dev
server restarts. Fixtures live in `web/lib/mock/fixtures.ts` — one job, eight
candidates, six scores (two candidates are deliberately unscored to exercise
the "still ranking" state). Tests in `web/lib/mock/fixtures.test.ts` enforce
the contract invariants: evidence quotes appear verbatim in `raw_text`, and
every requirement result references a requirement on the job.

## Endpoints

| Method  | Path                       | Returns                                                       |
| ------- | -------------------------- | ------------------------------------------------------------- |
| `GET`   | `/api/mock/jobs`           | `{ jobs: JobDescription[] }`                                  |
| `GET`   | `/api/mock/jobs/:id`       | `{ job: JobDescription }` — 404 if unknown                    |
| `GET`   | `/api/mock/candidates`     | `{ candidates: CandidateProfile[] }` without `raw_text`       |
| `GET`   | `/api/mock/candidates/:id` | `{ candidate, scores: ScoreWithEvidence[] }` — full profile   |
| `GET`   | `/api/mock/pipeline`       | `PipelineBoard` — `?jobId=` optional, defaults to the mock job |
| `PATCH` | `/api/mock/pipeline`       | `{ card: PipelineCard }` — moves a candidate between stages   |

`PATCH /api/mock/pipeline` body:

```json
{ "candidateId": "cand_01", "stage": "interview", "jobId": "job_mock_backend" }
```

`jobId` is optional (defaults to the mock job). Stages, in board order:
`applied`, `shortlisted`, `interview`, `offer`, `rejected`. Invalid stages get
a 400 listing the valid ones; unknown ids get a 404.

## Try it

```bash
cd web && npm run dev

curl localhost:3000/api/mock/pipeline
curl localhost:3000/api/mock/candidates/cand_01
curl -X PATCH localhost:3000/api/mock/pipeline \
  -H 'Content-Type: application/json' \
  -d '{"candidateId":"cand_01","stage":"interview"}'
```
