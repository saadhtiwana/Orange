import { beforeEach, describe, expect, it } from "vitest";

import { NextRequest } from "next/server";

import { MOCK_CANDIDATES, MOCK_JOB } from "@/lib/mock/fixtures";
import { resetMockStore } from "@/lib/mock/store";
import type { PipelineBoard } from "@/lib/pipeline/types";
import { PIPELINE_STAGES } from "@/lib/pipeline/types";

import { GET, PATCH } from "./route";

function get(jobId?: string) {
  const url = new URL("http://localhost/api/mock/pipeline");
  if (jobId) url.searchParams.set("jobId", jobId);
  return GET(new NextRequest(url));
}

function patch(body: unknown) {
  return PATCH(
    new Request("http://localhost/api/mock/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("/api/mock/pipeline", () => {
  beforeEach(() => {
    resetMockStore();
  });

  it("returns the default job's board with every stage as a column", async () => {
    const response = await get();
    expect(response.status).toBe(200);

    const board = (await response.json()) as PipelineBoard;
    expect(board.jobId).toBe(MOCK_JOB.id);
    expect(board.columns.map((column) => column.stage)).toEqual([...PIPELINE_STAGES]);
  });

  it("places every candidate on the board exactly once", async () => {
    const board = (await (await get()).json()) as PipelineBoard;
    const ids = board.columns.flatMap((column) => column.cards.map((card) => card.candidateId));

    expect(ids.length).toBe(MOCK_CANDIDATES.length);
    expect(new Set(ids).size).toBe(MOCK_CANDIDATES.length);
  });

  it("sorts each column by score, best first, unscored last", async () => {
    const board = (await (await get()).json()) as PipelineBoard;

    for (const column of board.columns) {
      const overalls = column.cards.map((card) => card.score?.overall ?? -1);
      expect(overalls).toEqual([...overalls].sort((a, b) => b - a));
    }
  });

  it("404s for an unknown job", async () => {
    const response = await get("job_nope");
    expect(response.status).toBe(404);
  });

  it("moves a candidate and the next board read reflects it", async () => {
    const response = await patch({ candidateId: "cand_01", stage: "interview" });
    expect(response.status).toBe(200);

    const { card } = await response.json();
    expect(card).toMatchObject({ candidateId: "cand_01", stage: "interview" });

    const board = (await (await get()).json()) as PipelineBoard;
    const interview = board.columns.find((column) => column.stage === "interview")!;
    expect(interview.cards.some((c) => c.candidateId === "cand_01")).toBe(true);
  });

  it("rejects an unknown stage with the list of valid ones", async () => {
    const response = await patch({ candidateId: "cand_01", stage: "hired" });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("applied");
  });

  it("rejects a missing candidateId", async () => {
    const response = await patch({ stage: "interview" });
    expect(response.status).toBe(400);
  });

  it("404s for an unknown candidate", async () => {
    const response = await patch({ candidateId: "cand_99", stage: "interview" });
    expect(response.status).toBe(404);
  });

  it("rejects a non-JSON body", async () => {
    const response = await patch("not json");
    expect(response.status).toBe(400);
  });
});
