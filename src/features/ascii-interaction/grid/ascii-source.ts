import { charBaseDensity, charToLayer } from "@/features/ascii-interaction/utils/math";

export interface ParsedAsciiCell {
  char: string;
  col: number;
  row: number;
  baseDensity: number;
  layer: number;
}

export interface ParsedAsciiSource {
  cols: number;
  rows: number;
  cells: ParsedAsciiCell[];
}

const VISIBLE_CHAR = /[^\s]/;

/**
 * Converte string ASCII multilinha em células visíveis.
 * Ignora linhas/colunas vazias nas bordas para centralizar a arte.
 */
export function parseAsciiSource(
  source: string,
  layerCount: number,
): ParsedAsciiSource {
  const rawLines = source.replace(/\r\n/g, "\n").split("\n");
  const lines = rawLines.map((line) => line.replace(/\s+$/g, ""));

  let minCol = Infinity;
  let maxCol = -1;
  let minRow = Infinity;
  let maxRow = -1;

  for (let row = 0; row < lines.length; row += 1) {
    const line = lines[row]!;
    for (let col = 0; col < line.length; col += 1) {
      const ch = line[col]!;
      if (VISIBLE_CHAR.test(ch)) {
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
      }
    }
  }

  if (!Number.isFinite(minCol)) {
    return { cols: 0, rows: 0, cells: [] };
  }

  const cols = maxCol - minCol + 1;
  const rows = maxRow - minRow + 1;
  const cells: ParsedAsciiCell[] = [];

  for (let row = minRow; row <= maxRow; row += 1) {
    const line = lines[row] ?? "";
    for (let col = minCol; col <= maxCol; col += 1) {
      const ch = line[col] ?? " ";
      if (!VISIBLE_CHAR.test(ch)) continue;

      cells.push({
        char: ch,
        col: col - minCol,
        row: row - minRow,
        baseDensity: charBaseDensity(ch),
        layer: charToLayer(ch, layerCount),
      });
    }
  }

  return { cols, rows, cells };
}

/** Índice linear no charset ordenado (densidade crescente). */
export function glyphIndexForChar(char: string, characterSet: string): number {
  const idx = characterSet.indexOf(char);
  if (idx >= 0) return idx;
  return Math.max(0, characterSet.length - 1);
}

export function charForGlyphIndex(index: number, characterSet: string): string {
  const clamped = Math.max(0, Math.min(characterSet.length - 1, index));
  return characterSet[clamped] ?? " ";
}
