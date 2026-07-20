import type { DecodedGif, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

/**
 * Animated WebP decoder via ImageDecoder (Chromium / modern browsers).
 * Falls back to a single-frame bitmap if the API is unavailable or the file is static.
 */
export async function decodeWebpBuffer(buffer: ArrayBuffer): Promise<DecodedGif> {
  if (typeof ImageDecoder !== "undefined") {
    try {
      return await decodeWithImageDecoder(buffer);
    } catch {
      // fall through to static bitmap
    }
  }
  return decodeStaticWebpAsSingleFrame(buffer);
}

export async function decodeWebpFile(file: File): Promise<DecodedGif> {
  const name = file.name.toLowerCase();
  if (file.type !== "image/webp" && !name.endsWith(".webp")) {
    throw new Error("Formato inválido: esperado image/webp");
  }
  return decodeWebpBuffer(await file.arrayBuffer());
}

async function decodeWithImageDecoder(buffer: ArrayBuffer): Promise<DecodedGif> {
  const decoder = new ImageDecoder({ data: buffer.slice(0), type: "image/webp" });
  await decoder.tracks.ready;
  const track = decoder.tracks.selectedTrack;
  const frameCount = Math.max(1, track?.frameCount ?? 1);
  const frames: RgbaFrame[] = [];
  let width = 0;
  let height = 0;

  for (let i = 0; i < frameCount; i += 1) {
    const { image } = await decoder.decode({ frameIndex: i });
    width = image.displayWidth || image.codedWidth;
    height = image.displayHeight || image.codedHeight;
    const pixels = await videoFrameToRgba(image, width, height);
    const delayMs = Math.max(20, Math.round((image.duration ?? 100_000) / 1000));
    image.close();
    frames.push({ index: i, width, height, delayMs, pixels });
  }

  decoder.close();

  return {
    width,
    height,
    frameCount: frames.length,
    frames,
    loopCount: 0,
    totalDurationMs: frames.reduce((s, f) => s + f.delayMs, 0),
  };
}

async function videoFrameToRgba(
  frame: VideoFrame,
  width: number,
  height: number,
): Promise<Uint8ClampedArray> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível para WebP.");
  ctx.drawImage(frame, 0, 0, width, height);
  return new Uint8ClampedArray(ctx.getImageData(0, 0, width, height).data);
}

async function decodeStaticWebpAsSingleFrame(buffer: ArrayBuffer): Promise<DecodedGif> {
  const blob = new Blob([buffer], { type: "image/webp" });
  const bitmap = await createImageBitmap(blob);
  const width = bitmap.width;
  const height = bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D indisponível para WebP.");
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pixels = new Uint8ClampedArray(ctx.getImageData(0, 0, width, height).data);
  return {
    width,
    height,
    frameCount: 1,
    frames: [{ index: 0, width, height, delayMs: 100, pixels }],
    loopCount: 0,
    totalDurationMs: 100,
  };
}
