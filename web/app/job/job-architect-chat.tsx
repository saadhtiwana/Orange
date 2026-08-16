"use client";

import { useState } from "react";

import { api, ApiError } from "@/lib/api";
import type { ChatTurn } from "@/lib/ai-client";
import type { JobDescription } from "@/lib/contracts/types";

import { JobDescriptionView } from "./job-description-view";

export function JobArchitectChat() {
  const [brief, setBrief] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = brief.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);

    try {
      const { jobDescription: drafted, jobId: savedId } = await api.draftJob(trimmed, history);
      setHistory((previous) => [
        ...previous,
        { role: "user", content: trimmed },
        { role: "assistant", content: `Drafted "${drafted.title}".` },
      ]);
      setJobDescription(drafted);
      setJobId(savedId);
      setBrief("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <ol className="flex flex-col gap-3">
          {history.map((turn, index) => (
            <li key={`${turn.role}-${index}`} className="flex flex-col gap-[7px]">
              <span className="text-ink-3 flex items-center gap-[6px] font-mono text-[9px] font-semibold tracking-[0.14em]">
                {turn.role === "assistant" && (
                  <span className="bg-signal size-[5px] rounded-full" />
                )}
                {turn.role === "user" ? "YOU" : "ORANGE"}
              </span>
              <span
                className={
                  turn.role === "user"
                    ? "text-ink text-[13.5px] leading-[1.65]"
                    : "text-ink-2 text-[13.5px] leading-[1.65]"
                }
              >
                {turn.content}
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={5}
            placeholder="Senior backend engineer in Berlin, hybrid. Python and Postgres, payments experience matters. Five years or so."
            className="border-line-2 bg-card focus:border-signal w-full resize-y rounded-lg border p-3 text-[13.5px] outline-none"
          />
          <button
            type="submit"
            disabled={pending || brief.trim().length === 0}
            className="bg-signal hover:bg-signal-hover self-start rounded-lg px-4 py-2 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-white transition-colors disabled:opacity-40"
          >
            {pending ? "DRAFTING…" : "DRAFT JOB DESCRIPTION"}
          </button>
        </form>

        {error && (
          <p
            role="alert"
            className="text-weak-text bg-weak-bg border-weak-border rounded-lg border p-3 text-[13px]"
          >
            {error}
          </p>
        )}
      </div>

      <div className="border-line bg-card rounded-xl border p-6">
        {jobDescription ? (
          <>
            <JobDescriptionView jobDescription={jobDescription} />
            {jobId && <p className="text-ink-3 mt-4 font-mono text-[10px]">Saved as {jobId}</p>}
          </>
        ) : (
          <p className="text-ink-3 text-[13px]">
            Describe the role and the structured job description appears here.
          </p>
        )}
      </div>
    </div>
  );
}
