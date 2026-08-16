/**
 * Design-system primitives shared across screens. Presentational only — no data
 * fetching, no state. These are the coded equivalents of the atoms in the
 * "Orange Design Tokens" mockup.
 */
import type { CSSProperties } from "react";

import type { RequirementOutcome, ScoreBand } from "@/lib/contracts/types";

/** Per-band Tailwind classes, wired to the score-band tokens in globals.css. */
const BAND_CLASSES: Record<ScoreBand, string> = {
  strong: "text-strong-text bg-strong-bg border-strong-border",
  good: "text-good-text bg-good-bg border-good-border",
  fair: "text-fair-text bg-fair-bg border-fair-border",
  weak: "text-weak-text bg-weak-bg border-weak-border",
};

/** The score chip, e.g. `strong · 91`. Band word is always shown, so it reads
 *  without relying on color alone. */
export function BandBadge({ band, value }: { band: ScoreBand; value?: number }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-[9px] py-[3px] font-mono text-[10.5px] font-medium ${BAND_CLASSES[band]}`}
    >
      {band}
      {value != null && (
        <>
          <span className="opacity-50">&nbsp;·&nbsp;</span>
          <span className="font-semibold">{value}</span>
        </>
      )}
    </span>
  );
}

/** Per-requirement outcome classes. `unknown` is neutral — it's "we couldn't
 *  tell", not a negative signal. */
const OUTCOME_CLASSES: Record<RequirementOutcome, string> = {
  yes: "text-strong-text bg-strong-bg border-strong-border",
  partial: "text-fair-text bg-fair-bg border-fair-border",
  no: "text-weak-text bg-weak-bg border-weak-border",
  unknown: "text-ink-3 border-line-2",
};

/** Whether a candidate meets a requirement: yes / partial / no / unknown. */
export function OutcomeBadge({ outcome }: { outcome: RequirementOutcome }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-[9px] py-[2.5px] font-mono text-[10px] font-semibold ${OUTCOME_CLASSES[outcome]}`}
    >
      {outcome}
    </span>
  );
}

/** The "scoring…" pending pill — dashed border + pulsing signal dot. Shown
 *  instead of a fake score while the ranker is still running. */
export function ScoringPill({ label = "scoring…" }: { label?: string }) {
  return (
    <span className="border-line-2 text-ink-3 inline-flex items-center gap-1.5 rounded border border-dashed px-[9px] py-[3px] font-mono text-[10px]">
      <span className="bg-signal size-1 rounded-full [animation:var(--animate-pulse-dot)]" />
      {label}
    </span>
  );
}

/** A shimmering placeholder bar. Width is a CSS length, e.g. "60%". */
export function Skeleton({ width, className = "" }: { width: string; className?: string }) {
  const style: CSSProperties = { width };
  return <span className={`o-skeleton block h-2 rounded ${className}`} style={style} />;
}
