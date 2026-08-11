/**
 * GET /api/mock/candidates
 *
 * All parsed candidate profiles. raw_text is stripped from the listing — it's
 * the full CV text and belongs to the detail endpoint, where evidence quotes
 * get verified against it. See docs/mock-api.md.
 */
import { NextResponse } from "next/server";

import { getMockStore } from "@/lib/mock/store";

export async function GET() {
  const candidates = getMockStore()
    .listCandidates()
    .map((candidate) => {
      const listed = { ...candidate };
      delete listed.raw_text;
      return listed;
    });

  return NextResponse.json({ candidates });
}
