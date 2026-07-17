import type { KeyframeTrack, PropertyKeyframe } from "./types";

/**
 * Sample a property track at a frame/time position.
 * - Before first key → first value
 * - After last key → last value
 * - Between keys: hold uses left key; linear lerps by frame span
 */
export function sampleTrack(timeOrFrame: number, track: KeyframeTrack): number {
  const keys = track.keys;
  if (keys.length === 0) {
    return defaultValueForProperty(track.property);
  }
  if (keys.length === 1) {
    return keys[0]!.value;
  }

  const t = timeOrFrame;
  if (t <= keys[0]!.frame) return keys[0]!.value;
  const last = keys[keys.length - 1]!;
  if (t >= last.frame) return last.value;

  let left: PropertyKeyframe = keys[0]!;
  let right: PropertyKeyframe = keys[1]!;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (t >= a.frame && t <= b.frame) {
      left = a;
      right = b;
      break;
    }
  }

  if (left.interpolation === "hold" || left.frame === right.frame) {
    return left.value;
  }

  const span = right.frame - left.frame;
  const u = span === 0 ? 0 : (t - left.frame) / span;
  return left.value + (right.value - left.value) * u;
}

export function sampleAllTracks(
  timeOrFrame: number,
  tracks: KeyframeTrack[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const track of tracks) {
    out[track.property] = sampleTrack(timeOrFrame, track);
  }
  return out;
}

function defaultValueForProperty(property: KeyframeTrack["property"]): number {
  switch (property) {
    case "opacity":
      return 1;
    case "offsetX":
    case "offsetY":
      return 0;
    case "charsetDensity":
      return 1;
    default:
      return 0;
  }
}
