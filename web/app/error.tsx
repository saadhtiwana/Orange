"use client";

/**
 * App-wide error boundary. Next renders this when a route throws during render.
 * `reset` re-attempts the segment. Kept calm and on-brand, not a stack trace.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-10 text-center text-[14px]">
      <div className="flex items-baseline gap-[10px]">
        <span className="text-ink-2 font-serif text-[40px] leading-none italic">Something</span>
        <span className="text-[34px] font-extrabold tracking-[-0.03em]">broke</span>
      </div>
      <p className="text-ink-2 mt-3 max-w-sm text-[13px] leading-[1.6]">
        A screen hit an unexpected error. Nothing was lost — try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-signal hover:bg-signal-hover mt-6 inline-flex h-9 items-center rounded-lg px-[18px] font-mono text-[10.5px] font-semibold tracking-[0.08em] text-white transition-colors"
      >
        TRY AGAIN
      </button>
    </div>
  );
}
