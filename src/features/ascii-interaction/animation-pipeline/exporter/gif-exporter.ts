import { GIFEncoder, applyPalette, quantize } from "gifenc";

import type { AsciiAnimation, ConversionProgress } from "@/features/ascii-interaction/animation-pipeline/types";
import { renderMatrixToImageData } from "@/features/ascii-interaction/image-pipeline/render-utils";
import { downloadBlob } from "@/features/ascii-interaction/animation-pipeline/utilities/zip";

const YIELD_EVERY = 4;

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** Codifica animação ASCII em GIF com FPS, loop e resolução original. */
export async function exportAsciiAnimationGif(
  animation: AsciiAnimation,
  onProgress?: (p: ConversionProgress) => void,
  signal?: { cancelled: boolean },
): Promise<Blob> {
  const frames = animation.frames;
  const total = frames.length;
  if (total === 0) throw new Error("Animação sem frames.");

  const pixelWidth = animation.width;
  const pixelHeight = animation.height;
  const encoder = GIFEncoder();
  const repeat = animation.loop ? 0 : -1;

  for (let i = 0; i < total; i += 1) {
    if (signal?.cancelled) throw new Error("Exportação cancelada.");

    const frame = frames[i]!;
    const imageData = renderMatrixToImageData(frame.matrix, {
      targetWidth: pixelWidth,
      targetHeight: pixelHeight,
      transparentBackground: true,
    });

    const rgba = imageData.data;
    const palette = quantize(rgba, 256, { format: "rgba4444", oneBitAlpha: true });
    const index = applyPalette(rgba, palette, "rgba4444");

    const transparentIndex = palette.findIndex(
      (color) => color[3] === 0 || (color[0] === 0 && color[1] === 0 && color[2] === 0 && (color[3] ?? 255) < 128),
    );

    const delayMs = animation.frameDelays[i] ?? Math.round(1000 / Math.max(1, animation.fps));

    encoder.writeFrame(index, pixelWidth, pixelHeight, {
      palette,
      delay: delayMs,
      repeat: i === 0 ? repeat : undefined,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
    });

    onProgress?.({
      completed: i + 1,
      total,
      percent: ((i + 1) / total) * 100,
      currentFrame: i,
      cancelled: false,
    });

    if (i % YIELD_EVERY === 0) {
      await yieldToMain();
    }
  }

  encoder.finish();
  return new Blob([new Uint8Array(encoder.bytes())], { type: "image/gif" });
}

export async function downloadAsciiAnimationGif(
  animation: AsciiAnimation,
  filename = "animation.gif",
  onProgress?: (p: ConversionProgress) => void,
  signal?: { cancelled: boolean },
): Promise<void> {
  const blob = await exportAsciiAnimationGif(animation, onProgress, signal);
  downloadBlob(blob, filename);
}
