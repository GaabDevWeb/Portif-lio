/**
 * Timeline / keyframe types (PLATFORM §3.5 / P4).
 * Property tracks are independent of AsciiAnimation frame ops.
 */

/** Interpolation between a key and the next key on the same track. */
export type TrackInterpolation = "hold" | "linear";

/** Animatable property ids for KeyframeTrack. */
export type KeyframePropertyId =
  | "opacity"
  | "offsetX"
  | "offsetY"
  | "charsetDensity";

export interface PropertyKeyframe {
  /** Frame index (integer or fractional scrub position). */
  frame: number;
  value: number;
  /** How to interpolate from this key toward the next. */
  interpolation: TrackInterpolation;
}

export interface KeyframeTrack {
  id: string;
  property: KeyframePropertyId;
  /** Keys sorted ascending by `frame`. */
  keys: PropertyKeyframe[];
}

export interface OnionSkinSettings {
  enabled: boolean;
  /** Opacity weight for previous frame overlay (0–1). */
  prevOpacity: number;
  /** Opacity weight for next frame overlay (0–1). */
  nextOpacity: number;
}

/**
 * Serializável no ProjectDocument (substitui TimelineDocumentStub).
 */
export interface TimelineDocument {
  fps: number;
  loop: boolean;
  frameCount: number;
  tracks: KeyframeTrack[];
  onionSkin?: OnionSkinSettings;
}

export const DEFAULT_ONION_SKIN: OnionSkinSettings = {
  enabled: false,
  prevOpacity: 0.35,
  nextOpacity: 0.25,
};

export function createEmptyTimeline(
  frameCount: number,
  options: Partial<Pick<TimelineDocument, "fps" | "loop">> = {},
): TimelineDocument {
  return {
    fps: options.fps ?? 15,
    loop: options.loop ?? true,
    frameCount: Math.max(0, frameCount),
    tracks: [],
    onionSkin: { ...DEFAULT_ONION_SKIN },
  };
}
