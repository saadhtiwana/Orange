"""Load prompts from disk.

Prompts live in Markdown files rather than string literals so they can be
reviewed as prose in a PR. Each carries a `version` in its frontmatter, which
is recorded in the contract metadata of anything it produces — that is what
lets you tell which prompt wrote a given job description months later.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from app.config import get_settings

FRONTMATTER_DELIMITER = "---"


@dataclass(frozen=True)
class Prompt:
    name: str
    version: str
    text: str

    def render(self, **values: str) -> str:
        """Substitute `{placeholder}` values into the prompt body."""
        return self.text.format(**values)


class PromptError(RuntimeError):
    """A prompt file is missing or malformed."""


def _parse(name: str, raw: str) -> Prompt:
    if not raw.startswith(FRONTMATTER_DELIMITER):
        raise PromptError(f"Prompt {name!r} is missing its frontmatter block.")

    _, frontmatter, body = raw.split(FRONTMATTER_DELIMITER, 2)

    version: str | None = None
    for line in frontmatter.strip().splitlines():
        key, _, value = line.partition(":")
        if key.strip() == "version":
            version = value.strip()

    if not version:
        raise PromptError(f"Prompt {name!r} has no 'version' in its frontmatter.")

    return Prompt(name=name, version=version, text=body.strip())


@lru_cache
def load_prompt(name: str) -> Prompt:
    """Load `<prompts_dir>/<name>.md`. Cached — restart to pick up edits."""
    path = get_settings().prompts_dir / f"{name}.md"
    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise PromptError(f"No prompt file at {path}") from exc
    return _parse(name, raw)
