"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { OrangeLogo } from "@/components/orange-logo";
import { ScoringPill } from "@/components/ui";

/**
 * CV upload — the design-system drop zone wired to the real ingestion endpoint
 * (POST /api/upload, added by the BE track). Each dropped file becomes a
 * multipart request; the endpoint stores it and creates a placeholder candidate,
 * so the file lands in the "Applied" column. Multiple files upload one at a time
 * with per-file status. Needs Postgres running (docker compose up) to succeed;
 * without it, each row shows a clean error instead of crashing.
 */
const ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Status = "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  name: string;
  size: string;
  status: Status;
  error?: string;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function CvUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (id: string, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  async function uploadOne(file: File, id: string) {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { candidateId?: string; error?: string };
      if (!res.ok || !data.candidateId) {
        update(id, { status: "error", error: data.error ?? `Upload failed (${res.status}).` });
        return;
      }
      update(id, { status: "done" });
    } catch {
      update(id, { status: "error", error: "Couldn't reach the server." });
    }
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const queued: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: formatSize(file.size),
      status: "uploading",
    }));
    setItems((prev) => [...queued, ...prev]);
    // Sequential, so we don't hammer the dev server or the DB pool.
    for (let i = 0; i < files.length; i += 1) {
      await uploadOne(files[i], queued[i].id);
    }
  }

  const done = items.filter((it) => it.status === "done").length;
  const uploading = items.filter((it) => it.status === "uploading").length;
  const failed = items.filter((it) => it.status === "error").length;

  return (
    <div className="o-fade-in mx-auto w-full max-w-[760px] px-5 pt-14 pb-24 md:px-10">
      <div className="flex items-baseline gap-3">
        <span className="text-ink-2 font-serif text-[42px] leading-none italic">Upload</span>
        <span className="text-[36px] font-extrabold tracking-[-0.03em] lowercase">cvs</span>
      </div>
      <p className="text-ink-2 mt-[14px] text-[13.5px] leading-[1.6]">
        Drop in PDF or DOCX résumés (max 10MB each). Each becomes a candidate in Applied while
        Orange reads it in the background.
      </p>

      {/* Real drop zone: click or drag to pick files */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`mt-8 flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-10 py-13 text-center transition-colors ${
          dragOver ? "border-ink" : "border-line-2 hover:border-ink"
        }`}
      >
        <OrangeLogo size={40} />
        <div className="mt-[18px] text-[15.5px] font-semibold">Drop PDFs here</div>
        <div className="text-ink-3 mt-[6px] text-[12.5px]">
          or click to browse · we read every page, not just keywords
        </div>
        <span className="border-line-2 text-ink mt-5 inline-flex h-9 items-center rounded-lg border px-[18px] font-mono text-[10.5px] font-medium tracking-[0.08em]">
          BROWSE FILES
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="mt-10 flex items-baseline justify-between">
            <span className="text-ink-3 font-mono text-[10px] font-semibold tracking-[0.14em]">
              THIS UPLOAD — {items.length} FILE{items.length > 1 ? "S" : ""}
            </span>
            <span className="text-ink-3 flex items-center gap-[6px] font-mono text-[9.5px]">
              {uploading > 0 && (
                <span className="bg-signal size-1 rounded-full [animation:var(--animate-pulse-dot)]" />
              )}
              {done} done · {uploading} uploading
              {failed > 0 ? ` · ${failed} failed` : ""}
            </span>
          </div>

          <div className="border-line bg-card mt-[14px] rounded-xl border">
            {items.map((it, i) => (
              <div
                key={it.id}
                className={`flex items-center gap-[14px] px-5 py-[15px] ${
                  i < items.length - 1 ? "border-line border-b" : ""
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[11.5px]">{it.name}</span>
                  {it.status === "error" ? (
                    <span className="text-weak-text mt-[5px] block text-[11px]">{it.error}</span>
                  ) : (
                    <span className="text-ink-3 mt-[5px] block font-mono text-[9.5px]">
                      {it.size}
                    </span>
                  )}
                </span>
                {it.status === "uploading" && <ScoringPill label="uploading…" />}
                {it.status === "done" && (
                  <span className="text-strong-text bg-strong-bg border-strong-border inline-flex items-center rounded border px-[9px] py-[2.5px] font-mono text-[10px] font-medium">
                    in applied
                  </span>
                )}
                {it.status === "error" && (
                  <span className="text-weak-text font-mono text-[10px]">failed</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-ink-3 mt-5 flex items-baseline justify-between text-[12.5px]">
        <span>Leave anytime — uploads keep going and the board updates itself.</span>
        <Link
          href="/pipeline"
          className="text-ink-2 hover:text-signal font-mono text-[10px] tracking-[0.08em]"
        >
          VIEW PIPELINE →
        </Link>
      </div>
    </div>
  );
}
