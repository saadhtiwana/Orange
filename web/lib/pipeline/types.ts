/**
 * Pipeline domain types.
 *
 * The hiring pipeline (which stage a candidate is in for a job) is app state,
 * not an AI contract, so it lives here rather than in lib/contracts. Everything
 * that crosses the wire for the Kanban board is defined in this file — the mock
 * API serves these shapes today and the real backend replaces it without the UI
 * changing.
 */
import type { ScoreBand } from "@/lib/contracts/types";

/** Board columns, in display order. */
export const PIPELINE_STAGES = [
  "applied",
  "shortlisted",
  "interview",
  "offer",
  "rejected",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export function isPipelineStage(value: unknown): value is PipelineStage {
  return typeof value === "string" && (PIPELINE_STAGES as readonly string[]).includes(value);
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

/**
 * What a board card needs and nothing more. Full profiles carry raw CV text,
 * and full scores carry every citation — far too heavy to send once per card.
 * Detail views fetch the candidate endpoint instead.
 */
export interface PipelineCard {
  candidateId: string;
  fullName: string;
  headline: string | null;
  location: string | null;
  stage: PipelineStage;
  /** Null until the ranker has scored this candidate — render as "scoring…". */
  score: PipelineCardScore | null;
}

export interface PipelineCardScore {
  band: ScoreBand;
  confidence: number;
  overall: number;
  /** Leading strength from the score summary, for the card's one-liner. */
  topStrength: string | null;
}

export interface PipelineColumn {
  cards: PipelineCard[];
  stage: PipelineStage;
}

/** GET /api/mock/pipeline response. */
export interface PipelineBoard {
  columns: PipelineColumn[];
  jobId: string;
  jobTitle: string;
}

/** PATCH /api/mock/pipeline request body. */
export interface MoveCandidateRequest {
  candidateId: string;
  jobId: string;
  stage: PipelineStage;
}
