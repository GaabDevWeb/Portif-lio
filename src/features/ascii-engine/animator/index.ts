import type { AsciiAnimation, AsciiAnimationFrame } from "@/features/ascii-interaction/animation-pipeline/types";

export type InterpolationMode = "none" | "hold" | "linear";

export interface AnimationKeyframe {
  frameIndex: number;
  label?: string;
  interpolation: InterpolationMode;
}

export interface AnimatorTimelineState {
  frameCount: number;
  keyframes: AnimationKeyframe[];
  selectedFrame: number;
}

/** Operações de timeline sobre AsciiAnimation (imutáveis). */
export function duplicateFrame(animation: AsciiAnimation, index: number): AsciiAnimation {
  const frame = animation.frames[index];
  if (!frame) return animation;
  const copy: AsciiAnimationFrame = {
    ...structuredClone(frame),
    index: index + 1,
  };
  const frames = [
    ...animation.frames.slice(0, index + 1),
    copy,
    ...animation.frames.slice(index + 1).map((f) => ({ ...f, index: f.index + 1 })),
  ];
  const delays = [
    ...animation.frameDelays.slice(0, index + 1),
    animation.frameDelays[index] ?? 66,
    ...animation.frameDelays.slice(index + 1),
  ];
  return rebuildAnimation(animation, frames, delays);
}

export function insertBlankFrame(animation: AsciiAnimation, index: number): AsciiAnimation {
  const template = animation.frames[Math.max(0, index - 1)] ?? animation.frames[0];
  if (!template) return animation;
  const blank: AsciiAnimationFrame = {
    index,
    matrix: {
      ...structuredClone(template.matrix),
      cells: template.matrix.cells.map((c) => ({ ...c, char: " " })),
    },
    delayMs: animation.frameDelays[index] ?? 66,
    source: "",
  };
  const frames = [
    ...animation.frames.slice(0, index),
    blank,
    ...animation.frames.slice(index).map((f) => ({ ...f, index: f.index + 1 })),
  ];
  const delays = [
    ...animation.frameDelays.slice(0, index),
    blank.delayMs,
    ...animation.frameDelays.slice(index),
  ];
  return rebuildAnimation(animation, frames, delays);
}

export function removeFrame(animation: AsciiAnimation, index: number): AsciiAnimation {
  if (animation.frames.length <= 1) return animation;
  const frames = animation.frames
    .filter((_, i) => i !== index)
    .map((f, i) => ({ ...f, index: i }));
  const delays = animation.frameDelays.filter((_, i) => i !== index);
  return rebuildAnimation(animation, frames, delays);
}

export function mergeFrames(
  animation: AsciiAnimation,
  fromIndex: number,
  toIndex: number,
): AsciiAnimation {
  if (fromIndex === toIndex) return animation;
  const a = Math.min(fromIndex, toIndex);
  const b = Math.max(fromIndex, toIndex);
  const keep = animation.frames[a];
  if (!keep) return animation;
  const mergedDelay =
    (animation.frameDelays[a] ?? 0) + (animation.frameDelays[b] ?? 0);
  const frames = animation.frames
    .filter((_, i) => i !== b)
    .map((f, i) => ({ ...f, index: i }));
  const delays = animation.frameDelays
    .map((d, i) => (i === a ? mergedDelay : d))
    .filter((_, i) => i !== b);
  return rebuildAnimation(animation, frames, delays);
}

function rebuildAnimation(
  base: AsciiAnimation,
  frames: AsciiAnimationFrame[],
  frameDelays: number[],
): AsciiAnimation {
  const totalDurationMs = frameDelays.reduce((s, d) => s + d, 0);
  return {
    ...base,
    frames,
    frameDelays,
    frameCount: frames.length,
    totalDurationMs,
  };
}

export function createDefaultKeyframes(frameCount: number): AnimationKeyframe[] {
  if (frameCount <= 0) return [];
  return [
    { frameIndex: 0, label: "start", interpolation: "hold" },
    { frameIndex: frameCount - 1, label: "end", interpolation: "hold" },
  ];
}
