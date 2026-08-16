/**
 * Pure board helpers — no React, so they're unit-testable and shared between
 * the drag handler and the keyboard handler.
 */
import { PIPELINE_STAGES } from "./types";
import type { PipelineBoard, PipelineCard, PipelineStage } from "./types";

/** Board order: best overall first, unscored (null → -1) last, then by name.
 *  Mirrors how the server assembles each column. */
export function compareCards(a: PipelineCard, b: PipelineCard): number {
  return (
    (b.score?.overall ?? -1) - (a.score?.overall ?? -1) || a.fullName.localeCompare(b.fullName)
  );
}

/**
 * Move a candidate to `toStage`, re-sorting that column. Returns a *new* board
 * (immutable) so React re-renders; returns the same board unchanged if the
 * candidate isn't found.
 */
export function moveCardLocally(
  board: PipelineBoard,
  candidateId: string,
  toStage: PipelineStage,
): PipelineBoard {
  let moved: PipelineCard | undefined;
  const stripped = board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => {
      if (card.candidateId === candidateId) {
        moved = card;
        return false;
      }
      return true;
    }),
  }));
  if (!moved) return board;

  const placed: PipelineCard = { ...moved, stage: toStage };
  const columns = stripped.map((column) =>
    column.stage === toStage
      ? { ...column, cards: [...column.cards, placed].sort(compareCards) }
      : column,
  );
  return { ...board, columns };
}

/** Header totals: all cards, and how many are still unscored. */
export function boardTotals(board: PipelineBoard): { all: number; scoring: number } {
  const cards = board.columns.flatMap((c) => c.cards);
  return { all: cards.length, scoring: cards.filter((c) => c.score === null).length };
}

/** The stage `steps` away from `from` in board order, or null past an edge. */
export function adjacentStage(from: PipelineStage, steps: number): PipelineStage | null {
  const next = PIPELINE_STAGES.indexOf(from) + steps;
  return PIPELINE_STAGES[next] ?? null;
}

/** True if the candidate is already in `stage` — used to skip no-op moves. */
export function isInStage(
  board: PipelineBoard,
  candidateId: string,
  stage: PipelineStage,
): boolean {
  return Boolean(
    board.columns
      .find((c) => c.stage === stage)
      ?.cards.some((card) => card.candidateId === candidateId),
  );
}
