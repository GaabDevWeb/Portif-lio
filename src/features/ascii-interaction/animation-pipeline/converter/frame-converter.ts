import { generateAsciiMatrix } from "@/features/ascii-interaction/image-pipeline/matrix-generator";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  applyImageFilters,
  runRgbaPipeline,
} from "@/features/ascii-interaction/image-pipeline/rgba-processor";
import type { AsciiAnimationFrame, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

export function convertRgbaFrameToMatrix(
  frame: Pick<RgbaFrame, "pixels" | "width" | "height">,
  options: ImagePipelineOptions,
): AsciiMatrix {
  const sampled = runRgbaPipeline(frame.pixels, frame.width, frame.height, options);
  const filtered = applyImageFilters(sampled, options);
  return generateAsciiMatrix(filtered, options);
}

export function convertRgbaFrameToAnimationFrame(
  frame: RgbaFrame,
  options: ImagePipelineOptions,
): AsciiAnimationFrame {
  const matrix = convertRgbaFrameToMatrix(frame, options);
  return {
    index: frame.index,
    matrix,
    delayMs: frame.delayMs,
  };
}

export function convertRgbaFramesBatch(
  frames: RgbaFrame[],
  options: ImagePipelineOptions,
  onProgress?: (completed: number, total: number) => void,
  shouldCancel?: () => boolean,
): AsciiAnimationFrame[] {
  const results: AsciiAnimationFrame[] = [];
  const total = frames.length;

  for (let i = 0; i < frames.length; i += 1) {
    if (shouldCancel?.()) break;
    const frame = frames[i]!;
    results.push(convertRgbaFrameToAnimationFrame(frame, options));
    onProgress?.(i + 1, total);
  }

  return results;
}
