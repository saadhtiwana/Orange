import { describe, expect, it } from "vitest";

import type { ScoreWithEvidence } from "@/lib/contracts/types";

import { groupEvidenceByRequirement } from "./evidence";

const score: ScoreWithEvidence = {
  candidate_id: "cand_1",
  job_id: "job_1",
  summary: "test",
  overall: { band: "good", score: 80, confidence: 0.8 },
  dimensions: [
    {
      dimension: "skills",
      score: 90,
      weight: 0.5,
      rationale: "strong skills",
      evidence: [
        {
          quote: "8 years of Python",
          locator: "raw_text",
          confidence: 0.9,
          polarity: "supports",
          requirement_id: "req_py",
        },
        // No requirement_id → belongs to no requirement row, must be ignored.
        { quote: "unattributed", locator: "raw_text", confidence: 0.5, polarity: "supports" },
      ],
    },
  ],
  requirement_results: [
    {
      requirement_id: "req_py",
      met: "yes",
      evidence: [
        {
          quote: "maintains the Django service",
          locator: "raw_text",
          confidence: 0.7,
          polarity: "supports",
          requirement_id: "req_py",
        },
      ],
    },
    { requirement_id: "req_k8s", met: "unknown" }, // no evidence attached
  ],
};

describe("groupEvidenceByRequirement", () => {
  it("merges dimension and requirement-result evidence under the same requirement", () => {
    const grouped = groupEvidenceByRequirement(score);
    expect(grouped.get("req_py")).toHaveLength(2);
  });

  it("omits requirements that have no evidence", () => {
    expect(groupEvidenceByRequirement(score).has("req_k8s")).toBe(false);
  });

  it("ignores citations with no requirement_id", () => {
    const grouped = groupEvidenceByRequirement(score);
    expect([...grouped.keys()]).toEqual(["req_py"]);
  });

  it("returns an empty map for a score with no evidence", () => {
    const bare: ScoreWithEvidence = {
      candidate_id: "c",
      job_id: "j",
      summary: "s",
      overall: { band: "weak", score: 10, confidence: 0.5 },
    };
    expect(groupEvidenceByRequirement(bare).size).toBe(0);
  });
});
