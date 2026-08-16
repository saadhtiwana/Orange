import Link from "next/link";

import { TopNav } from "@/components/top-nav";
import { ScoringPill, Skeleton } from "@/components/ui";

export const metadata = {
  title: "Upload CVs · Orange",
  description: "Drop in résumés — Orange parses and ranks them in the background.",
};

/**
 * CV upload flow. VISUAL ONLY for now — the mock API has no upload endpoint
 * (POST .../candidates isn't implemented yet), so the drop zone and file list
 * are static illustrations of the intended flow. Wire this up once a teammate
 * adds the upload route.
 */
export default function UploadPage() {
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <TopNav />
      <div className="o-fade-in mx-auto w-full max-w-[760px] px-10 pt-14 pb-24">
        <div className="flex items-baseline gap-3">
          <span className="text-ink-2 font-serif text-[42px] leading-none italic">Upload</span>
          <span className="text-[36px] font-extrabold tracking-[-0.03em] lowercase">cvs</span>
        </div>
        <p className="text-ink-2 mt-[14px] text-[13.5px] leading-[1.6]">
          Ranking runs in the background — you never wait on it. Candidates land in Applied as each
          CV finishes.
        </p>

        {/* Drop zone (not wired to an upload endpoint yet) */}
        <div className="border-line-2 hover:border-ink mt-8 flex flex-col items-center rounded-xl border border-dashed px-10 py-13 text-center transition-colors">
          <svg width="40" height="40" viewBox="0 0 96 96" aria-hidden>
            <g transform="rotate(-20 48 48)">
              <path
                d="M 72.43 39.11 A 26 26 0 1 0 72.43 56.89"
                fill="none"
                stroke="var(--o-line2)"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <circle cx="88" cy="48" r="7" style={{ fill: "var(--o-accent)" }} />
            </g>
          </svg>
          <div className="mt-[18px] text-[15.5px] font-semibold">Drop PDFs here</div>
          <div className="text-ink-3 mt-[6px] text-[12.5px]">
            up to 50 at once · we read every page, not just keywords
          </div>
          <span className="border-line-2 hover:border-ink text-ink mt-5 inline-flex h-9 items-center rounded-lg border px-[18px] font-mono text-[10.5px] font-medium tracking-[0.08em] transition-colors">
            BROWSE FILES
          </span>
        </div>

        {/* Illustrative in-progress list */}
        <div className="mt-10 flex items-baseline justify-between">
          <span className="text-ink-3 font-mono text-[10px] font-semibold tracking-[0.14em]">
            THIS UPLOAD — 4 FILES
          </span>
          <span className="text-ink-3 flex items-center gap-[6px] font-mono text-[9.5px]">
            <span className="bg-signal size-1 rounded-full [animation:var(--animate-pulse-dot)]" />1
            done · 2 parsing · 1 queued
          </span>
        </div>
        <div className="border-line bg-card mt-[14px] rounded-xl border">
          <UploadedRow name="Amara Okonkwo" file="okonkwo_amara_cv.pdf · 412 KB" status="done" />
          <UploadedRow file="petrov_daniel_cv.pdf · 1.2 MB" status="parsing" width="38%" />
          <UploadedRow file="garcia_maria_resume.pdf · 890 KB" status="parsing" width="52%" />
          <UploadedRow file="chen_wei_cv.pdf · 1.1 MB" status="queued" last />
        </div>

        <div className="text-ink-3 mt-5 flex items-baseline justify-between text-[12.5px]">
          <span>Leave anytime — this keeps running and the board updates itself.</span>
          <Link
            href="/pipeline"
            className="text-ink-2 hover:text-signal font-mono text-[10px] tracking-[0.08em]"
          >
            VIEW PIPELINE →
          </Link>
        </div>
      </div>
    </div>
  );
}

function UploadedRow({
  name,
  file,
  status,
  width,
  last,
}: {
  name?: string;
  file: string;
  status: "done" | "parsing" | "queued";
  width?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[14px] px-5 py-[15px] ${last ? "" : "border-line border-b"}`}
    >
      <span className="min-w-0 flex-1">
        {status === "done" && name ? (
          <span className="block text-[13.5px] font-semibold">{name}</span>
        ) : status === "parsing" ? (
          <Skeleton width={width ?? "45%"} />
        ) : (
          <span className="text-ink-2 block font-mono text-[11px]">{file.split(" · ")[0]}</span>
        )}
        <span className="text-ink-3 mt-[6px] block font-mono text-[9.5px]">{file}</span>
      </span>
      {status === "done" && (
        <span className="text-strong-text bg-strong-bg border-strong-border inline-flex items-center rounded border px-[9px] py-[2.5px] font-mono text-[10px] font-medium">
          in applied
        </span>
      )}
      {status === "parsing" && <ScoringPill label="parsing…" />}
      {status === "queued" && <span className="text-ink-3 font-mono text-[10px]">queued</span>}
    </div>
  );
}
