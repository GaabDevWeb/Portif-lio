import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";

import type { EditorSelection } from "./types";

export interface CellPatch {
  col: number;
  row: number;
  char: string;
  luminance?: number;
  r?: number;
  g?: number;
  b?: number;
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

/** Clona a matriz (células shallow-copied). */
export function cloneMatrix(matrix: AsciiMatrix): AsciiMatrix {
  return {
    cols: matrix.cols,
    rows: matrix.rows,
    charset: matrix.charset,
    cells: matrix.cells.map((c) => ({ ...c })),
  };
}

/** Resolve carácter na posição; células ausentes (matriz esparsa) = espaço. */
export function getCharAt(matrix: AsciiMatrix, col: number, row: number): string {
  if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) return "";
  const cell = matrix.cells.find((c) => c.col === col && c.row === row);
  return cell?.char ?? " ";
}

function defaultPaintCell(patch: CellPatch): AsciiMatrixCell {
  return {
    char: patch.char,
    col: patch.col,
    row: patch.row,
    luminance: patch.luminance ?? 1,
    r: patch.r ?? 0,
    g: patch.g ?? 255,
    b: patch.b ?? 0,
  };
}

/**
 * Aplica patches de forma imutável.
 * - Célula existente: actualiza campos.
 * - Célula ausente + char não-vazio: cria célula.
 * - Célula ausente + espaço: no-op (matriz esparsa).
 */
export function patchMatrixCells(matrix: AsciiMatrix, patches: readonly CellPatch[]): AsciiMatrix {
  if (patches.length === 0) return matrix;

  const cells = matrix.cells.map((c) => ({ ...c }));
  const index = new Map<string, number>();
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]!;
    index.set(cellKey(c.col, c.row), i);
  }

  let changed = false;
  for (const patch of patches) {
    if (patch.col < 0 || patch.row < 0 || patch.col >= matrix.cols || patch.row >= matrix.rows) {
      continue;
    }
    const key = cellKey(patch.col, patch.row);
    const i = index.get(key);
    if (i !== undefined) {
      const prev = cells[i]!;
      const next: AsciiMatrixCell = {
        ...prev,
        char: patch.char,
        luminance: patch.luminance ?? prev.luminance,
        r: patch.r ?? prev.r,
        g: patch.g ?? prev.g,
        b: patch.b ?? prev.b,
      };
      if (
        next.char !== prev.char ||
        next.luminance !== prev.luminance ||
        next.r !== prev.r ||
        next.g !== prev.g ||
        next.b !== prev.b
      ) {
        cells[i] = next;
        changed = true;
      }
    } else if (patch.char !== " " && patch.char !== "") {
      index.set(key, cells.length);
      cells.push(defaultPaintCell(patch));
      changed = true;
    }
  }

  return changed ? { ...matrix, cells } : matrix;
}

function inSelection(col: number, row: number, selection: EditorSelection | null): boolean {
  if (!selection) return true;
  return (
    col >= selection.col &&
    row >= selection.row &&
    col < selection.col + selection.cols &&
    row < selection.row + selection.rows
  );
}

/**
 * Flood fill 4-conectado. Substitui a região ligada com o mesmo carácter alvo.
 * Respeita bounds da selection se presente.
 */
export function floodFillPatches(
  matrix: AsciiMatrix,
  seedCol: number,
  seedRow: number,
  fillChar: string,
  selection: EditorSelection | null = null,
): CellPatch[] {
  if (seedCol < 0 || seedRow < 0 || seedCol >= matrix.cols || seedRow >= matrix.rows) {
    return [];
  }
  if (!inSelection(seedCol, seedRow, selection)) return [];

  const target = getCharAt(matrix, seedCol, seedRow);
  if (target === fillChar) return [];

  const visited = new Set<string>();
  const patches: CellPatch[] = [];
  const queue: Array<{ col: number; row: number }> = [{ col: seedCol, row: seedRow }];

  while (queue.length > 0) {
    const { col, row } = queue.pop()!;
    const key = cellKey(col, row);
    if (visited.has(key)) continue;
    visited.add(key);

    if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) continue;
    if (!inSelection(col, row, selection)) continue;
    if (getCharAt(matrix, col, row) !== target) continue;

    patches.push({ col, row, char: fillChar });
    queue.push(
      { col: col + 1, row },
      { col: col - 1, row },
      { col, row: row + 1 },
      { col, row: row - 1 },
    );
  }

  return patches;
}

/** Captura o estado actual das células afectadas (para undo). */
export function captureCellPatches(matrix: AsciiMatrix, positions: readonly CellPatch[]): CellPatch[] {
  return positions.map((p) => ({
    col: p.col,
    row: p.row,
    char: getCharAt(matrix, p.col, p.row),
  }));
}
