"use client";

import { LabViewport } from "@/labs/ascii/LabViewport";
import { AnimationTimeline } from "@/labs/ascii/animation/AnimationTimeline";
import { WorkspaceView } from "@/labs/ascii/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/labs/ascii/workspace/useWorkspaceViewport";
import type {
  AsciiAnimationFrame,
  TimelineState,
} from "@/features/ascii-interaction/animation-pipeline";
import type { AsciiInteractionConfig, AsciiEngineStats } from "@/features/ascii-interaction/types";

interface AnimationResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  currentFrame: AsciiAnimationFrame | null;
  config: AsciiInteractionConfig;
  debugEnabled?: boolean;
  timeline: TimelineState | null;
  frameCount: number;
  loop: boolean;
  onStats?: (stats: AsciiEngineStats) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSeekFrame: (frame: number) => void;
  onStepFrame: (delta: number) => void;
  onLoopToggle: (loop: boolean) => void;
  onFpsChange: (fps: number) => void;
}

export function AnimationResultView({
  workspace,
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
}: AnimationResultViewProps) {
  return (
    <WorkspaceView
      workspace={workspace}
      hasOriginal={!!previewUrl}
      originalUrl={previewUrl}
      originalAlt="GIF original"
      footer={
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
      }
    >
      {currentFrame ? (
        <LabViewport
          source={currentFrame.matrix}
          config={config}
          debugEnabled={debugEnabled}
          onStats={onStats}
          className="h-full"
        />
      ) : (
        <div className="flex h-full items-center justify-center font-mono text-[10px] text-[var(--ui-text-dim)]">
          Aguardando conversão…
        </div>
      )}
    </WorkspaceView>
  );
}
