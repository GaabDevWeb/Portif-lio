import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import { DEFAULT_ONION_SKIN, type OnionSkinSettings } from "./types";

export interface OnionSkinLayer {
  frameIndex: number;
  matrix: AsciiMatrix;
  opacity: number;
  /** -1 = previous, 1 = next */
  direction: -1 | 1;
}

export interface OnionSkinResult {
  current: AsciiMatrix | null;
  layers: OnionSkinLayer[];
}

/**
 * Resolve prev/next frame matrices with opacity weights for onion-skin overlay.
 * Does not mutate animation frames.
 */
export function getOnionSkinLayers(
  animation: AsciiAnimation | null | undefined,
  currentFrame: number,
  settings: Partial<OnionSkinSettings> = {},
): OnionSkinResult {
  const cfg: OnionSkinSettings = { ...DEFAULT_ONION_SKIN, ...settings };
  const frames = animation?.frames ?? [];
  const current = frames[currentFrame]?.matrix ?? null;

  if (!cfg.enabled || frames.length === 0 || !current) {
    return { current, layers: [] };
  }

  const layers: OnionSkinLayer[] = [];
  const prevIdx = currentFrame - 1;
  const nextIdx = currentFrame + 1;

  if (prevIdx >= 0 && frames[prevIdx]?.matrix) {
    layers.push({
      frameIndex: prevIdx,
      matrix: frames[prevIdx]!.matrix,
      opacity: cfg.prevOpacity,
      direction: -1,
    });
  }
  if (nextIdx < frames.length && frames[nextIdx]?.matrix) {
    layers.push({
      frameIndex: nextIdx,
      matrix: frames[nextIdx]!.matrix,
      opacity: cfg.nextOpacity,
      direction: 1,
    });
  }

  return { current, layers };
}
