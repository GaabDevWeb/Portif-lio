"use client";

import { LabViewport } from "@/labs/ascii/LabViewport";
import { AnimationTimeline } from "@/labs/ascii/animation/AnimationTimeline";
import { WorkspaceView } from "@/labs/ascii/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/labs/ascii/workspace/useWorkspaceViewport";
import type { LabViewportProps } from "@/labs/ascii/types";
import type { AsciiAnimationFrame, TimelineState } from "@/features/ascii-interaction/animation-pipeline";

interface AnimationResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  currentFrame: AsciiAnimationFrame | null;
  frameRevision: number;
  config: LabViewportProps["config"];
  debugEnabled: boolean;
  debugFlags: LabViewportProps["debugFlags"];
  timeline: TimelineState | null;
  frameCount: number;
  loop: boolean;
  onMetrics?: LabViewportProps["onMetrics"];
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
  frameRevision,
  config,
  debugEnabled,
  debugFlags,
  timeline,
  frameCount,
  loop,
  onMetrics,
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
          revision={`${currentFrame.index}-${frameRevision}`}
          source={currentFrame.matrix}
          config={config}
          debugEnabled={debugEnabled}
          debugFlags={debugFlags}
          onMetrics={onMetrics}
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
