import {
  mapLuminanceToCharByDensity,
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

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

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

/** Sparse↔dense: subsample charset evenly (keep endpoints). */
export function applyCharacterDensity(charset: string, density: number): string {
  if (charset.length <= 2) return charset;
  const d = clamp01(density);
  if (d >= 0.999) return charset;
  const target = Math.max(2, Math.round(2 + (charset.length - 2) * d));
  if (target >= charset.length) return charset;
  let out = "";
  for (let i = 0; i < target; i += 1) {
    const src = Math.round((i / (target - 1)) * (charset.length - 1));
    out += charset[src]!;
  }
  return out;
}

/** Percentile stretch so the charset uses the image’s dynamic range. */
export function applyAdaptiveLuminance(field: Float32Array): Float32Array {
  if (field.length === 0) return field;
  const sorted = Float32Array.from(field).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)] ?? 0;
  const hi = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.98))] ?? 1;
  const span = Math.max(1e-4, hi - lo);
  const out = new Float32Array(field.length);
  for (let i = 0; i < field.length; i += 1) {
    out[i] = clamp01((field[i]! - lo) / span);
  }
  return out;
}

export function generateAsciiMatrix(
  buffer: ImageSampleBuffer,
  options: ImagePipelineOptions,
): AsciiMatrix {
  const baseCharset = options.charset.length > 1 ? options.charset : " .";
  const charset = applyCharacterDensity(baseCharset, options.characterDensity ?? 1);
  const levels = charset.length;

  let mapping = buildMappingField(buffer, options.mappingMode, options.edgeEnhance);

  if (options.adaptiveMapping) {
    mapping = applyAdaptiveLuminance(mapping);
  }

  const bias = options.characterBias ?? 0;
  if (bias !== 0) {
    for (let i = 0; i < mapping.length; i += 1) {
      mapping[i] = clamp01(mapping[i]! + bias * 0.5);
    }
  }

  const dithered = applyDithering(mapping, buffer.width, buffer.height, options.dithering, levels);

  const cells: AsciiMatrixCell[] = [];

  for (let row = 0; row < buffer.height; row += 1) {
    for (let col = 0; col < buffer.width; col += 1) {
      const i = row * buffer.width + col;
      const lum = dithered[i]!;
      const { char: ch } = mapLuminanceToCharByDensity(lum, charset);
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
