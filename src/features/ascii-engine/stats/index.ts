import type { AsciiEngineStats } from "@/features/ascii-interaction/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { PipelineBenchmark } from "@/features/ascii-interaction/image-pipeline/types";

import {
  buildLuminanceHeatmap,
  type LuminanceHeatmap,
} from "@/features/ascii-engine/stats/heatmap";

export type { LuminanceHeatmap, BuildLuminanceHeatmapOptions } from "@/features/ascii-engine/stats/heatmap";
export {
  buildLuminanceHeatmap,
  formatHeatmapPreview,
} from "@/features/ascii-engine/stats/heatmap";

export interface AsciiEngineStatsPanelModel {
  fps: number;
  frameTimeMs: number;
  renderTimeMs: number;
  characterCount: number;
  activeCharacterCount: number;
  dirtyCount: number;
  memoryEstimateBytes: number;
  charset?: string;
  frameCount?: number;
  conversionMs?: number;
  cols?: number;
  rows?: number;
  histogram: Array<{ char: string; count: number }>;
  /** Heatmap de luminância (null se sem matriz). */
  heatmap: LuminanceHeatmap | null;
}

export function estimateMatrixMemoryBytes(matrix: AsciiMatrix | null): number {
  if (!matrix) return 0;
  // rough: cell object ~ 48 bytes + string overhead
  return matrix.cells.length * 64 + matrix.cols * matrix.rows * 2;
}

export function buildCharacterHistogram(
  matrix: AsciiMatrix | null,
  topN = 16,
): Array<{ char: string; count: number }> {
  if (!matrix) return [];
  const map = new Map<string, number>();
  for (const cell of matrix.cells) {
    map.set(cell.char, (map.get(cell.char) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function buildStatsPanelModel(input: {
  engine?: AsciiEngineStats | null;
  matrix?: AsciiMatrix | null;
  benchmark?: PipelineBenchmark | null;
  charset?: string;
  frameCount?: number;
}): AsciiEngineStatsPanelModel {
  const matrix = input.matrix ?? null;
  return {
    fps: input.engine?.fps ?? 0,
    frameTimeMs: input.engine?.frameTimeMs ?? 0,
    renderTimeMs: input.engine?.renderTimeMs ?? 0,
    characterCount: input.engine?.characterCount ?? matrix?.cells.length ?? 0,
    activeCharacterCount: input.engine?.activeCharacterCount ?? 0,
    dirtyCount: input.engine?.dirtyCount ?? 0,
    memoryEstimateBytes: estimateMatrixMemoryBytes(matrix),
    charset: input.charset,
    frameCount: input.frameCount,
    conversionMs: input.benchmark?.conversionMs,
    cols: input.benchmark?.cols ?? matrix?.cols,
    rows: input.benchmark?.rows ?? matrix?.rows,
    histogram: buildCharacterHistogram(matrix),
    heatmap: buildLuminanceHeatmap(matrix),
  };
}
