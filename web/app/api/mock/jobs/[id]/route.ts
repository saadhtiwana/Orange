/**
 * GET /api/mock/jobs/:id
 *
 * One JobDescription, requirements included — what the board header and the
 * requirement-by-requirement score views hang off. See docs/mock-api.md.
 */
import { NextResponse } from "next/server";

import { getMockStore } from "@/lib/mock/store";

export async function GET(_request: Request, ctx: RouteContext<"/api/mock/jobs/[id]">) {
  const { id } = await ctx.params;
  const job = getMockStore().getJob(id);

  if (!job) {
    return NextResponse.json({ error: `No job with id "${id}".` }, { status: 404 });
  }

  return NextResponse.json({ job });
}
