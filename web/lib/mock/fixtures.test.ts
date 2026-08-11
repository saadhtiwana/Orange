/**
 * The mock data must honour the invariants the real agents guarantee —
 * otherwise UIs built against the mock break the day the real backend lands.
 */
import { describe, expect, it } from "vitest";

import { MOCK_CANDIDATES, MOCK_JOB, MOCK_JOBS, MOCK_SCORES, MOCK_STAGES } from "./fixtures";

const candidatesById = new Map(MOCK_CANDIDATES.map((candidate) => [candidate.id, candidate]));
const jobRequirementIds = new Set((MOCK_JOB.requirements ?? []).map((req) => req.id));

describe("mock fixtures", () => {
  it("gives every job and candidate an id", () => {
    for (const job of MOCK_JOBS) expect(job.id).toBeTruthy();
    for (const candidate of MOCK_CANDIDATES) expect(candidate.id).toBeTruthy();
  });

  it("assigns every candidate a pipeline stage", () => {
    for (const candidate of MOCK_CANDIDATES) {
      expect(MOCK_STAGES[candidate.id!], `stage for ${candidate.full_name}`).toBeDefined();
    }
  });

  it("weights the job's requirements to a total of 1", () => {
    const total = (MOCK_JOB.requirements ?? []).reduce((sum, req) => sum + req.weight, 0);
    expect(total).toBeCloseTo(1);
  });

  it("scores only candidates and jobs that exist", () => {
    for (const score of MOCK_SCORES) {
      expect(candidatesById.has(score.candidate_id), score.candidate_id).toBe(true);
      expect(score.job_id).toBe(MOCK_JOB.id);
    }
  });

  it("keeps scores and confidences within contract bounds", () => {
    for (const score of MOCK_SCORES) {
      expect(score.overall.score).toBeGreaterThanOrEqual(0);
      expect(score.overall.score).toBeLessThanOrEqual(100);
      expect(score.overall.confidence).toBeGreaterThanOrEqual(0);
      expect(score.overall.confidence).toBeLessThanOrEqual(1);

      for (const dimension of score.dimensions ?? []) {
        expect(dimension.score).toBeGreaterThanOrEqual(0);
        expect(dimension.score).toBeLessThanOrEqual(100);
        expect(dimension.weight).toBeGreaterThanOrEqual(0);
        expect(dimension.weight).toBeLessThanOrEqual(1);
      }
    }
  });

  it("points every requirement result at a requirement on the job", () => {
    for (const score of MOCK_SCORES) {
      for (const result of score.requirement_results ?? []) {
        expect(jobRequirementIds.has(result.requirement_id), result.requirement_id).toBe(true);
      }
    }
  });

  it("quotes evidence verbatim from the candidate's raw_text", () => {
    for (const score of MOCK_SCORES) {
      const rawText = candidatesById.get(score.candidate_id)?.raw_text ?? "";

      for (const dimension of score.dimensions ?? []) {
        for (const evidence of dimension.evidence ?? []) {
          expect(rawText, `${score.candidate_id}: "${evidence.quote}"`).toContain(evidence.quote);

          if (evidence.requirement_id) {
            expect(jobRequirementIds.has(evidence.requirement_id)).toBe(true);
          }
        }
      }
    }
  });
});
