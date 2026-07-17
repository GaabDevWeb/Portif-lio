import type { KeyframeTrack, PropertyKeyframe, TrackInterpolation } from "./types";

function sortKeys(keys: PropertyKeyframe[]): PropertyKeyframe[] {
  return [...keys].sort((a, b) => a.frame - b.frame);
}

function cloneTrack(track: KeyframeTrack): KeyframeTrack {
  return {
    id: track.id,
    property: track.property,
    keys: track.keys.map((k) => ({ ...k })),
  };
}

/** Add a keyframe; replaces existing key at the same frame. Immutable. */
export function addKeyframe(
  track: KeyframeTrack,
  key: PropertyKeyframe,
): KeyframeTrack {
  const without = track.keys.filter((k) => k.frame !== key.frame);
  return {
    ...cloneTrack(track),
    keys: sortKeys([...without, { ...key }]),
  };
}

/** Remove keyframe at exact frame. Immutable. */
export function removeKeyframe(track: KeyframeTrack, frame: number): KeyframeTrack {
  return {
    ...cloneTrack(track),
    keys: track.keys.filter((k) => k.frame !== frame),
  };
}

/** Patch an existing keyframe at `frame`. No-op if missing. Immutable. */
export function updateKeyframe(
  track: KeyframeTrack,
  frame: number,
  patch: Partial<Omit<PropertyKeyframe, "frame">>,
): KeyframeTrack {
  const idx = track.keys.findIndex((k) => k.frame === frame);
  if (idx < 0) return track;
  const next = track.keys.map((k, i) => (i === idx ? { ...k, ...patch } : { ...k }));
  return { ...cloneTrack(track), keys: sortKeys(next) };
}

/** Upsert track into a tracks array by id. Immutable. */
export function upsertTrack(
  tracks: KeyframeTrack[],
  track: KeyframeTrack,
): KeyframeTrack[] {
  const i = tracks.findIndex((t) => t.id === track.id);
  if (i < 0) return [...tracks, cloneTrack(track)];
  return tracks.map((t, idx) => (idx === i ? cloneTrack(track) : t));
}

export function removeTrack(tracks: KeyframeTrack[], trackId: string): KeyframeTrack[] {
  return tracks.filter((t) => t.id !== trackId);
}

export function createTrack(
  id: string,
  property: KeyframeTrack["property"],
  keys: PropertyKeyframe[] = [],
): KeyframeTrack {
  return { id, property, keys: sortKeys(keys) };
}

export function defaultInterpolation(): TrackInterpolation {
  return "linear";
}
