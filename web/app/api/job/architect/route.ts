/**
 * POST /api/job/architect
 *
 * The BFF hop: takes the recruiter's brief, asks the AI service for a
 * structured job description, persists it via Prisma, returns it to the UI.
 * The AI service never touches Postgres — this handler is the only writer.
 */
import { NextResponse } from "next/server";

import { AiServiceError, architectJob, type ChatTurn } from "@/lib/ai-client";
import { saveJobDescription } from "@/lib/jobs/repository";

// Prisma needs the Node runtime. `dynamic` is deliberately absent: Next 16
// dropped it from the route segment config, and a POST handler is never
// statically optimized anyway.
export const runtime = "nodejs";

interface RequestBody {
  brief?: unknown;
  history?: unknown;
}

function parseHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): ChatTurn[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return [];
    }
    return [{ role, content }];
  });
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  if (!brief) {
    return NextResponse.json({ error: "Describe the role you're hiring for." }, { status: 400 });
  }

  let jobDescription;
  try {
    jobDescription = await architectJob({ brief, history: parseHistory(body.history) });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  try {
    const saved = await saveJobDescription(jobDescription);
    return NextResponse.json({ jobId: saved.id, jobDescription });
  } catch (error) {
    // The draft is good but unsaved. Say so plainly rather than returning it
    // as though it had been stored.
    console.error("Failed to persist job description", error);
    return NextResponse.json(
      {
        error:
          "Generated the job description but could not save it. " +
          "Check that Postgres is running (docker compose up -d postgres) " +
          "and migrations are applied (npm run db:migrate).",
      },
      { status: 500 },
    );
  }
}
