/**
 * POST /api/upload
 *
 * Accepts a single CV file (PDF or DOCX), stores it on disk, and creates
 * placeholder Candidate + Profile rows. Parsing is Week 2 — rawText stays null.
 */
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["application/pdf", ".pdf"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".docx",
  ],
]);

// TODO: move file storage to S3 / Vercel Blob — local /uploads is prototype-only.
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request must be multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing file field. Send the CV as form field "file".' },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 },
    );
  }

  const extension = ALLOWED_MIME_TYPES.get(file.type);
  if (!extension) {
    return NextResponse.json(
      {
        error:
          "Unsupported file type. Only PDF and DOCX are allowed " +
          `(received "${file.type || "unknown"}").`,
      },
      { status: 400 },
    );
  }

  const storedName = `${randomUUID()}${extension}`;
  const absolutePath = path.join(UPLOADS_DIR, storedName);
  // resumeUrl is a local path reference for Week 1; swap for a blob URL later.
  const resumeUrl = path.posix.join("uploads", storedName);

  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, bytes);
  } catch (error) {
    console.error("Failed to store uploaded file", error);
    return NextResponse.json(
      { error: "Could not store the uploaded file." },
      { status: 500 },
    );
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        // Placeholders until Week 2 CV parsing fills real identity fields.
        name: "Unknown candidate",
        email: `upload-${randomUUID()}@placeholder.local`,
        phone: null,
        source: "upload",
        profiles: {
          create: {
            resumeUrl,
            rawText: null,
          },
        },
      },
      include: { profiles: true },
    });

    const profile = candidate.profiles[0];
    if (!profile) {
      return NextResponse.json(
        { error: "Candidate was created but profile is missing." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      candidateId: candidate.id,
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Failed to persist upload candidate/profile", error);
    return NextResponse.json(
      {
        error:
          "File was stored but could not be saved to the database. " +
          "Check that Postgres is running and migrations are applied.",
      },
      { status: 500 },
    );
  }
}
