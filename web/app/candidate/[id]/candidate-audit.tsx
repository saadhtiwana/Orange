"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BandBadge, OutcomeBadge, ScoringPill } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type {
  CandidateProfile,
  Evidence,
  JobDescription,
  ScoreWithEvidence,
} from "@/lib/contracts/types";
import { groupEvidenceByRequirement } from "@/lib/scoring/evidence";

interface Payload {
  candidate: CandidateProfile;
  scores: ScoreWithEvidence[];
}

/**
 * The audit view — Orange's "shows its work" screen.
 *
 * Fetches the full profile + scores from GET /api/mock/candidates/:id, then the
 * job from GET /api/mock/jobs/:id so requirement ids (req_python_5y) can be
 * shown as their human labels ("Python, 5+ years"). Evidence lives on the
 * score's dimensions keyed by requirement_id, so we group it per requirement to
 * draw the trail: requirement → outcome → verbatim CV quote.
 */
export function CandidateAudit({ candidateId }: { candidateId: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [job, setJob] = useState<JobDescription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await api.getCandidate(candidateId);
        if (cancelled) return;
        setData(payload);

        // Job labels turn requirement ids into readable text; a nice-to-have,
        // so a failure here shouldn't break the page.
        const jobId = payload.scores[0]?.job_id;
        if (jobId) {
          try {
            const resolved = await api.getJob(jobId);
            if (!cancelled) setJob(resolved);
          } catch {
            /* leave requirement ids unresolved */
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? "Candidate not found."
            : (err as Error).message,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md px-10 py-24 text-center">
        <div className="flex items-baseline justify-center gap-[10px]">
          <span className="text-ink-2 font-serif text-[34px] leading-none italic">Nothing</span>
          <span className="text-[28px] font-extrabold tracking-[-0.03em]">here</span>
        </div>
        <p className="text-ink-2 mt-3 text-[13px]">{error}</p>
        <Link
          href="/pipeline"
          className="text-ink-2 hover:text-signal mt-6 inline-block font-mono text-[10px] tracking-[0.08em]"
        >
          ← BACK TO PIPELINE
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="text-ink-3 p-10 font-mono text-sm">Loading candidate…</p>;
  }

  const { candidate } = data;
  const score = data.scores[0] ?? null;

  const [firstName, ...rest] = candidate.full_name.split(" ");
  const lastName = rest.join(" ");
  const location = [candidate.location?.city, candidate.location?.country]
    .filter(Boolean)
    .join(", ");

  const reqLabel = new Map((job?.requirements ?? []).map((r) => [r.id, r.label]));
  const evidenceByReq = score ? groupEvidenceByRequirement(score) : new Map<string, Evidence[]>();

  return (
    <div className="o-fade-in mx-auto w-full max-w-[1200px] px-10 pt-8 pb-24">
      <Link
        href="/pipeline"
        className="text-ink-3 hover:text-signal font-mono text-[10px] tracking-[0.1em]"
      >
        ← PIPELINE
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="text-ink-2 font-serif text-[42px] leading-none italic">{firstName}</span>
        {lastName && (
          <span className="text-[36px] font-extrabold tracking-[-0.03em]">{lastName}</span>
        )}
        {score && (
          <span className="translate-y-[-6px]">
            <BandBadge band={score.overall.band} value={score.overall.score} />
          </span>
        )}
        {score && (
          <span className="text-ink-3 font-mono text-[10px]">
            conf {score.overall.confidence.toFixed(2)}
          </span>
        )}
      </div>
      <div className="text-ink-3 mt-[10px] text-[13.5px]">
        {candidate.headline}
        {location && ` · ${location}`}
        {candidate.id && (
          <>
            {" · "}
            <span className="font-mono text-[11px]">{candidate.id}</span>
          </>
        )}
      </div>

      {!score ? (
        <div className="border-line bg-card mt-8 flex items-center gap-4 rounded-xl border p-6">
          <ScoringPill />
          <span className="text-ink-2 text-[13px]">
            This candidate is still being ranked — no score or evidence yet.
          </span>
        </div>
      ) : (
        <>
          {/* Strengths / Gaps / Risks */}
          <div className="mt-8 grid grid-cols-1 gap-[14px] md:grid-cols-3">
            <SummaryCard label="STRENGTHS" dot="bg-strong-text" items={score.strengths} />
            <SummaryCard label="GAPS" dot="bg-fair-text" items={score.gaps} />
            <SummaryCard label="RISKS" dot="bg-weak-text" items={score.risks} />
          </div>

          <div className="mt-11 flex flex-wrap items-start gap-10">
            {/* Left: breakdown + evidence trail */}
            <div className="min-w-0 flex-1 basis-[560px]">
              <SectionLabel>SCORE BREAKDOWN</SectionLabel>
              <div className="border-line bg-card mt-[14px] rounded-xl border">
                {(score.dimensions ?? []).map((dim, i) => (
                  <div
                    key={dim.dimension}
                    className={`flex flex-wrap items-center gap-x-[18px] gap-y-[10px] px-[22px] py-4 ${
                      i > 0 ? "border-line border-t" : ""
                    }`}
                  >
                    <span className="w-24 flex-none text-[13.5px] font-semibold capitalize">
                      {dim.dimension}
                    </span>
                    <span className="flex items-center gap-[10px]">
                      <span className="bg-line inline-block h-[3px] w-[110px] overflow-hidden rounded-sm">
                        <span
                          className="bg-ink-3 block h-full"
                          style={{ width: `${dim.score}%` }}
                        />
                      </span>
                      <span className="font-mono text-[11.5px] font-semibold">{dim.score}</span>
                    </span>
                    <span className="text-ink-3 ml-auto font-mono text-[10px]">
                      w {dim.weight.toFixed(2)}
                    </span>
                    <span className="text-ink-2 basis-full text-[12.5px] leading-[1.5]">
                      {dim.rationale}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-11 flex items-baseline justify-between">
                <SectionLabel>REQUIREMENTS — EVIDENCE TRAIL</SectionLabel>
                <span className="text-ink-3 font-mono text-[10px]">
                  every quote is verbatim from the cv
                </span>
              </div>
              <div className="border-line bg-card mt-[14px] rounded-xl border">
                {(score.requirement_results ?? []).map((result, i) => {
                  const evidence = evidenceByReq.get(result.requirement_id) ?? [];
                  return (
                    <div
                      key={result.requirement_id}
                      className={`px-[22px] py-[18px] ${i > 0 ? "border-line border-t" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-ink-3 font-mono text-[10px]">R{i + 1}</span>
                        <span className="text-[14px] font-semibold">
                          {reqLabel.get(result.requirement_id) ?? result.requirement_id}
                        </span>
                        <span className="ml-auto">
                          <OutcomeBadge outcome={result.met} />
                        </span>
                      </div>
                      {evidence.map((ev, j) => (
                        <EvidenceRow key={j} ev={ev} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: structured profile */}
            <div className="flex basis-[300px] flex-col gap-[14px]">
              <div className="border-line bg-card rounded-xl border p-[22px]">
                <SectionLabel>EXPERIENCE</SectionLabel>
                <div className="mt-[14px] flex flex-col">
                  {(candidate.work_experience ?? []).map((exp, i) => (
                    <div key={i} className={i > 0 ? "border-line mt-4 border-t pt-4" : ""}>
                      <div className="text-[13.5px] font-semibold">{exp.title}</div>
                      <div className="text-ink-3 mt-[3px] font-mono text-[10px]">
                        {exp.company} · {monthRange(exp.start, exp.end, exp.is_current)}
                      </div>
                      {exp.highlights?.[0] && (
                        <div className="text-ink-2 mt-[5px] text-[12px] leading-[1.5]">
                          {exp.highlights[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {(candidate.education ?? []).length > 0 && (
                <div className="border-line bg-card rounded-xl border p-[22px]">
                  <SectionLabel>EDUCATION</SectionLabel>
                  <div className="mt-[14px] flex flex-col">
                    {(candidate.education ?? []).map((ed, i) => (
                      <div key={i} className={i > 0 ? "border-line mt-4 border-t pt-4" : ""}>
                        <div className="text-[13.5px] font-semibold">
                          {ed.field ?? ed.degree_level}
                        </div>
                        <div className="text-ink-3 mt-[3px] font-mono text-[10px]">
                          {ed.institution}
                          {ed.end && ` · ${ed.end}`}
                        </div>
                        {ed.gpa != null && (
                          <div className="text-ink-2 mt-[5px] font-mono text-[10.5px]">
                            GPA {ed.gpa}
                            {ed.gpa_scale && ` · scale ${ed.gpa_scale}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(candidate.skills ?? []).length > 0 && (
                <div className="border-line bg-card rounded-xl border p-[22px]">
                  <SectionLabel>SKILLS</SectionLabel>
                  <div className="mt-3 flex flex-col">
                    {(candidate.skills ?? []).map((skill, i, arr) => (
                      <div
                        key={skill.name}
                        className={`flex items-baseline justify-between py-[7px] ${
                          i < arr.length - 1 ? "border-line border-b" : ""
                        }`}
                      >
                        <span className="text-[12.5px]">{skill.name}</span>
                        {skill.years != null && (
                          <span className="text-ink-3 font-mono text-[10px]">
                            {skill.years} yrs
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-ink-3 font-mono text-[10px] font-semibold tracking-[0.14em]">
      {children}
    </span>
  );
}

function SummaryCard({ label, dot, items }: { label: string; dot: string; items?: string[] }) {
  return (
    <div className="border-line bg-card rounded-xl border p-5">
      <div className="text-ink-3 flex items-center gap-[6px] font-mono text-[9px] font-semibold tracking-[0.14em]">
        <span className={`size-[5px] rounded-full ${dot}`} />
        {label}
      </div>
      <div className="text-ink-2 mt-3 flex flex-col gap-2 text-[12.5px] leading-[1.5]">
        {items && items.length > 0 ? (
          items.map((item, i) => <span key={i}>{item}</span>)
        ) : (
          <span className="text-ink-3 italic">none noted</span>
        )}
      </div>
    </div>
  );
}

const POLARITY = {
  supports: { label: "SUPPORT", cls: "text-strong-text" },
  contradicts: { label: "CONTRADICT", cls: "text-weak-text" },
  absent: { label: "ABSENT", cls: "text-ink-3" },
} as const;

function EvidenceRow({ ev }: { ev: Evidence }) {
  const polarity = ev.polarity ?? "supports";
  const meta = POLARITY[polarity];
  return (
    <div className="bg-paper border-line mt-[10px] ml-[34px] flex items-baseline gap-[10px] rounded-lg border px-[14px] py-[10px]">
      <span
        className={`flex-none font-mono text-[8.5px] font-semibold tracking-[0.12em] ${meta.cls}`}
      >
        {meta.label}
      </span>
      {polarity === "absent" ? (
        <span className="text-ink-3 flex-1 text-[12px] leading-[1.65] italic">
          {ev.quote || "not mentioned in the CV"}
        </span>
      ) : (
        <span className="flex-1 font-mono text-[11px] leading-[1.65]">“{ev.quote}”</span>
      )}
      <span className="text-ink-3 flex-none font-mono text-[9.5px]">
        {ev.confidence.toFixed(2)}
      </span>
    </div>
  );
}

/** "2021-03 — present" / "2016-08 — 2019-03". Dates are calendar months. */
function monthRange(start?: string | null, end?: string | null, current?: boolean): string {
  const from = start ?? "?";
  const to = current ? "present" : (end ?? "present");
  return `${from} — ${to}`;
}
