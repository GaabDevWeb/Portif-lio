"use client";

import { useMemo, useState } from "react";

import { LabViewport } from "@/studio/LabViewport";
import { AnimationTimeline } from "@/studio/animation/AnimationTimeline";
import { WorkspaceView } from "@/studio/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/studio/workspace/useWorkspaceViewport";
import type {
  AsciiAnimation,
  AsciiAnimationFrame,
  TimelineState,
} from "@/features/ascii-interaction/animation-pipeline";
import type { AsciiInteractionConfig, AsciiEngineStats } from "@/features/ascii-interaction/types";
import {
  composeOnionPreview,
  getOnionSkinLayers,
} from "@/features/ascii-engine/animator";

interface AnimationResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  currentFrame: AsciiAnimationFrame | null;
  animation?: AsciiAnimation | null;
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
  animation = null,
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
  const [onionSkinEnabled, setOnionSkinEnabled] = useState(false);
  const frameIndex = timeline?.currentFrame ?? 0;

  const displayMatrix = useMemo(() => {
    if (!currentFrame?.matrix) return null;
    if (!onionSkinEnabled || !animation) return currentFrame.matrix;
    const { layers } = getOnionSkinLayers(animation, frameIndex, {
      enabled: true,
      prevOpacity: 0.35,
      nextOpacity: 0.25,
    });
    return composeOnionPreview(currentFrame.matrix, layers);
  }, [animation, currentFrame, frameIndex, onionSkinEnabled]);

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
          onionSkinEnabled={onionSkinEnabled}
          onOnionSkinToggle={setOnionSkinEnabled}
        />
      }
    >
      {displayMatrix ? (
        <LabViewport
          source={displayMatrix}
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
