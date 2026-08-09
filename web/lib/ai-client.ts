/**
 * Typed client for the FastAPI AI service.
 *
 * Server-side only. `AI_SERVICE_URL` has no `NEXT_PUBLIC_` prefix on purpose:
 * the browser talks to our route handlers, and only they talk to the AI
 * service. That keeps one authenticated hop instead of two.
 */
import type { JobDescription } from "@/lib/contracts/types";

const DEFAULT_BASE_URL = "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 120_000;

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ArchitectJobInput {
  brief: string;
  history?: ChatTurn[];
}

interface ArchitectJobResponse {
  job_description: JobDescription;
}

/** A failure reaching or returned by the AI service. */
export class AiServiceError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AiServiceError";
    this.status = status;
  }
}

function baseUrl(): string {
  return (process.env.AI_SERVICE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function timeoutMs(): number {
  const raw = Number(process.env.AI_SERVICE_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}

/**
 * Ask the Job Architect for a structured job description.
 *
 * The AI service validates its own output against the contract, so a 200 here
 * means the payload conforms — no defensive reshaping needed downstream.
 */
export async function architectJob(input: ArchitectJobInput): Promise<JobDescription> {
  const response = await fetchWithTimeout(`${baseUrl()}/job/architect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief: input.brief, history: input.history ?? [] }),
  });

  if (!response.ok) {
    throw new AiServiceError(await describeFailure(response), response.status);
  }

  const payload = (await response.json()) as ArchitectJobResponse;
  return payload.job_description;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());

  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiServiceError(`The AI service did not respond within ${timeoutMs()}ms.`, 504);
    }
    throw new AiServiceError(`Could not reach the AI service at ${baseUrl()}. Is it running?`, 502);
  } finally {
    clearTimeout(timer);
  }
}

/** Surface the service's own error message when it sent one. */
async function describeFailure(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body.error?.message) {
      return body.error.message;
    }
  } catch {
    // Non-JSON body; fall through to the generic message.
  }
  return `The AI service returned ${response.status}.`;
}
