/**
 * Runtime configuration.
 *
 * `API_BASE` is the single seam between the mock API and the real backend.
 * Everything in the UI talks to the pipeline API through this prefix, so
 * switching from the Week 1 mock to the real endpoints is one env var — no
 * component changes. Defaults to the in-app mock.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api/mock";
