"use client";

import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";

import { formatTimeMs } from "@/features/ascii-interaction/animation-pipeline";
import type { TimelineState } from "@/features/ascii-interaction/animation-pipeline";

interface AnimationTimelineProps {
  timeline: TimelineState | null;
  frameCount: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSeekFrame: (frame: number) => void;
  onStepFrame: (delta: number) => void;
  onLoopToggle: (loop: boolean) => void;
  onFpsChange: (fps: number) => void;
  loop: boolean;
}

export function AnimationTimeline({
  timeline,
  frameCount,
  onPlay,
  onPause,
  onStop,
  onRestart,
  onSeekFrame,
  onStepFrame,
  onLoopToggle,
  onFpsChange,
  loop,
}: AnimationTimelineProps) {
  const current = timeline?.currentFrame ?? 0;
  const total = Math.max(1, frameCount);
  const percent = (current / Math.max(1, total - 1)) * 100;

  return (
    <div className="border-t border-[var(--ui-border)] bg-[var(--bg-panel)] px-3 py-2">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-[var(--ui-text-dim)]">
        <span>
          Frame {current + 1} / {total}
        </span>
        <span>
          {formatTimeMs(timeline?.currentTimeMs ?? 0)} / {formatTimeMs(timeline?.totalTimeMs ?? 0)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={current}
        onChange={(e) => onSeekFrame(Number(e.target.value))}
        className="mb-2 w-full cursor-pointer accent-[var(--phosphor-primary)]"
        aria-label="Scrubber de frames"
      />

      <div
        className="mb-2 h-1 w-full rounded bg-[var(--ui-border)]"
        aria-hidden
      >
        <div
          className="h-full rounded bg-[var(--phosphor-primary)] transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <TransportButton label="Stop" onClick={onStop}>
          <Square size={12} />
        </TransportButton>
        <TransportButton label="Frame anterior" onClick={() => onStepFrame(-1)}>
          <SkipBack size={12} />
        </TransportButton>
        {timeline?.status === "playing" ? (
          <TransportButton label="Pause" onClick={onPause}>
            <Pause size={12} />
          </TransportButton>
        ) : (
          <TransportButton label="Play" onClick={onPlay}>
            <Play size={12} />
          </TransportButton>
        )}
        <TransportButton label="Próximo frame" onClick={() => onStepFrame(1)}>
          <SkipForward size={12} />
        </TransportButton>
        <TransportButton label="Restart" onClick={onRestart}>
          <RotateCcw size={12} />
        </TransportButton>

        <label className="ml-auto flex cursor-pointer items-center gap-1.5 font-mono text-[10px] text-[var(--ui-text-dim)]">
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => onLoopToggle(e.target.checked)}
            className="accent-[var(--phosphor-primary)]"
          />
          Loop
        </label>

        <label className="flex items-center gap-1 font-mono text-[10px] text-[var(--ui-text-dim)]">
          FPS
          <input
            type="number"
            min={1}
            max={60}
            value={timeline?.fps ?? 15}
            onChange={(e) => onFpsChange(Number(e.target.value))}
            className="w-12 rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-1 py-0.5 text-[var(--ui-text)]"
          />
        </label>
      </div>
    </div>
  );
}

function TransportButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="cursor-pointer rounded border border-[var(--ui-border)] p-1.5 text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
    >
      {children}
    </button>
  );
}
