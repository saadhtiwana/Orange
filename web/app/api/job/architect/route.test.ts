import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiServiceError } from "@/lib/ai-client";

const architectJob = vi.hoisted(() => vi.fn());
const saveJobDescription = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ai-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai-client")>("@/lib/ai-client");
  return { ...actual, architectJob };
});

vi.mock("@/lib/jobs/repository", () => ({ saveJobDescription }));

const { POST } = await import("./route");

const SAMPLE_JD = { title: "Backend Engineer", schema_version: "1.0" };

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/job/architect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/job/architect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    architectJob.mockResolvedValue(SAMPLE_JD);
    saveJobDescription.mockResolvedValue({ id: "job-123", createdAt: new Date() });
  });

  it("returns the job description and the persisted id", async () => {
    const response = await post({ brief: "Backend engineer in Berlin" });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      jobId: "job-123",
      jobDescription: SAMPLE_JD,
    });
  });

  it("persists what the AI service returned", async () => {
    await post({ brief: "Backend engineer" });

    expect(saveJobDescription).toHaveBeenCalledWith(SAMPLE_JD);
  });

  it("rejects a blank brief without calling the AI service", async () => {
    const response = await post({ brief: "   " });

    expect(response.status).toBe(400);
    expect(architectJob).not.toHaveBeenCalled();
  });

  it("rejects a non-JSON body", async () => {
    const response = await post("not json at all");

    expect(response.status).toBe(400);
  });

  it("drops malformed history entries rather than forwarding them", async () => {
    await post({
      brief: "Backend engineer",
      history: [
        { role: "user", content: "keep me" },
        { role: "system", content: "wrong role" },
        { role: "assistant", content: 42 },
        "not an object",
      ],
    });

    expect(architectJob).toHaveBeenCalledWith({
      brief: "Backend engineer",
      history: [{ role: "user", content: "keep me" }],
    });
  });

  it("passes the AI service's status code through", async () => {
    architectJob.mockRejectedValue(new AiServiceError("no key configured", 503));

    const response = await post({ brief: "Backend engineer" });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "no key configured" });
  });

  it("does not claim success when the draft could not be saved", async () => {
    saveJobDescription.mockRejectedValue(new Error("connection refused"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await post({ brief: "Backend engineer" });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain("could not save it");
    expect(body.jobDescription).toBeUndefined();
  });
});
