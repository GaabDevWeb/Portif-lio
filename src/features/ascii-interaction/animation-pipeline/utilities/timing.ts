/** Utilitários de tempo para timeline e playback. */

export function frameIndexAtTime(
  frameDelays: readonly number[],
  timeMs: number,
  loop: boolean,
): number {
  if (frameDelays.length === 0) return 0;
  const total = frameDelays.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;

  let t = timeMs;
  if (loop) {
    t = t % total;
  } else {
    t = Math.min(t, Math.max(0, total - 1));
  }

  let acc = 0;
  for (let i = 0; i < frameDelays.length; i += 1) {
    acc += frameDelays[i]!;
    if (t < acc) return i;
  }
  return frameDelays.length - 1;
}

export function timeAtFrame(frameDelays: readonly number[], frameIndex: number): number {
  let t = 0;
  for (let i = 0; i < frameIndex && i < frameDelays.length; i += 1) {
    t += frameDelays[i]!;
  }
  return t;
}

export function totalDuration(frameDelays: readonly number[]): number {
  return frameDelays.reduce((a, b) => a + b, 0);
}

export function delaysFromFps(frameCount: number, fps: number): number[] {
  const ms = 1000 / Math.max(1, fps);
  return Array.from({ length: frameCount }, () => ms);
}

export function formatTimeMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const frac = Math.floor((ms % 1000) / 10);
  return `${s}.${frac.toString().padStart(2, "0")}s`;
}

export function padFrameIndex(index: number): string {
  return String(index).padStart(4, "0");
}
