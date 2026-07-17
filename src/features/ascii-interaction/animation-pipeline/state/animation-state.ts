import type { PlaybackStatus, TimelineState } from "@/features/ascii-interaction/animation-pipeline/types";

/** Estado derivado da animação para UI. */
export interface AnimationUiState {
  status: PlaybackStatus;
  timeline: TimelineState | null;
  isConverting: boolean;
  hasAnimation: boolean;
}

export function createAnimationUiState(
  status: PlaybackStatus,
  timeline: TimelineState | null,
  isConverting: boolean,
  hasAnimation: boolean,
): AnimationUiState {
  return { status, timeline, isConverting, hasAnimation };
}
