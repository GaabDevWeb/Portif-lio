import { decompressFrames, parseGIF } from "gifuct-js";

import type { DecodedGif, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

/** Decoder GIF89a — extrai frames RGBA compostos. */
export async function decodeGifBuffer(buffer: ArrayBuffer): Promise<DecodedGif> {
  const gif = parseGIF(buffer);
  const rawFrames = decompressFrames(gif, true);
  const width = gif.lsd.width;
  const height = gif.lsd.height;
  const canvas = new Uint8ClampedArray(width * height * 4);
  const frames: RgbaFrame[] = [];

  for (let i = 0; i < rawFrames.length; i += 1) {
    const frame = rawFrames[i]!;
    const { dims, patch, delay, disposalType } = frame;

    if (disposalType === 2) {
      canvas.fill(0);
    }

    for (let y = 0; y < dims.height; y += 1) {
      for (let x = 0; x < dims.width; x += 1) {
        const pi = (y * dims.width + x) * 4;
        const alpha = patch[pi + 3]!;
        if (alpha === 0) continue;
        const cx = dims.left + x;
        const cy = dims.top + y;
        if (cx >= width || cy >= height) continue;
        const ci = (cy * width + cx) * 4;
        canvas[ci] = patch[pi]!;
        canvas[ci + 1] = patch[pi + 1]!;
        canvas[ci + 2] = patch[pi + 2]!;
        canvas[ci + 3] = alpha;
      }
    }

    const delayMs = Math.max(20, (delay || 10) * 10);
    frames.push({
      index: i,
      width,
      height,
      delayMs,
      pixels: canvas.slice(),
    });
  }

  const totalDurationMs = frames.reduce((sum, f) => sum + f.delayMs, 0);

  return {
    width,
    height,
    frameCount: frames.length,
    frames,
    loopCount: gif.loopCount ?? 0,
    totalDurationMs,
  };
}

export async function decodeGifFile(file: File): Promise<DecodedGif> {
  if (file.type !== "image/gif" && !file.name.toLowerCase().endsWith(".gif")) {
    throw new Error("Formato inválido: esperado image/gif");
  }
  const buffer = await file.arrayBuffer();
  return decodeGifBuffer(buffer);
}
