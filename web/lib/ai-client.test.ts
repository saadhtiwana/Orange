import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AiServiceError, architectJob } from "./ai-client";

const originalFetch = globalThis.fetch;

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const spy = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...response,
  });
  globalThis.fetch = spy as unknown as typeof fetch;
  return spy;
}

describe("architectJob", () => {
  beforeEach(() => {
    process.env.AI_SERVICE_URL = "http://ai.test";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("posts the brief and history to the AI service", async () => {
    const spy = mockFetch({
      json: async () => ({ job_description: { title: "Backend Engineer" } }),
    });

    await architectJob({
      brief: "Backend engineer in Berlin",
      history: [{ role: "user", content: "earlier" }],
    });

    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("http://ai.test/job/architect");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      brief: "Backend engineer in Berlin",
      history: [{ role: "user", content: "earlier" }],
    });
  });

  it("unwraps the job_description from the envelope", async () => {
    mockFetch({ json: async () => ({ job_description: { title: "Backend Engineer" } }) });

    const result = await architectJob({ brief: "Backend engineer" });

    expect(result.title).toBe("Backend Engineer");
  });

  it("defaults history to an empty array", async () => {
    const spy = mockFetch({ json: async () => ({ job_description: { title: "x" } }) });

    await architectJob({ brief: "Backend engineer" });

    expect(JSON.parse(spy.mock.calls[0][1].body).history).toEqual([]);
  });

  it("preserves the upstream status code so the BFF can pass it through", async () => {
    mockFetch({
      ok: false,
      status: 503,
      json: async () => ({ error: { message: "ANTHROPIC_API_KEY is not set." } }),
    });

    await expect(architectJob({ brief: "Backend engineer" })).rejects.toMatchObject({
      name: "AiServiceError",
      status: 503,
      message: "ANTHROPIC_API_KEY is not set.",
    });
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    mockFetch({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(architectJob({ brief: "Backend engineer" })).rejects.toThrow(
      "The AI service returned 500.",
    );
  });

  it("reports an unreachable service as a bad gateway", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("ECONNREFUSED")) as unknown as typeof fetch;

    const error = await architectJob({ brief: "Backend engineer" }).catch((e) => e);

    expect(error).toBeInstanceOf(AiServiceError);
    expect(error.status).toBe(502);
    expect(error.message).toContain("Is it running?");
  });

  it("reports a timeout as a gateway timeout", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    globalThis.fetch = vi.fn().mockRejectedValue(abortError) as unknown as typeof fetch;

    const error = await architectJob({ brief: "Backend engineer" }).catch((e) => e);

    expect(error.status).toBe(504);
  });
});
