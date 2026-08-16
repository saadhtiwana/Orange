import { describe, expect, it } from "vitest";

import {
  adjacentStage,
  boardTotals,
  compareCards,
  isInStage,
  moveCardLocally,
} from "./board-utils";
import type { PipelineBoard, PipelineCard, PipelineStage } from "./types";

function card(
  id: string,
  name: string,
  overall: number | null,
  stage: PipelineStage,
): PipelineCard {
  return {
    candidateId: id,
    fullName: name,
    headline: null,
    location: null,
    stage,
    score: overall === null ? null : { band: "good", overall, confidence: 0.8, topStrength: null },
  };
}

function makeBoard(): PipelineBoard {
  return {
    jobId: "job_test",
    jobTitle: "Test Role",
    columns: [
      {
        stage: "applied",
        cards: [card("a", "Ann", 70, "applied"), card("b", "Bob", null, "applied")],
      },
      { stage: "shortlisted", cards: [card("c", "Cara", 90, "shortlisted")] },
      { stage: "interview", cards: [] },
      { stage: "offer", cards: [] },
      { stage: "rejected", cards: [] },
    ],
  };
}

describe("compareCards", () => {
  it("orders higher overall first", () => {
    expect(compareCards(card("x", "X", 90, "applied"), card("y", "Y", 70, "applied"))).toBeLessThan(
      0,
    );
  });

  it("sinks unscored cards below scored ones", () => {
    expect(
      compareCards(card("x", "X", null, "applied"), card("y", "Y", 40, "applied")),
    ).toBeGreaterThan(0);
  });

  it("breaks ties by name", () => {
    expect(
      compareCards(card("x", "Zoe", 80, "applied"), card("y", "Amy", 80, "applied")),
    ).toBeGreaterThan(0);
  });
});

describe("boardTotals", () => {
  it("counts all cards and the unscored ones", () => {
    expect(boardTotals(makeBoard())).toEqual({ all: 3, scoring: 1 });
  });
});

describe("adjacentStage", () => {
  it("steps forward and backward through board order", () => {
    expect(adjacentStage("applied", 1)).toBe("shortlisted");
    expect(adjacentStage("shortlisted", -1)).toBe("applied");
  });

  it("returns null past either edge", () => {
    expect(adjacentStage("applied", -1)).toBeNull();
    expect(adjacentStage("rejected", 1)).toBeNull();
  });
});

describe("isInStage", () => {
  it("detects a candidate's current column", () => {
    const board = makeBoard();
    expect(isInStage(board, "a", "applied")).toBe(true);
    expect(isInStage(board, "a", "interview")).toBe(false);
  });
});

describe("moveCardLocally", () => {
  it("moves a card to the target stage", () => {
    const next = moveCardLocally(makeBoard(), "b", "interview");
    expect(
      next.columns.find((c) => c.stage === "applied")!.cards.map((c) => c.candidateId),
    ).toEqual(["a"]);
    const interview = next.columns.find((c) => c.stage === "interview")!.cards;
    expect(interview.map((c) => c.candidateId)).toEqual(["b"]);
    expect(interview[0].stage).toBe("interview");
  });

  it("re-sorts the destination column best-score-first", () => {
    const next = moveCardLocally(makeBoard(), "a", "shortlisted"); // Ann 70 joins Cara 90
    expect(
      next.columns.find((c) => c.stage === "shortlisted")!.cards.map((c) => c.fullName),
    ).toEqual(["Cara", "Ann"]);
  });

  it("does not mutate the input board (immutability)", () => {
    const board = makeBoard();
    moveCardLocally(board, "b", "interview");
    expect(board.columns.find((c) => c.stage === "applied")!.cards).toHaveLength(2);
    expect(board.columns.find((c) => c.stage === "interview")!.cards).toHaveLength(0);
  });

  it("returns the same board unchanged for an unknown candidate", () => {
    const board = makeBoard();
    expect(moveCardLocally(board, "ghost", "offer")).toBe(board);
  });
});
