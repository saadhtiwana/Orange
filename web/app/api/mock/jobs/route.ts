/**
 * GET /api/mock/jobs
 *
 * Contract-shaped stand-in for the real jobs listing. See docs/mock-api.md.
 */
import { NextResponse } from "next/server";

import { getMockStore } from "@/lib/mock/store";

export async function GET() {
  return NextResponse.json({ jobs: getMockStore().listJobs() });
}
