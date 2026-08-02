<div align="center">

# Orange

### Your agentic hiring team.

Orange replaces the busywork of recruiting. Describe a role, drop in the CVs, and it reads every one, ranks the shortlist, and shows its work. Sourcing to offer, run by AI, so a team can hire without a recruiting ops function behind it.

<br>

<a href="#roadmap"><b>Roadmap</b></a>

<br>

<!-- Record a 15 to 30s screen capture of the full loop (chat to JD, upload CVs, ranked board, reasoning) and save it as docs/demo.gif. This is the hero. -->
<img src="docs/demo.gif" alt="Orange turning a job description and a stack of CVs into a ranked, explained shortlist" width="840">

</div>

<br>

## What it does

You describe the role. Orange does the reading: it parses every résumé into a clean profile, scores each candidate against the job across skills, experience, education, and logistics, and writes out the reasoning behind every ranking. The scores are real and every one is auditable, with the model quoting the exact lines from the CV that justify it. No forms. No keyword filters. No black box.

## How it works

Uploads land on a queue, so ranking runs in the background. The recruiter never waits on the model.

```mermaid
flowchart TD
    subgraph Client["Recruiter web app · Next.js"]
      direction LR
      A["Job chat"]
      B["Pipeline Kanban"]
      C["Candidate profile"]
    end

    Client -->|REST| API["API layer · route handlers (BFF)"]
    API -->|commands| ORCH["Orchestrator"]
    API -->|upload| OBJ[("Object storage · CV files")]
    API -->|reads| PG[("PostgreSQL + pgvector")]
    ORCH -->|enqueue| Q[["Job queue · async parse + rank"]]
    Q -->|consume| AI

    subgraph AI["AI agent service · FastAPI"]
      direction LR
      JA["Job Architect"]
      CV["CV Parser"]
      RK["Ranker"]
    end

    AI -->|LLM calls| LLM(["LLM API · Claude / OpenAI"])
    AI -->|read / write| PG
```

## Roadmap

We start where hiring hurts most and expand until the whole pipeline runs itself.

- [x] Read, score, and rank candidates with reasoning you can act on
- [ ] ATS sync: Greenhouse, Lever, Workday
- [ ] Inbound capture and outbound follow-ups over email and WhatsApp
- [ ] AI first-round interviews, scored and auto-advanced
- [ ] Orange in the room: a live copilot for human technical interviews
- [ ] Sourcing to offer, end to end

**The goal: the hiring team, in software.**

## Stack

| Layer | Choice |
|---|---|
| Web | Next.js · TypeScript · Tailwind |
| API | Next.js route handlers (BFF) |
| Agents | Python · FastAPI |
| Reasoning | Claude / OpenAI |
| Data | PostgreSQL + `pgvector` |
| Infra | Vercel · Railway |

## Run locally

```bash
git clone https://github.com/saahtiwana/orange.git
cd orange
cp .env.example .env        # add your LLM and database keys

docker compose up -d postgres              # database
cd web && pnpm install && pnpm dev         # web  ->  localhost:3000
cd ../ai && uv sync && uvicorn app.main:app --reload   # ai  ->  localhost:8000
```

## Team

[@saahtiwana](https://github.com/saahtiwana) · [@ahmadmustafa02](https://github.com/ahmadmustafa02) · [@abdullahxdev](https://github.com/abdullahxdev)

<sub>© 2026 Orange. Built in Islamabad.</sub>
