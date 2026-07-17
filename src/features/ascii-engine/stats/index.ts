import type { AsciiEngineStats } from "@/features/ascii-interaction/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { PipelineBenchmark } from "@/features/ascii-interaction/image-pipeline/types";

import {
  analyzeCharset,
  buildCharacterFrequency,
  estimateCompressionRatio,
  resolveFrameCount,
  type CharacterFrequency,
  type CharsetAnalysis,
  type CompressionRatioResult,
} from "@/features/ascii-engine/stats/analytics";
import {
  buildLuminanceHeatmap,
  type LuminanceHeatmap,
} from "@/features/ascii-engine/stats/heatmap";

export type { LuminanceHeatmap, BuildLuminanceHeatmapOptions } from "@/features/ascii-engine/stats/heatmap";
export {
  buildLuminanceHeatmap,
  formatHeatmapPreview,
} from "@/features/ascii-engine/stats/heatmap";

export type {
  CharacterFrequency,
  CharacterFrequencyEntry,
  CharsetAnalysis,
  CompressionRatioResult,
} from "@/features/ascii-engine/stats/analytics";
export {
  analyzeCharset,
  buildCharacterFrequency,
  estimateCompressionRatio,
  matrixToPlainText,
  resolveFrameCount,
} from "@/features/ascii-engine/stats/analytics";

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
  /** Frequência completa + entropia. */
  frequency: CharacterFrequency | null;
  /** TXT vs compressão estimada/fornecida. */
  compression: CompressionRatioResult | null;
  /** Cobertura do charset. */
  charsetAnalysis: CharsetAnalysis | null;
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
  const freq = buildCharacterFrequency(matrix, topN);
  return freq.entries.map(({ char, count }) => ({ char, count }));
}

export function buildStatsPanelModel(input: {
  engine?: AsciiEngineStats | null;
  matrix?: AsciiMatrix | null;
  benchmark?: PipelineBenchmark | null;
  charset?: string;
  frameCount?: number;
  animationFrameCount?: number;
  /** Bytes ZIP reais (opcional) para compression ratio. */
  compressedBytes?: number;
}): AsciiEngineStatsPanelModel {
  const matrix = input.matrix ?? null;
  const frequency = matrix ? buildCharacterFrequency(matrix) : null;
  const compression = estimateCompressionRatio(matrix, input.compressedBytes);
  const charsetAnalysis = analyzeCharset(matrix, input.charset);
  const frameCount = resolveFrameCount({
    frameCount: input.frameCount,
    animationFrameCount: input.animationFrameCount,
  });

  return {
    fps: input.engine?.fps ?? 0,
    frameTimeMs: input.engine?.frameTimeMs ?? 0,
    renderTimeMs: input.engine?.renderTimeMs ?? 0,
    characterCount: input.engine?.characterCount ?? matrix?.cells.length ?? 0,
    activeCharacterCount: input.engine?.activeCharacterCount ?? 0,
    dirtyCount: input.engine?.dirtyCount ?? 0,
    memoryEstimateBytes: estimateMatrixMemoryBytes(matrix),
    charset: input.charset ?? matrix?.charset,
    frameCount,
    conversionMs: input.benchmark?.conversionMs,
    cols: input.benchmark?.cols ?? matrix?.cols,
    rows: input.benchmark?.rows ?? matrix?.rows,
    histogram: buildCharacterHistogram(matrix),
    heatmap: buildLuminanceHeatmap(matrix),
    frequency,
    compression,
    charsetAnalysis,
  };
}
