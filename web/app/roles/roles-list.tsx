"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { btn, DisplayTitle } from "@/components/ui";
import { api } from "@/lib/api";
import type { JobDescription } from "@/lib/contracts/types";

interface Role {
  job: JobDescription;
  total: number;
  scoring: number;
}

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
};

/**
 * The dashboard behind the "ROLES" nav item. Lists open roles from
 * GET /api/mock/jobs, and for each one reads its board to show live candidate
 * and "still scoring" counts. Each row opens that role's pipeline.
 */
export function RolesList() {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const jobs = await api.listJobs();
        const withCounts = await Promise.all(
          jobs.map(async (job): Promise<Role> => {
            try {
              const board = await api.getBoard(job.id ?? undefined);
              const cards = board.columns.flatMap((c) => c.cards);
              return { job, total: cards.length, scoring: cards.filter((c) => !c.score).length };
            } catch {
              return { job, total: 0, scoring: 0 };
            }
          }),
        );
        if (!cancelled) setRoles(withCounts);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="o-fade-in mx-auto w-full max-w-[1040px] px-10 pt-13 pb-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <DisplayTitle lead="Open" subject="roles" subjectClassName="lowercase" />
          <div className="text-ink-3 mt-3 text-[13.5px]">
            Describe a role, drop in CVs — Orange reads every one and shows its work.
          </div>
        </div>
        <Link href="/job" className={btn("primary")}>
          NEW ROLE
        </Link>
      </div>

      {/* Column headers */}
      <div className="border-line text-ink-3 mt-10 grid grid-cols-[1fr_auto] gap-5 border-b px-5 pb-3 font-mono text-[9px] font-medium tracking-[0.14em] md:grid-cols-[2.2fr_1fr_130px_130px]">
        <span>ROLE</span>
        <span className="hidden md:block">MODE</span>
        <span>CANDIDATES</span>
        <span className="hidden md:block">SCORING</span>
      </div>

      {error && <p className="text-weak-text mt-6 font-mono text-sm">{error}</p>}
      {!roles && !error && <p className="text-ink-3 mt-6 font-mono text-sm">Loading roles…</p>}
      {roles?.length === 0 && (
        <div className="border-line-2 mt-[14px] flex flex-col items-center rounded-lg border border-dashed py-16 text-center">
          <div className="text-[15px] font-semibold">No roles yet</div>
          <p className="text-ink-2 mt-2 max-w-sm text-[13px] leading-[1.6]">
            Describe your first role and Orange turns it into a structured job to score against.
          </p>
          <Link href="/job" className={btn("primary", "mt-5")}>
            NEW ROLE
          </Link>
        </div>
      )}

      {roles?.map(({ job, total, scoring }) => (
        <Link
          key={job.id}
          href="/pipeline"
          className="bg-card border-line hover:border-line-2 shadow-card hover:shadow-card-hover text-ink mt-[10px] grid grid-cols-[1fr_auto] items-center gap-5 rounded-lg border px-5 py-[22px] transition-[border-color,box-shadow] duration-200 first:mt-[14px] md:grid-cols-[2.2fr_1fr_130px_130px]"
        >
          <div>
            <div className="text-[15.5px] font-semibold tracking-[-0.01em]">{job.title}</div>
            <div className="text-ink-3 mt-[3px] text-[12px]">
              {job.locations?.[0] ?? "Location TBD"}
            </div>
          </div>
          <div className="text-ink-2 hidden text-[12px] md:block">
            {WORK_MODE_LABELS[job.work_mode] ?? job.work_mode}
          </div>
          <div className="text-signal-ink font-mono text-[12px] font-semibold tabular-nums">
            {total}
          </div>
          <div className="text-ink-2 hidden items-center gap-[6px] font-mono text-[11px] tabular-nums md:flex">
            {scoring > 0 ? (
              <>
                <span className="bg-signal size-1 rounded-full [animation:var(--animate-pulse-dot)]" />
                {scoring}
              </>
            ) : (
              <span className="text-ink-3">—</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
