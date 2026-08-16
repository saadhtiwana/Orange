/**
 * Design-system primitives shared across screens. Presentational only — no data
 * fetching, no state. Every screen builds its buttons and display headings from
 * the helpers here, so the design system has one definition of each.
 */
import type { CSSProperties, ReactNode } from "react";

import type { RequirementOutcome, ScoreBand } from "@/lib/contracts/types";

/* ------------------------------------------------------------------ button */

type ButtonVariant = "primary" | "outline" | "quiet";

/** Shared button geometry: 3px radius, a 2px border on every variant so the
 *  filled and outlined forms are the same size, and a 200ms colour fade. */
const BUTTON_BASE =
  "inline-flex h-9 items-center justify-center rounded-xs border-2 px-[18px] font-mono text-[10.5px] font-semibold tracking-[0.08em] transition-[background-color,border-color,color] duration-200 disabled:pointer-events-none disabled:opacity-40";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  /** The one place the accent is spent: the primary action on a screen. */
  primary: "bg-signal border-transparent text-on-signal hover:bg-signal-hover",
  /** Accent outline that fills on hover — the secondary accent action. */
  outline: "border-signal text-signal-ink hover:bg-signal hover:text-on-signal",
  /** Neutral outline for non-accent actions, so orange stays scarce. */
  quiet: "border-line-2 text-ink hover:border-ink",
};

/** Class string for a button or button-styled link. Returns classes rather than
 *  a component so `<button>` and `<Link>` keep their own props and handlers. */
export function btn(variant: ButtonVariant = "primary", className = ""): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]}${className ? ` ${className}` : ""}`;
}

/* ----------------------------------------------------------- display title */

/** The two-tone page heading: a lighter grey lead-in against a near-black
 *  subject, both bold sans at the same size. Replaces the old serif-italic
 *  pairing. `size` is the shared font size in px. */
export function DisplayTitle({
  lead,
  subject,
  size = 36,
  className = "",
  subjectClassName = "",
  children,
}: {
  lead: ReactNode;
  subject?: ReactNode;
  size?: number;
  className?: string;
  subjectClassName?: string;
  children?: ReactNode;
}) {
  const style: CSSProperties = { fontSize: `${size}px` };
  return (
    <div className={`flex flex-wrap items-baseline gap-x-[10px] gap-y-2 ${className}`}>
      <span
        className="text-display-muted leading-[1.05] font-bold tracking-[-0.03em]"
        style={style}
      >
        {lead}
      </span>
      {subject != null && (
        <span
          className={`text-ink leading-[1.05] font-extrabold tracking-[-0.03em] ${subjectClassName}`}
          style={style}
        >
          {subject}
        </span>
      )}
      {children}
    </div>
  );
}

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
      className={`inline-flex items-center rounded-xs border px-[9px] py-[3px] font-mono text-[10.5px] font-medium ${BAND_CLASSES[band]}`}
    >
      {band}
      {value != null && (
        <>
          <span className="opacity-50">&nbsp;·&nbsp;</span>
          <span className="font-semibold tabular-nums">{value}</span>
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
      className={`inline-flex items-center rounded-xs border px-[9px] py-[2.5px] font-mono text-[10px] font-semibold ${OUTCOME_CLASSES[outcome]}`}
    >
      {outcome}
    </span>
  );
}

/** The "scoring…" pending pill — dashed border + pulsing signal dot. Shown
 *  instead of a fake score while the ranker is still running. */
export function ScoringPill({ label = "scoring…" }: { label?: string }) {
  return (
    <span className="border-line-2 text-ink-3 inline-flex items-center gap-1.5 rounded-xs border border-dashed px-[9px] py-[3px] font-mono text-[10px]">
      <span className="bg-signal size-1 rounded-full [animation:var(--animate-pulse-dot)]" />
      {label}
    </span>
  );
}

/** A shimmering placeholder bar. Width is a CSS length, e.g. "60%". */
export function Skeleton({ width, className = "" }: { width: string; className?: string }) {
  const style: CSSProperties = { width };
  return <span className={`o-skeleton block h-2 rounded-xs ${className}`} style={style} />;
}
