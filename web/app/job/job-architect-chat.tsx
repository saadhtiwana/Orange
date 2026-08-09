"use client";

import { useState } from "react";

import type { ChatTurn } from "@/lib/ai-client";
import type { JobDescription } from "@/lib/contracts/types";

import { JobDescriptionView } from "./job-description-view";

interface ArchitectSuccess {
  jobId: string;
  jobDescription: JobDescription;
}

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
      const response = await fetch("/api/job/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed, history }),
      });

      const payload = (await response.json()) as Partial<ArchitectSuccess> & { error?: string };

      if (!response.ok || !payload.jobDescription) {
        setError(payload.error ?? "Something went wrong.");
        return;
      }

      setHistory((previous) => [
        ...previous,
        { role: "user", content: trimmed },
        { role: "assistant", content: `Drafted "${payload.jobDescription!.title}".` },
      ]);
      setJobDescription(payload.jobDescription);
      setJobId(payload.jobId ?? null);
      setBrief("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <ol className="flex flex-col gap-2">
          {history.map((turn, index) => (
            <li
              key={`${turn.role}-${index}`}
              className={
                turn.role === "user"
                  ? "self-end rounded-lg bg-orange-600 px-3 py-2 text-sm text-white"
                  : "self-start rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800"
              }
            >
              {turn.content}
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={5}
            placeholder="Senior backend engineer in Berlin, hybrid. Python and Postgres, payments experience matters. Five years or so."
            className="w-full resize-y rounded-lg border border-zinc-300 bg-transparent p-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700"
          />
          <button
            type="submit"
            disabled={pending || brief.trim().length === 0}
            className="self-start rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {pending ? "Drafting…" : "Draft job description"}
          </button>
        </form>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950">
            {error}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {jobDescription ? (
          <>
            <JobDescriptionView jobDescription={jobDescription} />
            {jobId && <p className="mt-4 text-xs text-zinc-400">Saved as {jobId}</p>}
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Describe the role and the structured job description appears here.
          </p>
        )}
      </div>
    </div>
  );
}
