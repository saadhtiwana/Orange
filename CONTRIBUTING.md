# Contributing to Orange

## Branch → PR → review

`main` is protected. Nothing lands on it directly.

1. **Branch off `main`.** Name it for the change: `feat/job-intelligence`, `fix/cv-parser-dates`. Not `malik/week-2`.
2. **Commit as you go**, in small conventional commits — see below.
3. **Run the checks locally** before you push (the same ones CI runs):
   ```bash
   cd web && npm run lint && npm run format:check && npm run typecheck && npm test && npm run build
   cd ai  && uv run ruff check . && uv run ruff format --check . && uv run mypy app scripts && uv run pytest
   ```
4. **Open a PR against `main`**, filling in the template. Title it by what the code does.
5. **One approving review** from another engineer is required. CI must be green — the `web`, `ai`, and `contracts` checks are required and block the merge.
6. **The author does not merge their own PR.** The reviewer merges.

## Conventional commits

Every commit message is `type: what the code does`, in the imperative.

| Type    | Use for                                                        |
| ------- | -------------------------------------------------------------- |
| `feat`  | New behaviour a user or another vertical can observe            |
| `fix`   | A bug fix                                                       |
| `chore` | Tooling, config, dependencies                                   |
| `ci`    | CI workflow changes                                             |
| `docs`  | Documentation only                                              |
| `test`  | Tests only                                                      |

```
feat: add Job Architect endpoint
fix: preserve trailing months when parsing CV date ranges
ci: cache uv downloads between runs
```

Name commits and PRs by **what the code does**, never by week, phase, or sprint. `feat: add Job Architect endpoint`, not `week 2 work` or `phase 1 complete`.

Keep commits small — one meaningful unit each. A schema, an endpoint, a config file. Reviewers read diffs, not squashed mega-commits.

## Ownership

Three engineers own three verticals; the shared foundation is reviewed by whoever owns the piece you touched.

| Area                                             | Owner                       |
| ------------------------------------------------ | --------------------------- |
| `contracts/`, `ai/app/contracts/`                 | Shared — **review required from all three verticals** |
| `web/prisma/schema.prisma` — `Job`                | Job Intelligence            |
| `web/prisma/schema.prisma` — candidates, scores   | Ingestion / Ranking         |
| `ai/app/routers/job_architect.py`                 | Job Intelligence            |

Changing a contract changes everyone's code. Say so explicitly in the PR description and bump `SCHEMA_VERSION` if the change is breaking. See [docs/contracts.md](docs/contracts.md).

## Generated files

`contracts/*.schema.json` and `web/lib/contracts/types.ts` are generated from `ai/app/contracts/models.py`. Never hand-edit them; regenerate and commit the result in the same commit as the model change. CI fails on drift.

## Attribution

Commit messages and PR bodies contain the change description and nothing else — no `Co-Authored-By` trailers, no tool attribution.
