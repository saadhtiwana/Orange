## What this does

<!-- One or two sentences. What can the codebase do now that it couldn't before? -->

## Why

<!-- The problem this solves. Link the issue if there is one. -->

## How to test

<!-- Exact commands. Assume the reviewer has a clean checkout. -->

```bash
```

## Contract changes

<!-- Delete this section if you didn't touch ai/app/contracts/models.py. -->

- [ ] Regenerated `contracts/*.schema.json` and `web/lib/contracts/types.ts` and committed them
- [ ] Bumped `SCHEMA_VERSION` if a field was removed or renamed
- [ ] Flagged the other two verticals in the PR description

## Checklist

- [ ] `web`: lint, format, typecheck, tests, and build pass locally
- [ ] `ai`: ruff, mypy, and pytest pass locally
- [ ] Tests cover the new behaviour
- [ ] No secrets, keys, or `.env` files in the diff
