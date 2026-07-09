import {
  mapLuminanceToCharIndex,
  resolveCellColor,
} from "@/features/ascii-interaction/image-pipeline/charset-mapper";
import { applyDithering } from "@/features/ascii-interaction/image-pipeline/dithering";
import { sobelEdges } from "@/features/ascii-interaction/image-pipeline/image-processor";
import type {
  AsciiMatrix,
  AsciiMatrixCell,
  ImagePipelineOptions,
  ImageSampleBuffer,
  MappingMode,
} from "@/features/ascii-interaction/image-pipeline/types";

function buildMappingField(
  buffer: ImageSampleBuffer,
  mode: MappingMode,
  edgeEnhance: number,
): Float32Array {
  const { width, height, luminance } = buffer;
  const field = new Float32Array(luminance);

  if (mode === "edge" || mode === "hybrid") {
    const edges = sobelEdges(luminance, width, height);
    for (let i = 0; i < field.length; i += 1) {
      if (mode === "edge") {
        field[i] = edges[i]!;
      } else {
        field[i] = luminance[i]! * (1 - edgeEnhance) + edges[i]! * edgeEnhance;
      }
    }
  }

  if (mode === "density") {
    for (let i = 0; i < field.length; i += 1) {
      field[i] = 1 - luminance[i]!;
    }
  }

  return field;
}

export function generateAsciiMatrix(
  buffer: ImageSampleBuffer,
  options: ImagePipelineOptions,
): AsciiMatrix {
  const charset = options.charset.length > 1 ? options.charset : " .";
  const levels = charset.length;

  const mapping = buildMappingField(buffer, options.mappingMode, options.edgeEnhance);
  const dithered = applyDithering(mapping, buffer.width, buffer.height, options.dithering, levels - 1);

  const cells: AsciiMatrixCell[] = [];

  for (let row = 0; row < buffer.height; row += 1) {
    for (let col = 0; col < buffer.width; col += 1) {
      const i = row * buffer.width + col;
      const lum = dithered[i]!;
      const idx = mapLuminanceToCharIndex(lum, levels);
      const ch = charset[idx] ?? " ";
      if (ch === " " && lum < 0.05) continue;

      const color = resolveCellColor(
        buffer.r[i]!,
        buffer.g[i]!,
        buffer.b[i]!,
        lum,
        options.colorMode,
      );

      cells.push({
        char: ch,
        col,
        row,
        luminance: lum,
        r: color.r,
        g: color.g,
        b: color.b,
      });
    }
  }

  return {
    cols: buffer.width,
    rows: buffer.height,
    cells,
    charset,
  };
}
