"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { OrangeLogo } from "@/components/orange-logo";
import { btn, DisplayTitle, ScoringPill } from "@/components/ui";

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
      <DisplayTitle lead="Upload" subject="cvs" subjectClassName="lowercase" />
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
        className={`ease-out mt-8 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-10 py-13 text-center transition-colors duration-[var(--o-dur-fast)] ${
          dragOver ? "border-signal bg-signal-tint" : "border-line-2 hover:border-ink"
        }`}
      >
        <OrangeLogo size={40} />
        <div className="mt-[18px] text-[15.5px] font-semibold">Drop PDFs here</div>
        <div className="text-ink-3 mt-[6px] text-[12.5px]">
          or click to browse · we read every page, not just keywords
        </div>
        <span className={btn("quiet", "mt-5")}>Browse files</span>
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
            <span className="text-ink-3 text-[11px] font-semibold tracking-[0.06em] uppercase">
              This upload — {items.length} file{items.length > 1 ? "s" : ""}
            </span>
            <span className="text-ink-3 flex items-center gap-[6px] text-[12.5px] tabular-nums">
              {uploading > 0 && (
                <span className="bg-signal size-1 rounded-full [animation:var(--animate-pulse-dot)]" />
              )}
              {done} done · {uploading} uploading
              {failed > 0 ? ` · ${failed} failed` : ""}
            </span>
          </div>

          <div className="border-line bg-card shadow-card mt-[14px] rounded-lg border">
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
                    <span className="text-ink-3 mt-[5px] block text-[11.5px] tabular-nums">
                      {it.size}
                    </span>
                  )}
                </span>
                {it.status === "uploading" && <ScoringPill label="uploading…" />}
                {it.status === "done" && (
                  <span className="text-strong-text bg-strong-bg border-strong-border inline-flex items-center rounded-xs border px-2.5 py-1 text-[11.5px] leading-none font-semibold">
                    in applied
                  </span>
                )}
                {it.status === "error" && (
                  <span className="text-weak-text text-[11.5px] font-semibold">Failed</span>
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
          className="text-ink-2 hover:text-signal-ink text-[13px] font-semibold transition-colors duration-200"
        >
          View pipeline →
        </Link>
      </div>
    </div>
  );
}
