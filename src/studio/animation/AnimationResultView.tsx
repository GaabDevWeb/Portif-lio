"use client";

import { useMemo, useState } from "react";

import { MatrixPreview } from "@/studio/MatrixPreview";
import { AnimationTimeline } from "@/studio/animation/AnimationTimeline";
import { WorkspaceView } from "@/studio/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/studio/workspace/useWorkspaceViewport";
import type {
  AsciiAnimation,
  AsciiAnimationFrame,
  TimelineState,
} from "@/features/ascii-interaction/animation-pipeline";
import {
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
} from "@/features/ascii-interaction/image-pipeline/render-utils";
import {
  composeOnionPreview,
  getOnionSkinLayers,
} from "@/features/ascii-engine/animator";

interface AnimationResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  currentFrame: AsciiAnimationFrame | null;
  animation?: AsciiAnimation | null;
  cellW?: number;
  cellH?: number;
  timeline: TimelineState | null;
  frameCount: number;
  loop: boolean;
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
  cellW = DEFAULT_MATRIX_CELL_W,
  cellH = DEFAULT_MATRIX_CELL_H,
  timeline,
  frameCount,
  loop,
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
        <MatrixPreview matrix={displayMatrix} cellW={cellW} cellH={cellH} className="h-full" />
      ) : (
        <div className="flex h-full items-center justify-center font-mono text-[10px] text-[var(--ui-text-dim)]">
          Aguardando conversão…
        </div>
      )}
    </WorkspaceView>
  );
}
