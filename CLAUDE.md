# Orange

Agentic hiring platform. Monorepo: `web/` (Next.js), `ai/` (FastAPI), `contracts/` (shared schemas), `docs/`.

## Commit and PR conventions

Never add Co-Authored-By, "Generated with Claude Code", or any AI attribution to commit messages or PR bodies.

Commits follow Conventional Commits: `feat:`, `fix:`, `chore:`, `ci:`, `docs:`, `test:`. Name every commit and PR by what the code does, never by week or phase. Keep commits small — one meaningful unit of work each.

## Contracts are generated

`ai/app/contracts/models.py` is the single source of truth for `JobDescription`, `CandidateProfile`, and `ScoreWithEvidence`.

- `contracts/*.schema.json` is generated from it.
- `web/lib/contracts/types.ts` is generated from those.

Never hand-edit the generated files. Change the Pydantic models, then run `npm run gen:contracts` in `web/`. CI fails on drift.

## Ownership

`web/prisma/schema.prisma` models for candidates, profiles, and scores are owned by other engineers. The `Job` model is owned by the Job Intelligence vertical.

The `ai/` service never touches Postgres. It returns structured data to the Next.js route handlers, which persist via Prisma. Prisma is the only DB writer.
