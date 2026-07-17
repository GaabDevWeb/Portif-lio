import type { DecodedGif, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

/** Extrai metadados e normaliza delays de um GIF decodificado. */
export function extractFrames(decoded: DecodedGif): RgbaFrame[] {
  return decoded.frames.map((frame, index) => ({
    ...frame,
    index,
  }));
}

export function summarizeGif(decoded: DecodedGif): {
  width: number;
  height: number;
  frameCount: number;
  totalDurationMs: number;
  averageDelayMs: number;
} {
  const frameCount = decoded.frameCount;
  return {
    width: decoded.width,
    height: decoded.height,
    frameCount,
    totalDurationMs: decoded.totalDurationMs,
    averageDelayMs: frameCount > 0 ? decoded.totalDurationMs / frameCount : 0,
  };
}
