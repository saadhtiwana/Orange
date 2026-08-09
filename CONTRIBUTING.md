# Contributing to Orange

How we work on Orange: small branches, reviewed PRs, and a working slice shipped every week.

## Repo layout

| Path         | What lives there                                                        |
| ------------ | ----------------------------------------------------------------------- |
| `web/`       | Next.js app — UI and the route handlers that act as our BFF              |
| `ai/`        | FastAPI service — the Job Architect, CV parsing, and ranking agents      |
| `contracts/` | Shared JSON Schemas: the interface every vertical codes against          |
| `db/`        | Database bootstrap — extensions and seed SQL                             |
| `docs/`      | Design notes and the contract reference                                  |

The contracts are generated from `ai/app/contracts/models.py`. Never hand-edit anything in `contracts/` or `web/lib/contracts/` — see [docs/contracts.md](docs/contracts.md).

## Local setup

Everything runs locally in containers. Nothing is deployed yet, and there is no cloud database — `DATABASE_URL` points at localhost.

**Prerequisites:** Node 22+, [uv](https://docs.astral.sh/uv/), and Docker.

Copy the environment template and fill in your keys:

```bash
cp .env.example .env
```

You need an `ANTHROPIC_API_KEY` for the AI service. The database credentials in the template match what Docker Compose starts, so they work as-is.

**Database** — Postgres with `pgvector`:

```bash
docker compose up -d
```

**Web app** — on `localhost:3000`:

```bash
cd web
npm install
npm run dev
```

**AI service** — on `localhost:8000`:

```bash
cd ai
uv sync
uv run uvicorn app.main:app --reload
```

Run all three and the Job Architect works end to end.

## Workflow

Every change goes on a feature branch and lands through a pull request into `main`. Never push to `main` directly — it is protected, and it stays green.

Branch names describe the change: `feat/job-intelligence`, `fix/cv-parser-dates`.

Before you push, run the same checks CI runs:

```bash
# web/
npm run lint && npm run format:check && npm run typecheck && npm test && npm run build

# ai/
uv run ruff check . && uv run ruff format --check . && uv run mypy app scripts && uv run pytest
```

Open the PR, fill in the template, and get one approving review. CI must be green before merge.

### Conventional commits

Every commit message is `type: what the code does`, in the imperative.

| Type    | Use for                                             |
| ------- | --------------------------------------------------- |
| `feat`  | New behaviour a user or another vertical can observe |
| `fix`   | A bug fix                                            |
| `chore` | Tooling, config, dependencies                        |
| `ci`    | CI workflow changes                                  |
| `docs`  | Documentation only                                   |
| `test`  | Tests only                                           |

```
feat: add Job Architect endpoint
fix: preserve trailing months when parsing CV date ranges
ci: cache uv downloads between runs
```

Name commits and pull requests by **what the code does**, never by week, phase, or sprint. Keep them small — one meaningful unit each.

**No AI attribution in commit messages or PR bodies, ever.** No co-author trailers, no tool credits. The message contains the change description and nothing else.

## Weekly rhythm

We ship a working slice every week. Each week's work lands as reviewed, merged PRs by the end of the week — not as a branch that piles up.

Sunday standup is the weekly checkpoint. Everyone brings a demoable piece: something you can run and show, not a status update.

## Module owners

| Owner                                                     | Modules                             |
| --------------------------------------------------------- | ----------------------------------- |
| Saad Hayat ([@saadhtiwana](https://github.com/saadhtiwana))         | Job Intelligence · AI runtime       |
| Ahmad Mustafa ([@ahmadmustafa02](https://github.com/ahmadmustafa02)) | Ingestion & Profiles · Data/DevOps  |
| Abdullah ([@abdullahxdev](https://github.com/abdullahxdev))         | Ranking & Pipeline · Design system  |

Tag the owner of any module your change touches. Changes to `contracts/` affect all three verticals — get sign-off from each.

## Progress log

🏗️ scaffolding/infra · 🗄️ database/schema · 🤖 AI/agents · 🔌 API · 🎨 design/UI · 🧪 tests · ⚙️ CI/tooling · 📦 containers · 📝 docs · ✅ done · 🚧 in progress

| Week   | Contributor | Shipped                                                                                                                                        |
| ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Week 1 | Saad        | 📝 shared contracts · 🤖 AI service + Job Architect endpoint · 🔌 job chat wired · ⚙️ CI pipeline · 📦 Postgres+pgvector via Docker · 🏗️ repo guardrails ✅ |
| Week 1 | Ahmad       | 🏗️ Next.js scaffold · 🗄️ Prisma setup ✅                                                                                                          |
| Week 1 | Abdullah    | 🎨 design system + Kanban shell 🚧                                                                                                                |
