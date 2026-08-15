/**
 * The Kanban board's API.
 *
 * GET  /api/mock/pipeline?jobId=…   → PipelineBoard (jobId defaults to the
 *                                     only mock job, so a bare GET just works)
 * PATCH /api/mock/pipeline          → move a candidate between stages;
 *                                     body is MoveCandidateRequest
 *
 * Shapes live in lib/pipeline/types.ts. See docs/mock-api.md.
 */
import { NextResponse, type NextRequest } from "next/server";

import { getMockStore } from "@/lib/mock/store";
import { isPipelineStage, PIPELINE_STAGES } from "@/lib/pipeline/types";

export async function GET(request: NextRequest) {
  const store = getMockStore();
  const jobId = request.nextUrl.searchParams.get("jobId") ?? store.listJobs()[0]?.id ?? "";
  const board = store.getBoard(jobId);

  if (!board) {
    return NextResponse.json({ error: `No job with id "${jobId}".` }, { status: 404 });
  }

  return NextResponse.json(board);
}

export async function PATCH(request: Request) {
  let body: { candidateId?: unknown; jobId?: unknown; stage?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
  if (!candidateId) {
    return NextResponse.json({ error: "candidateId is required." }, { status: 400 });
  }

  if (!isPipelineStage(body.stage)) {
    return NextResponse.json(
      { error: `stage must be one of: ${PIPELINE_STAGES.join(", ")}.` },
      { status: 400 },
    );
  }

  const store = getMockStore();
  const jobId = typeof body.jobId === "string" ? body.jobId : (store.listJobs()[0]?.id ?? "");
  const result = store.moveCandidate(jobId, candidateId, body.stage);

  if (!result.ok) {
    const message =
      result.reason === "job_not_found"
        ? `No job with id "${jobId}".`
        : `No candidate with id "${candidateId}".`;
    return NextResponse.json({ error: message }, { status: 404 });
  }

  return NextResponse.json({ card: result.card });
}
