/**
 * In-memory backing store for the mock pipeline API.
 *
 * Plays the role Postgres will play for the real endpoints: everything is
 * indexed by id so reads are O(1), and the board is assembled per request the
 * way a query would. State lives for the life of the server process — moves
 * persist across requests, and a restart reseeds from fixtures. Like
 * lib/prisma.ts, the instance is stashed on globalThis so dev hot-reloads
 * don't silently reset the board.
 */
import type { CandidateProfile, JobDescription, ScoreWithEvidence } from "@/lib/contracts/types";
import type { PipelineBoard, PipelineCard, PipelineStage } from "@/lib/pipeline/types";
import { PIPELINE_STAGES } from "@/lib/pipeline/types";

import { MOCK_CANDIDATES, MOCK_JOBS, MOCK_SCORES, MOCK_STAGES } from "./fixtures";

export type MoveResult =
  { ok: true; card: PipelineCard } | { ok: false; reason: "job_not_found" | "candidate_not_found" };

export class MockPipelineStore {
  private readonly jobs = new Map<string, JobDescription>();
  private readonly candidates = new Map<string, CandidateProfile>();
  /** Keyed `${jobId}:${candidateId}` — one score per candidate per job. */
  private readonly scores = new Map<string, ScoreWithEvidence>();
  /** Keyed `${jobId}:${candidateId}` — the candidate's column on that job's board. */
  private readonly stages = new Map<string, PipelineStage>();

  constructor() {
    for (const job of MOCK_JOBS) {
      if (!job.id) throw new Error(`Fixture job "${job.title}" is missing an id.`);
      this.jobs.set(job.id, job);

      for (const candidate of MOCK_CANDIDATES) {
        if (!candidate.id) {
          throw new Error(`Fixture candidate "${candidate.full_name}" is missing an id.`);
        }
        this.candidates.set(candidate.id, candidate);
        this.stages.set(this.key(job.id, candidate.id), MOCK_STAGES[candidate.id] ?? "applied");
      }
    }

    for (const score of MOCK_SCORES) {
      this.scores.set(this.key(score.job_id, score.candidate_id), score);
    }
  }

  listJobs(): JobDescription[] {
    return [...this.jobs.values()];
  }

  getJob(jobId: string): JobDescription | null {
    return this.jobs.get(jobId) ?? null;
  }

  listCandidates(): CandidateProfile[] {
    return [...this.candidates.values()];
  }

  getCandidate(candidateId: string): CandidateProfile | null {
    return this.candidates.get(candidateId) ?? null;
  }

  /** All scores this candidate has, across jobs — the profile view needs them. */
  getScoresForCandidate(candidateId: string): ScoreWithEvidence[] {
    return [...this.scores.values()].filter((score) => score.candidate_id === candidateId);
  }

  getBoard(jobId: string): PipelineBoard | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    const columns = PIPELINE_STAGES.map((stage) => ({ stage, cards: [] as PipelineCard[] }));
    const byStage = new Map(columns.map((column) => [column.stage, column.cards]));

    for (const candidate of this.candidates.values()) {
      const stage = this.stages.get(this.key(jobId, candidate.id!))!;
      byStage.get(stage)!.push(this.toCard(jobId, candidate, stage));
    }

    // Ranked candidates first, best on top; unscored ones follow by name.
    for (const column of columns) {
      column.cards.sort(
        (a, b) =>
          (b.score?.overall ?? -1) - (a.score?.overall ?? -1) ||
          a.fullName.localeCompare(b.fullName),
      );
    }

    return { jobId, jobTitle: job.title, columns };
  }

  moveCandidate(jobId: string, candidateId: string, stage: PipelineStage): MoveResult {
    if (!this.jobs.has(jobId)) return { ok: false, reason: "job_not_found" };

    const candidate = this.candidates.get(candidateId);
    if (!candidate) return { ok: false, reason: "candidate_not_found" };

    this.stages.set(this.key(jobId, candidateId), stage);
    return { ok: true, card: this.toCard(jobId, candidate, stage) };
  }

  private toCard(jobId: string, candidate: CandidateProfile, stage: PipelineStage): PipelineCard {
    const score = this.scores.get(this.key(jobId, candidate.id!));
    const location = candidate.location;

    return {
      candidateId: candidate.id!,
      fullName: candidate.full_name,
      headline: candidate.headline ?? null,
      location: [location?.city, location?.country].filter(Boolean).join(", ") || null,
      stage,
      score: score
        ? {
            overall: score.overall.score,
            band: score.overall.band,
            confidence: score.overall.confidence,
            topStrength: score.strengths?.[0] ?? null,
          }
        : null,
    };
  }

  private key(jobId: string, candidateId: string): string {
    return `${jobId}:${candidateId}`;
  }
}

const globalForMock = globalThis as unknown as {
  mockPipelineStore: MockPipelineStore | undefined;
};

export function getMockStore(): MockPipelineStore {
  globalForMock.mockPipelineStore ??= new MockPipelineStore();
  return globalForMock.mockPipelineStore;
}

/** Test hook: drop all state so the next getMockStore() reseeds from fixtures. */
export function resetMockStore(): void {
  globalForMock.mockPipelineStore = undefined;
}
