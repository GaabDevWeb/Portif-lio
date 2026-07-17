import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

/** Heatmap de luminância por célula — overlay para Stats (§3.11). */
export interface LuminanceHeatmap {
  cols: number;
  rows: number;
  /** Valores 0..1, row-major (index = row * cols + col). */
  values: Float32Array;
  min: number;
  max: number;
  mean: number;
  /** Fração de células com luminância > limiar (default 0.05). */
  coverage: number;
}

export interface BuildLuminanceHeatmapOptions {
  /** Limiar de cobertura (0..1). Default 0.05. */
  coverageThreshold?: number;
}

/**
 * Constrói heatmap de luminância a partir de `AsciiMatrix.cells[].luminance`.
 * Células em falta ficam a 0.
 */
export function buildLuminanceHeatmap(
  matrix: AsciiMatrix | null | undefined,
  options: BuildLuminanceHeatmapOptions = {},
): LuminanceHeatmap | null {
  if (!matrix || matrix.cols <= 0 || matrix.rows <= 0) return null;

  const { cols, rows } = matrix;
  const values = new Float32Array(cols * rows);
  const threshold = options.coverageThreshold ?? 0.05;

  let min = 1;
  let max = 0;
  let sum = 0;
  let above = 0;
  let filled = 0;

  for (const cell of matrix.cells) {
    if (cell.col < 0 || cell.col >= cols || cell.row < 0 || cell.row >= rows) continue;
    const i = cell.row * cols + cell.col;
    const lum = clamp01(cell.luminance);
    values[i] = lum;
    min = Math.min(min, lum);
    max = Math.max(max, lum);
    sum += lum;
    filled += 1;
    if (lum > threshold) above += 1;
  }

  if (filled === 0) {
    return {
      cols,
      rows,
      values,
      min: 0,
      max: 0,
      mean: 0,
      coverage: 0,
    };
  }

  return {
    cols,
    rows,
    values,
    min,
    max,
    mean: sum / filled,
    coverage: above / (cols * rows),
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Serializa heatmap para preview ASCII compacto (StatsPanel).
 * Usa um ramp curto; `maxCols`/`maxRows` fazem downsample.
 */
export function formatHeatmapPreview(
  heatmap: LuminanceHeatmap,
  maxCols = 24,
  maxRows = 12,
  ramp = " .:-=+*#%@",
): string {
  const stepX = Math.max(1, Math.ceil(heatmap.cols / maxCols));
  const stepY = Math.max(1, Math.ceil(heatmap.rows / maxRows));
  const lines: string[] = [];
  const last = ramp.length - 1;

  for (let y = 0; y < heatmap.rows; y += stepY) {
    let line = "";
    for (let x = 0; x < heatmap.cols; x += stepX) {
      const v = heatmap.values[y * heatmap.cols + x] ?? 0;
      const idx = Math.min(last, Math.max(0, Math.round(v * last)));
      line += ramp[idx] ?? " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}
