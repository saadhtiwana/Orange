/**
 * Typed client for the pipeline API.
 *
 * The one place the UI knows how to talk to the backend: every URL, method, and
 * response shape lives here, so screens call `api.getBoard()` instead of
 * hand-writing fetches. All requests go through `API_BASE` (see lib/config.ts),
 * so pointing the whole app at the real backend is a config change, not a code
 * change. Errors surface as `ApiError` carrying the HTTP status and the server's
 * message.
 */
import type { ChatTurn } from "./ai-client";
import { API_BASE } from "./config";
import type { CandidateProfile, JobDescription, ScoreWithEvidence } from "./contracts/types";
import type { PipelineBoard, PipelineCard, PipelineStage } from "./pipeline/types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    // The mock (and the real backend) return { error } on failure — surface it.
    let message = `Request failed (${res.status}).`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

const jsonBody = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export const api = {
  listJobs: () => request<{ jobs: JobDescription[] }>("/jobs").then((r) => r.jobs),

  getJob: (jobId: string) => request<{ job: JobDescription }>(`/jobs/${jobId}`).then((r) => r.job),

  getBoard: (jobId?: string) =>
    request<PipelineBoard>(`/pipeline${jobId ? `?jobId=${encodeURIComponent(jobId)}` : ""}`),

  moveCandidate: (candidateId: string, jobId: string, stage: PipelineStage) =>
    request<{ card: PipelineCard }>(
      "/pipeline",
      jsonBody("PATCH", { candidateId, jobId, stage }),
    ).then((r) => r.card),

  getCandidate: (candidateId: string) =>
    request<{ candidate: CandidateProfile; scores: ScoreWithEvidence[] }>(
      `/candidates/${candidateId}`,
    ),

  draftJob: (brief: string, history: ChatTurn[]) =>
    request<{ jobId: string; jobDescription: JobDescription }>(
      "/job/architect",
      jsonBody("POST", { brief, history }),
    ),
};
