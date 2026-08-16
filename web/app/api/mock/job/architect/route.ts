/**
 * POST /api/mock/job/architect
 *
 * Mock stand-in for the real /api/job/architect (which needs the FastAPI AI
 * service + Postgres). Returns a contract-shaped JobDescription built from the
 * fixture job, with the title taken from the brief — so the Job Architect screen
 * works in a self-contained demo, exactly like every other screen runs on the
 * mock. Swaps for the real route when the AI service is up.
 */
import { NextResponse } from "next/server";

import type { JobDescription } from "@/lib/contracts/types";
import { MOCK_JOB } from "@/lib/mock/fixtures";

function toTitle(brief: string): string {
  return brief
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .slice(0, 80);
}

export async function POST(request: Request) {
  let body: { brief?: unknown };
  try {
    body = (await request.json()) as { brief?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  if (!brief) {
    return NextResponse.json({ error: "Describe the role you're hiring for." }, { status: 400 });
  }

  const jobDescription: JobDescription = {
    ...MOCK_JOB,
    title: toTitle(brief) || MOCK_JOB.title,
    meta: { generated_at: new Date().toISOString(), model: "mock", prompt_version: "0.0-mock" },
  };

  return NextResponse.json({ jobId: MOCK_JOB.id, jobDescription });
}
