/**
 * Persistence for job descriptions.
 *
 * Prisma is the only writer in the platform — the AI service never touches
 * Postgres. It returns structured data to a route handler, and the route
 * handler calls in here.
 */
import type { Prisma } from "@/app/generated/prisma/client";
import type { JobDescription } from "@/lib/contracts/types";
import { prisma } from "@/lib/prisma";

export interface StoredJob {
  id: string;
  createdAt: Date;
}

/**
 * Write a job description and return its row.
 *
 * The whole contract object is stored in `document`; the scalar columns are
 * denormalised copies for listing and filtering. If they ever disagree,
 * `document` wins.
 */
export async function saveJobDescription(jobDescription: JobDescription): Promise<StoredJob> {
  const created = await prisma.job.create({
    data: {
      title: jobDescription.title,
      seniority: jobDescription.seniority,
      employmentType: jobDescription.employment_type,
      workMode: jobDescription.work_mode,
      locations: jobDescription.locations ?? [],
      summary: jobDescription.summary,
      schemaVersion: jobDescription.schema_version ?? "1.0",
      model: jobDescription.meta?.model ?? null,
      promptVersion: jobDescription.meta?.prompt_version ?? null,
      document: jobDescription as unknown as Prisma.InputJsonValue,
    },
    select: { id: true, createdAt: true },
  });

  return created;
}

/** Most recent jobs first — for the pipeline list view. */
export async function listRecentJobs(
  limit = 20,
): Promise<Array<{ id: string; title: string; createdAt: Date }>> {
  return prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, createdAt: true },
  });
}
