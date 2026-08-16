"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";

import { CandidateCard } from "@/components/candidate-card";
import { btn, DisplayTitle } from "@/components/ui";
import { api } from "@/lib/api";
import { adjacentStage, boardTotals, isInStage, moveCardLocally } from "@/lib/pipeline/board-utils";
import {
  PIPELINE_STAGES,
  STAGE_LABELS,
  type PipelineBoard as Board,
  type PipelineStage,
} from "@/lib/pipeline/types";

export function PipelineBoard() {
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getBoard()
      .then((data) => !cancelled && setBoard(data))
      .catch((err: Error) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const persistMove = useCallback(
    async (candidateId: string, stage: PipelineStage, previous: Board) => {
      try {
        await api.moveCandidate(candidateId, previous.jobId, stage);
      } catch {
        // Roll the optimistic move back if the server rejected it.
        setBoard(previous);
        setError("Couldn't save that move — put it back.");
      }
    },
    [],
  );

  // Shared by drag-drop and keyboard: optimistic move + persist + rollback.
  const moveTo = useCallback(
    (candidateId: string, stage: PipelineStage) => {
      if (!board || isInStage(board, candidateId, stage)) return; // no-op
      const previous = board;
      setBoard(moveCardLocally(board, candidateId, stage)); // optimistic
      setError(null);
      void persistMove(candidateId, stage, previous);
    },
    [board, persistMove],
  );

  const handleDrop = useCallback(
    (stage: PipelineStage) => {
      setDragOverStage(null);
      const candidateId = draggingId;
      setDraggingId(null);
      if (candidateId) moveTo(candidateId, stage);
    },
    [draggingId, moveTo],
  );

  const totals = useMemo(() => (board ? boardTotals(board) : { all: 0, scoring: 0 }), [board]);

  if (error && !board) {
    return <p className="text-weak-text p-10 font-mono text-sm">{error}</p>;
  }
  if (!board) {
    return <p className="text-ink-3 p-10 font-mono text-sm">Loading board…</p>;
  }

  return (
    <div className="o-fade-in flex min-h-0 flex-1 flex-col">
      {/* Job header */}
      <div className="border-line bg-card flex flex-none items-end justify-between gap-6 border-b px-7 py-6">
        <DisplayTitle lead="Pipeline" subject={board.jobTitle} size={28} />
        <div className="text-ink-3 flex items-center gap-2 pb-1 font-mono text-[10.5px] tabular-nums">
          {totals.scoring > 0 && (
            <span className="bg-signal size-[5px] rounded-full [animation:var(--animate-pulse-dot)]" />
          )}
          {totals.all} candidates
          {totals.scoring > 0 ? ` · ${totals.scoring} scoring` : " · all scored"}
        </div>
      </div>

      {/* Columns — or an empty state when the role has no candidates yet */}
      {totals.all === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <div className="text-[16px] font-semibold">No candidates yet</div>
          <p className="text-ink-2 mt-2 max-w-sm text-[13px] leading-[1.6]">
            Upload CVs and Orange starts reading immediately — first scores land within a minute.
          </p>
          <Link href="/upload" className={btn("primary", "mt-6")}>
            UPLOAD CVS
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div
            className="grid min-h-full px-3"
            style={{
              gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, minmax(244px, 1fr))`,
              minWidth: 1260,
            }}
          >
            {PIPELINE_STAGES.map((stage, index) => {
              const column = board.columns.find((c) => c.stage === stage);
              const cards = column?.cards ?? [];
              return (
                <div
                  key={stage}
                  onDragOver={(e: DragEvent) => {
                    e.preventDefault();
                    setDragOverStage(stage);
                  }}
                  onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
                  onDrop={() => handleDrop(stage)}
                  className={`flex flex-col gap-[14px] px-4 pt-[22px] pb-8 transition-colors duration-200 ${
                    index > 0 ? "border-line border-l" : ""
                  } ${dragOverStage === stage ? "bg-signal-tint" : ""}`}
                >
                  <div className="flex items-baseline gap-2 px-[2px] pb-1">
                    <span className="text-ink-2 font-mono text-[10px] font-semibold tracking-[0.12em]">
                      {STAGE_LABELS[stage].toUpperCase()}
                    </span>
                    <span className="text-ink-3 font-mono text-[10px] tabular-nums">
                      {cards.length}
                    </span>
                  </div>

                  {cards.map((card) => (
                    <CandidateCard
                      key={card.candidateId}
                      card={card}
                      dragging={draggingId === card.candidateId}
                      onOpen={() => router.push(`/candidate/${card.candidateId}`)}
                      onMove={(direction) => {
                        const target = adjacentStage(card.stage, direction);
                        if (target) moveTo(card.candidateId, target);
                      }}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", card.candidateId);
                        setDraggingId(card.candidateId);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && board && (
        <div className="border-line text-weak-text flex h-10 flex-none items-center border-t px-7 font-mono text-[10px]">
          {error}
        </div>
      )}
    </div>
  );
}
