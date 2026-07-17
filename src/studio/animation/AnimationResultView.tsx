"use client";

import { useMemo, useState } from "react";

import { MatrixPreview } from "@/studio/MatrixPreview";
import { AnimationTimeline } from "@/studio/animation/AnimationTimeline";
import {
  MotionMapPreview,
  PackedBufferPreview,
} from "@/studio/animation/TemporalDebugPreview";
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

export type TemporalDebugView = "ascii" | "original" | "motion" | "buffer";

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
  motionPreviews?: {
    cols: number;
    rows: number;
    frames: Uint8Array[];
    buffers: Uint8Array[];
  } | null;
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
  motionPreviews = null,
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
  const [debugView, setDebugView] = useState<TemporalDebugView>("ascii");
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

  const motionFrame = motionPreviews?.frames[frameIndex] ?? null;
  const bufferFrame = motionPreviews?.buffers[frameIndex] ?? null;

  return (
    <WorkspaceView
      workspace={workspace}
      hasOriginal={!!previewUrl}
      originalUrl={previewUrl}
      originalAlt="GIF original"
      footer={
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1 px-2 pt-1">
            {(
              [
                ["ascii", "ASCII Final"],
                ["original", "Original"],
                ["motion", "Motion Map"],
                ["buffer", "Temporal Buffer"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setDebugView(id)}
                className={`cursor-pointer rounded border px-2 py-0.5 font-mono text-[9px] ${
                  debugView === id
                    ? "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
                    : "border-[var(--ui-border)] text-[var(--ui-text-dim)]"
                }`}
              >
                {label}
              </button>
            ))}
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
            onionSkinEnabled={onionSkinEnabled}
            onOnionSkinToggle={setOnionSkinEnabled}
          />
        </div>
      }
    >
      {debugView === "original" && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Original GIF" className="h-full w-full object-contain" />
      ) : debugView === "motion" && motionFrame && motionPreviews ? (
        <MotionMapPreview
          cols={motionPreviews.cols}
          rows={motionPreviews.rows}
          motion={motionFrame}
        />
      ) : debugView === "buffer" && bufferFrame && motionPreviews ? (
        <PackedBufferPreview
          cols={motionPreviews.cols}
          rows={motionPreviews.rows}
          buffer={bufferFrame}
        />
      ) : displayMatrix ? (
        <MatrixPreview matrix={displayMatrix} cellW={cellW} cellH={cellH} className="h-full" />
      ) : (
        <div className="flex h-full items-center justify-center font-mono text-[10px] text-[var(--ui-text-dim)]">
          Aguardando conversão…
        </div>
      )}
    </WorkspaceView>
  );
}
