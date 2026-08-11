/**
 * GET /api/mock/candidates/:id
 *
 * The full CandidateProfile (raw_text included) plus every ScoreWithEvidence
 * the candidate has — everything the profile page and the evidence drawer
 * need in one request. See docs/mock-api.md.
 */
import { NextResponse } from "next/server";

import { getMockStore } from "@/lib/mock/store";

export async function GET(_request: Request, ctx: RouteContext<"/api/mock/candidates/[id]">) {
  const { id } = await ctx.params;
  const store = getMockStore();
  const candidate = store.getCandidate(id);

  if (!candidate) {
    return NextResponse.json({ error: `No candidate with id "${id}".` }, { status: 404 });
  }

  return NextResponse.json({ candidate, scores: store.getScoresForCandidate(id) });
}
