import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import type { AsciiGridSource } from "@/features/ascii-interaction/grid/character-grid";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

export interface AsciiLayoutSize {
  cols: number;
  rows: number;
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
}

function measureString(source: string): { cols: number; rows: number } {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const rows = lines.length;
  const cols = Math.max(1, ...lines.map((l) => l.length));
  return { cols, rows: Math.max(1, rows) };
}

function measureMatrix(matrix: AsciiMatrix): { cols: number; rows: number } {
  return { cols: Math.max(1, matrix.cols), rows: Math.max(1, matrix.rows) };
}

/** Tamanho intrínseco da arte em CSS px (cols×cellW × rows×cellH). Never-crop foundation. */
export function measureAsciiLayout(
  source: AsciiGridSource,
  config?: Partial<AsciiInteractionConfig>,
): AsciiLayoutSize {
  const merged = mergeAsciiConfig(config);
  const { cols, rows } =
    typeof source === "string" ? measureString(source) : measureMatrix(source);
  return {
    cols,
    rows,
    cellWidth: merged.cellWidth,
    cellHeight: merged.cellHeight,
    width: cols * merged.cellWidth,
    height: rows * merged.cellHeight,
  };
}

/** Soft cap para evitar bitmaps gigantes; o workspace ainda faz fit via CSS transform. */
export const MAX_INTRINSIC_EDGE = 8192;

export function clampIntrinsicSize(width: number, height: number): { width: number; height: number; scale: number } {
  const edge = Math.max(width, height);
  if (edge <= MAX_INTRINSIC_EDGE) return { width, height, scale: 1 };
  const scale = MAX_INTRINSIC_EDGE / edge;
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
    scale,
  };
}
