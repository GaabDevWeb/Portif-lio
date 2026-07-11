/**
 * AspectRatioEngine — SSOT for image/GIF → ASCII grid geometry.
 *
 * Identity (must hold after render with the same cell metrics):
 *   (cols * cellW) / (rows * cellH) ≈ (imgW / imgH) * pixelAspect
 *
 * Therefore:
 *   rows = cols * (imgH / imgW) * (cellW / cellH) / pixelAspect
 *
 * `fontCompensation` is intentionally ignored (legacy / recipe compat only).
 */

import {
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
} from "@/features/ascii-interaction/image-pipeline/render-utils";

export interface GlyphMetrics {
  cellWidth: number;
  cellHeight: number;
  /** cellWidth / cellHeight */
  cellAspect: number;
  fontFamily: string;
  fontSize: number;
}

export interface GridSize {
  cols: number;
  rows: number;
}

export interface RenderSize {
  width: number;
  height: number;
  cellW: number;
  cellH: number;
}

export interface ResolveGridInput {
  imgWidth: number;
  imgHeight: number;
  /** Target column count (pipeline `width`). */
  cols: number;
  /** Explicit row count; ignored when lockAspectRatio or <= 0. */
  rows?: number;
  lockAspectRatio?: boolean;
  /** Non-square source pixels only (anamorphic). Default 1. */
  pixelAspect?: number;
  metrics: GlyphMetrics;
}

export interface MeasureGlyphOptions {
  fontFamily?: string;
  fontSize?: number;
  sampleChar?: string;
}

const DEFAULT_FONT = '"Courier New", monospace';

let cachedDefault: GlyphMetrics | null = null;

export function metricsFromCellSize(
  cellWidth: number,
  cellHeight: number,
  fontFamily = DEFAULT_FONT,
  fontSize?: number,
): GlyphMetrics {
  const cw = Math.max(1, cellWidth);
  const ch = Math.max(1, cellHeight);
  return {
    cellWidth: cw,
    cellHeight: ch,
    cellAspect: cw / ch,
    fontFamily,
    fontSize: fontSize ?? Math.max(1, Math.floor(ch * 0.85)),
  };
}

/** Fallback when DOM measurement is unavailable (Node / workers). */
export function fallbackGlyphMetrics(): GlyphMetrics {
  return metricsFromCellSize(DEFAULT_MATRIX_CELL_W, DEFAULT_MATRIX_CELL_H);
}

export function getDefaultGlyphMetrics(): GlyphMetrics {
  if (cachedDefault) return cachedDefault;
  cachedDefault = fallbackGlyphMetrics();
  return cachedDefault;
}

export function clearGlyphMetricsCache(): void {
  cachedDefault = null;
}

/**
 * Measure monospace cell from canvas TextMetrics when document is available.
 * Falls back to DEFAULT_MATRIX_CELL_* otherwise.
 */
export function measureGlyphMetrics(options: MeasureGlyphOptions = {}): GlyphMetrics {
  const fontFamily = options.fontFamily ?? DEFAULT_FONT;
  const fontSize = options.fontSize ?? Math.max(1, Math.floor(DEFAULT_MATRIX_CELL_H * 0.85));
  const sampleChar = options.sampleChar ?? "M";

  if (typeof document === "undefined") {
    return metricsFromCellSize(DEFAULT_MATRIX_CELL_W, DEFAULT_MATRIX_CELL_H, fontFamily, fontSize);
  }

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return metricsFromCellSize(DEFAULT_MATRIX_CELL_W, DEFAULT_MATRIX_CELL_H, fontFamily, fontSize);
    }
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(sampleChar);
    const width = Math.max(1, Math.ceil(metrics.width));
    const ascent = metrics.actualBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2;
    const height = Math.max(1, Math.ceil(ascent + descent));
    return metricsFromCellSize(width, height, fontFamily, fontSize);
  } catch {
    return metricsFromCellSize(DEFAULT_MATRIX_CELL_W, DEFAULT_MATRIX_CELL_H, fontFamily, fontSize);
  }
}

export function sourceAspect(imgWidth: number, imgHeight: number, pixelAspect = 1): number {
  const w = Math.max(1, imgWidth);
  const h = Math.max(1, imgHeight);
  return (w / h) * (pixelAspect > 0 ? pixelAspect : 1);
}

export function renderedAspect(cols: number, rows: number, metrics: GlyphMetrics): number {
  return (Math.max(1, cols) * metrics.cellWidth) / (Math.max(1, rows) * metrics.cellHeight);
}

/**
 * Core grid resolver — single source of truth for conversion geometry.
 */
export function resolveGridSize(input: ResolveGridInput): GridSize {
  const cols = Math.max(8, Math.round(input.cols));
  const lock = input.lockAspectRatio !== false;
  const explicitRows = input.rows != null && input.rows > 0 ? Math.max(8, Math.round(input.rows)) : 0;

  if (!lock && explicitRows > 0) {
    return { cols, rows: explicitRows };
  }

  const imgW = Math.max(1, input.imgWidth);
  const imgH = Math.max(1, input.imgHeight);
  const pixelAspect = input.pixelAspect != null && input.pixelAspect > 0 ? input.pixelAspect : 1;
  const { cellWidth, cellHeight } = input.metrics;

  // rows = cols * (imgH/imgW) * (cellW/cellH) / pixelAspect
  const rows = Math.max(
    8,
    Math.round((cols * imgH * cellWidth) / (imgW * cellHeight * pixelAspect)),
  );

  return { cols, rows };
}

export function resolveRenderSize(grid: GridSize, metrics: GlyphMetrics): RenderSize {
  return {
    width: Math.max(1, Math.round(grid.cols * metrics.cellWidth)),
    height: Math.max(1, Math.round(grid.rows * metrics.cellHeight)),
    cellW: metrics.cellWidth,
    cellH: metrics.cellHeight,
  };
}

export function resolveMetricsFromOptions(options: {
  glyphCellWidth?: number;
  glyphCellHeight?: number;
}): GlyphMetrics {
  if (
    options.glyphCellWidth != null &&
    options.glyphCellHeight != null &&
    options.glyphCellWidth > 0 &&
    options.glyphCellHeight > 0
  ) {
    return metricsFromCellSize(options.glyphCellWidth, options.glyphCellHeight);
  }
  return getDefaultGlyphMetrics();
}

export const AspectRatioEngine = {
  clearGlyphMetricsCache,
  fallbackGlyphMetrics,
  getDefaultGlyphMetrics,
  measureGlyphMetrics,
  metricsFromCellSize,
  renderedAspect,
  resolveGridSize,
  resolveMetricsFromOptions,
  resolveRenderSize,
  sourceAspect,
} as const;
