import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function charForLuminance(luminance: number, charset: string): string {
  if (!charset || charset.length === 0) return " ";
  const t = clamp01(luminance);
  const idx = Math.min(charset.length - 1, Math.round(t * (charset.length - 1)));
  return charset[idx] ?? " ";
}

/**
 * Cell-wise linear blend of two AsciiMatrix frames (demo / onion helper).
 * Lerps luminance + RGB; picks nearest charset glyph from `charset` (or a.charset).
 * Requires matching cols×rows; otherwise returns a clone of `a`.
 */
export function blendMatrices(
  a: AsciiMatrix,
  b: AsciiMatrix,
  t: number,
  charset?: string,
): AsciiMatrix {
  const u = clamp01(t);
  if (a.cols !== b.cols || a.rows !== b.rows) {
    return {
      cols: a.cols,
      rows: a.rows,
      charset: charset ?? a.charset,
      cells: a.cells.map((c) => ({ ...c })),
    };
  }

  const glyphs = charset ?? a.charset;
  const cellCount = a.cols * a.rows;
  const cells: AsciiMatrixCell[] = new Array(cellCount);

  for (let i = 0; i < cellCount; i++) {
    const ca = a.cells[i];
    const cb = b.cells[i];
    if (!ca || !cb) {
      cells[i] = ca ? { ...ca } : { char: " ", col: 0, row: 0, luminance: 0, r: 0, g: 0, b: 0 };
      continue;
    }
    const luminance = ca.luminance + (cb.luminance - ca.luminance) * u;
    const r = Math.round(ca.r + (cb.r - ca.r) * u);
    const g = Math.round(ca.g + (cb.g - ca.g) * u);
    const bl = Math.round(ca.b + (cb.b - ca.b) * u);
    cells[i] = {
      col: ca.col,
      row: ca.row,
      luminance,
      r,
      g,
      b: bl,
      char: charForLuminance(luminance, glyphs),
    };
  }

  return {
    cols: a.cols,
    rows: a.rows,
    charset: glyphs,
    cells,
  };
}
