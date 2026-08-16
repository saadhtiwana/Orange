/**
 * Pure scoring helpers for the audit view. No React — unit-testable.
 */
import type { Evidence, ScoreWithEvidence } from "@/lib/contracts/types";

/**
 * Evidence in a `ScoreWithEvidence` hangs off the dimensions (and optionally the
 * requirement results), each citation tagged with the `requirement_id` it
 * speaks to. Invert that into `requirement_id → citations` so the audit view can
 * draw the trail requirement → outcome → verbatim quotes. Citations without a
 * requirement_id are ignored (they belong to no requirement row).
 */
export function groupEvidenceByRequirement(score: ScoreWithEvidence): Map<string, Evidence[]> {
  const byRequirement = new Map<string, Evidence[]>();

  const collect = (list?: Evidence[]) =>
    list?.forEach((ev) => {
      if (!ev.requirement_id) return;
      const existing = byRequirement.get(ev.requirement_id) ?? [];
      existing.push(ev);
      byRequirement.set(ev.requirement_id, existing);
    });

  score.dimensions?.forEach((dimension) => collect(dimension.evidence));
  score.requirement_results?.forEach((result) => collect(result.evidence));

  return byRequirement;
}
