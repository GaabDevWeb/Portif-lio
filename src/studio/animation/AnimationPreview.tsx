"use client";

import { LabViewport, type LabViewportProps } from "@/studio/LabViewport";
import { AnimationTimeline } from "@/studio/animation/AnimationTimeline";
import type {
  AsciiAnimationFrame,
  TimelineState,
} from "@/features/ascii-interaction/animation-pipeline";

/** Legado side-by-side — preferir AnimationResultView + Workspace. */
interface AnimationPreviewProps {
  previewUrl: string | null;
  currentFrame: AsciiAnimationFrame | null;
  config: LabViewportProps["config"];
  debugEnabled?: boolean;
  timeline: TimelineState | null;
  frameCount: number;
  loop: boolean;
  onStats?: LabViewportProps["onStats"];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSeekFrame: (frame: number) => void;
  onStepFrame: (delta: number) => void;
  onLoopToggle: (loop: boolean) => void;
  onFpsChange: (fps: number) => void;
}

export function AnimationPreview({
  previewUrl,
  currentFrame,
  config,
  debugEnabled = false,
  timeline,
  frameCount,
  loop,
  onStats,
  onPlay,
  onPause,
  onStop,
  onRestart,
  onSeekFrame,
  onStepFrame,
  onLoopToggle,
  onFpsChange,
}: AnimationPreviewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-[var(--ui-border)]">
        <div className="relative flex items-center justify-center bg-[var(--bg-void)] p-2">
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--phosphor-dim)]">
            GIF Original
          </span>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="GIF original" className="max-h-full max-w-full object-contain" />
          ) : (
            <p className="font-mono text-[10px] text-[var(--ui-text-dim)]">Sem GIF</p>
          )}
        </div>
        <div className="relative min-h-0 bg-[var(--bg-void)]">
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--phosphor-dim)]">
            ASCII Frame {(timeline?.currentFrame ?? 0) + 1}
          </span>
          {currentFrame ? (
            <LabViewport
              source={currentFrame.matrix}
              config={config}
              debugEnabled={debugEnabled}
              onStats={onStats}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[10px] text-[var(--ui-text-dim)]">
              Aguardando conversão…
            </div>
          )}
        </div>
      </div>

      <AnimationTimeline
        timeline={timeline}
        frameCount={frameCount}
        onPlay={onPlay}
        onPause={onPause}
        onStop={onStop}
        onRestart={onRestart}
        onSeekFrame={onSeekFrame}
        onStepFrame={onStepFrame}
        onLoopToggle={onLoopToggle}
        onFpsChange={onFpsChange}
        loop={loop}
      />
    </div>
  );
}
