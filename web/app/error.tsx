"use client";

import { btn, DisplayTitle } from "@/components/ui";

/**
 * App-wide error boundary. Next renders this when a route throws during render.
 * `reset` re-attempts the segment. Kept calm and on-brand, not a stack trace.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-10 text-center text-[14px]">
      <DisplayTitle lead="Something" subject="broke" size={34} className="justify-center" />
      <p className="text-ink-2 mt-3 max-w-sm text-[13px] leading-[1.6]">
        A screen hit an unexpected error. Nothing was lost — try again.
      </p>
      <button type="button" onClick={reset} className={btn("primary", "mt-6")}>
        TRY AGAIN
      </button>
    </div>
  );
}
