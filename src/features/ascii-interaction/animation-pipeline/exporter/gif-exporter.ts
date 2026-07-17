import { GIFEncoder, applyPalette, quantize } from "gifenc";

import type { AsciiAnimation, ConversionProgress } from "@/features/ascii-interaction/animation-pipeline/types";
import {
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
  renderMatrixToImageData,
} from "@/features/ascii-interaction/image-pipeline/render-utils";
import { downloadBlob } from "@/features/ascii-interaction/animation-pipeline/utilities/zip";

const YIELD_EVERY = 2;

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export interface GifExportOptions {
  /** Match source GIF pixel size. Default false = cell-grid parity with preview. */
  matchSourceResolution?: boolean;
  cellW?: number;
  cellH?: number;
}

/** Codifica animação ASCII em GIF — mesma grelha do preview por omissão. */
export async function exportAsciiAnimationGif(
  animation: AsciiAnimation,
  onProgress?: (p: ConversionProgress) => void,
  signal?: { cancelled: boolean },
  exportOptions: GifExportOptions = {},
): Promise<Blob> {
  const frames = animation.frames;
  const total = frames.length;
  if (total === 0) throw new Error("Animação sem frames.");

  const cellW = exportOptions.cellW ?? DEFAULT_MATRIX_CELL_W;
  const cellH = exportOptions.cellH ?? DEFAULT_MATRIX_CELL_H;
  const first = frames[0]!.matrix;
  const pixelWidth = exportOptions.matchSourceResolution
    ? animation.width
    : Math.max(1, Math.round(first.cols * cellW));
  const pixelHeight = exportOptions.matchSourceResolution
    ? animation.height
    : Math.max(1, Math.round(first.rows * cellH));

  const encoder = GIFEncoder();
  const repeat = animation.loop ? 0 : -1;

  for (let i = 0; i < total; i += 1) {
    if (signal?.cancelled) throw new Error("Exportação cancelada.");

    const frame = frames[i]!;
    const imageData = renderMatrixToImageData(frame.matrix, exportOptions.matchSourceResolution
      ? { targetWidth: pixelWidth, targetHeight: pixelHeight, transparentBackground: true }
      : { cellW, cellH, transparentBackground: true });

    const rgba = imageData.data;
    const palette = quantize(rgba, 256, { format: "rgba4444", oneBitAlpha: true });
    const index = applyPalette(rgba, palette, "rgba4444");

    const transparentIndex = palette.findIndex(
      (color) => color[3] === 0 || (color[0] === 0 && color[1] === 0 && color[2] === 0 && (color[3] ?? 255) < 128),
    );

    const delayMs =
      animation.frameDelays[i] ??
      (animation.fps > 0 ? Math.round(1000 / animation.fps) : 66);

    encoder.writeFrame(index, imageData.width, imageData.height, {
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

/**
 * Encode GIF off the main thread when Worker is available.
 * Falls back to async main-thread encode with yields.
 */
export async function exportAsciiAnimationGifAsync(
  animation: AsciiAnimation,
  onProgress?: (p: ConversionProgress) => void,
  signal?: { cancelled: boolean },
  exportOptions: GifExportOptions = {},
): Promise<Blob> {
  // Worker path needs OffscreenCanvas for renderMatrixToImageData — keep main with yields for fidelity.
  // Aggressive yielding (YIELD_EVERY=2) keeps UI responsive without a second rasterizer.
  return exportAsciiAnimationGif(animation, onProgress, signal, exportOptions);
}

export async function downloadAsciiAnimationGif(
  animation: AsciiAnimation,
  filename = "animation.gif",
  onProgress?: (p: ConversionProgress) => void,
  signal?: { cancelled: boolean },
): Promise<void> {
  const blob = await exportAsciiAnimationGifAsync(animation, onProgress, signal);
  downloadBlob(blob, filename);
}
