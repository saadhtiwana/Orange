# LLM providers

`POST /job/architect` calls a real model and returns a contract-conforming
`JobDescription`. Which model is one environment variable.

## Providers

| `LLM_PROVIDER` | Key | Client | Example `LLM_MODEL` |
| --- | --- | --- | --- |
| `grok` / `xai` | `XAI_API_KEY` | OpenAI-compatible | `grok-4` |
| `gemini` / `google` | `GEMINI_API_KEY` | OpenAI-compatible | `gemini-flash-latest` |
| `openrouter` | `OPENROUTER_API_KEY` | OpenAI-compatible | `nvidia/nemotron-3-super-120b-a12b:free` |
| `anthropic` | `ANTHROPIC_API_KEY` | Anthropic SDK | `claude-opus-5` |

xAI, Gemini and OpenRouter all speak the OpenAI wire format, so they share
`OpenAICompatibleClient` and differ only in base URL, model id and credentials.
Anthropic keeps its own client because its structured-output API differs.

Only the key for the selected provider is required. `LLM_MODEL` must match the
provider — there is no default per provider, because a wrong-but-plausible model
id fails at request time with a clearer message than a silent fallback would.

## How the contract is enforced

Strict `response_format={"type":"json_schema"}` accepts only a subset of JSON
Schema, so a contract model cannot be sent verbatim — Pydantic emits `pattern`
(from `Field(pattern=…)`), `minimum`/`maximum` (from `ge`/`le`), and omits
`default_factory` fields from `required`, which strict mode forbids.

`to_strict_schema()` sanitises a copy for the request. **The contract is not
loosened.** Those constraints were only ever a hint to the model; the reply is
validated against the untouched Pydantic model, which raises
`LLMInvalidOutputError` naming the offending field paths. Enforcement moves from
*asked nicely* to *checked on the way in*.

Server-owned fields (`id`, `meta`, `schema_version`) are withheld from the model
so it cannot invent them; the router stamps `meta` after generation.

## Local setup

`ai/app/config.py` reads `.env` relative to the working directory, so the
service needs **`ai/.env`** — a repo-root `.env` alone will not be picked up.

```bash
cp .env.example ai/.env      # then fill in the one key you need
```

## Running it

```bash
cd ai
uv sync --all-groups
uv run uvicorn app.main:app --port 8000
```

Bind address is `127.0.0.1`. Use that, not `localhost`, or an IPv6-first
resolver will fail the connection.

```bash
curl -s http://127.0.0.1:8000/health
# {"llm":{"provider":"gemini","model":"gemini-flash-latest","configured":true}}
```

`configured` reflects the **selected** provider's key, so it is the fastest way
to catch a deploy pointed at a provider it has no credentials for.

Override per-run without editing `.env`:

```bash
LLM_PROVIDER=gemini LLM_MODEL=gemini-flash-latest uv run uvicorn app.main:app --port 8000
```

## A live request

```bash
curl -s -X POST http://127.0.0.1:8000/job/architect \
  -H 'Content-Type: application/json' \
  -d '{"brief":"Senior backend engineer in Berlin, hybrid. Python and Postgres, payments experience matters. Around five years. Salary 85-105k EUR."}' \
  | python3 -m json.tool
```

Expect `200` and a `job_description`. Response times vary a lot by model —
seconds for a small one, over a minute for a large reasoning model.

## Reading a failure

Every provider error is translated to one of ours, so the HTTP status tells you
who is at fault:

| Status | Error | Means |
| --- | --- | --- |
| `503` | `LLMNotConfiguredError` | No key for the selected provider. The message names the variable. |
| `422` | `LLMRefusalError` | The model declined on policy grounds. |
| `502` | `LLMInvalidOutputError` | Replied, but not to contract. The message lists the field paths that failed. |
| `502` | `LLMError` | Transport or provider-side failure — the provider's own message is included verbatim. |

Two real examples worth recognising:

```
LLMError: xAI (Grok) request failed: Error code: 403 -
  {'code': 'permission-denied', 'error': "Your ... team doesn't have any credits"}
```
Billing, not code. Add credits.

```
LLMError: Google Gemini request failed: Error code: 404 -
  'This model models/gemini-2.5-pro is no longer available to new users.'
```
Retired model id. Pick one that is live:

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" \
  | python3 -c "import json,sys;[print(m['name'].split('/')[-1]) for m in json.load(sys.stdin)['models']]"
```

## The test suite

Runs offline with no keys and costs nothing — the LLM is faked at the
`get_llm_client` dependency, and the client tests stub the SDK transport while
keeping every code path above it real.

```bash
cd ai
uv run ruff check . && uv run ruff format --check .
uv run mypy app scripts
uv run pytest -q
```

Provider coverage lives in `tests/test_llm_factory.py` (selection, aliases,
missing-key messages, `/health`), `tests/test_openai_compatible.py` (parses a
well-formed reply; raises on contract violations, hallucinated keys, non-JSON,
truncation, refusal) and `tests/test_llm_json_schema.py` (the strict-dialect
translation, including a guard proving the raw schema really would be rejected).
