import type { DragEvent } from "react";

import type { PipelineCard } from "@/lib/pipeline/types";

import { BandBadge, ScoringPill, Skeleton } from "./ui";

interface CandidateCardProps {
  card: PipelineCard;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onOpen: () => void;
  /** Keyboard move: +1 = next stage, -1 = previous. */
  onMove: (direction: 1 | -1) => void;
  dragging: boolean;
}

/**
 * One board card. Scored candidates show their band, overall, confidence and
 * top strength; unscored ones (`score` is null) show the "scoring…" pending
 * state with shimmer lines — never a fake number. Rejected cards are dimmed
 * until hovered.
 */
export function CandidateCard({
  card,
  onDragStart,
  onDragEnd,
  onOpen,
  onMove,
  dragging,
}: CandidateCardProps) {
  const rejected = card.stage === "rejected";
  const scoreLabel = card.score ? `${card.score.band} ${card.score.overall}` : "still scoring";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          onMove(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          onMove(-1);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${card.fullName}, ${scoreLabel}, ${card.stage}. Enter to open; left or right arrow to change stage.`}
      className={`bg-card border-line hover:border-line-2 shadow-card hover:shadow-card-hover group cursor-grab rounded-lg border p-4 transition-[border-color,box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 active:cursor-grabbing ${
        rejected ? "opacity-55 hover:opacity-100" : ""
      } ${dragging ? "opacity-40" : ""}`}
    >
      <div className="text-[15px] font-semibold tracking-[-0.01em]">{card.fullName}</div>
      {card.headline && <div className="text-ink-2 mt-[3px] text-[12.5px]">{card.headline}</div>}
      {card.location && <div className="text-ink-3 mt-[3px] text-[11px]">{card.location}</div>}

      {card.score ? (
        <>
          <div className="mt-[14px] flex items-center">
            <BandBadge band={card.score.band} value={card.score.overall} />
            <span
              className="text-ink-4 ml-auto text-[11.5px] tabular-nums"
              title={`confidence ${card.score.confidence}`}
            >
              {card.score.confidence.toFixed(2)}
            </span>
          </div>
          {card.score.topStrength && (
            <div className="text-ink-2 mt-3 flex gap-[7px] text-[12.5px] leading-[1.5]">
              <span className="text-ink-4 flex-none">↳</span>
              <span>{card.score.topStrength}</span>
            </div>
          )}
        </>
      ) : (
        <div className="mt-[14px]">
          <ScoringPill />
          <Skeleton width="82%" className="mt-3" />
        </div>
      )}
    </div>
  );
}
