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

/** Extrai região rectangular como matriz densa (espaços onde ausente). */
export function extractRegion(matrix: AsciiMatrix, selection: EditorSelection): AsciiMatrix {
  const cells: AsciiMatrix["cells"] = [];
  for (let row = 0; row < selection.rows; row++) {
    for (let col = 0; col < selection.cols; col++) {
      const srcCol = selection.col + col;
      const srcRow = selection.row + row;
      const existing = matrix.cells.find((c) => c.col === srcCol && c.row === srcRow);
      cells.push(
        existing
          ? { ...existing, col, row }
          : {
              char: " ",
              col,
              row,
              luminance: 0,
              r: 0,
              g: 0,
              b: 0,
            },
      );
    }
  }
  return {
    cols: selection.cols,
    rows: selection.rows,
    charset: matrix.charset,
    cells,
  };
}

/**
 * Carimba `stamp` em (originCol, originRow).
 * Respeita bounds da selection se presente.
 */
export function stampPatches(
  matrix: AsciiMatrix,
  stamp: AsciiMatrix,
  originCol: number,
  originRow: number,
  selection: EditorSelection | null = null,
): CellPatch[] {
  const patches: CellPatch[] = [];
  for (const cell of stamp.cells) {
    const col = originCol + cell.col;
    const row = originRow + cell.row;
    if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) continue;
    if (!inSelection(col, row, selection)) continue;
    if (cell.char === " " || cell.char === "") continue;
    patches.push({
      col,
      row,
      char: cell.char,
      luminance: cell.luminance,
      r: cell.r,
      g: cell.g,
      b: cell.b,
    });
  }
  return patches;
}

/** Insere texto horizontal a partir de (col, row). */
export function textPatches(
  matrix: AsciiMatrix,
  text: string,
  originCol: number,
  originRow: number,
  selection: EditorSelection | null = null,
): CellPatch[] {
  if (!text) return [];
  const patches: CellPatch[] = [];
  for (let i = 0; i < text.length; i++) {
    const col = originCol + i;
    const row = originRow;
    if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) continue;
    if (!inSelection(col, row, selection)) continue;
    const char = text[i]!;
    patches.push({ col, row, char });
  }
  return patches;
}

/** Substitui todas as ocorrências de `from` por `to` (opcionalmente na selection). */
export function characterReplacePatches(
  matrix: AsciiMatrix,
  from: string,
  to: string,
  selection: EditorSelection | null = null,
): CellPatch[] {
  if (!from || from === to) return [];
  const fromChar = from[0]!;
  const toChar = to[0] ?? " ";
  const patches: CellPatch[] = [];

  const visit = (col: number, row: number) => {
    if (!inSelection(col, row, selection)) return;
    if (getCharAt(matrix, col, row) !== fromChar) return;
    patches.push({ col, row, char: toChar });
  };

  if (selection) {
    for (let row = selection.row; row < selection.row + selection.rows; row++) {
      for (let col = selection.col; col < selection.col + selection.cols; col++) {
        visit(col, row);
      }
    }
  } else {
    // Matriz esparsa: células existentes + varrer grid se from for espaço
    if (fromChar === " ") {
      for (let row = 0; row < matrix.rows; row++) {
        for (let col = 0; col < matrix.cols; col++) {
          visit(col, row);
        }
      }
    } else {
      for (const cell of matrix.cells) {
        visit(cell.col, cell.row);
      }
    }
  }

  return patches;
}

/** Preenche a região (selection obrigatória) com um carácter. */
export function regionReplacePatches(
  matrix: AsciiMatrix,
  fillChar: string,
  selection: EditorSelection,
): CellPatch[] {
  const char = fillChar[0] ?? " ";
  const patches: CellPatch[] = [];
  for (let row = selection.row; row < selection.row + selection.rows; row++) {
    for (let col = selection.col; col < selection.col + selection.cols; col++) {
      if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) continue;
      if (getCharAt(matrix, col, row) === char) continue;
      patches.push({ col, row, char });
    }
  }
  return patches;
}

/**
 * Move conteúdo da selection por (dCol, dRow).
 * Limpa origem e escreve destino; células fora dos bounds são descartadas.
 */
export function moveSelectionPatches(
  matrix: AsciiMatrix,
  selection: EditorSelection,
  dCol: number,
  dRow: number,
  eraseChar = " ",
): CellPatch[] {
  if (dCol === 0 && dRow === 0) return [];

  const byKey = new Map<string, CellPatch>();

  // 1) limpar origem
  for (let row = selection.row; row < selection.row + selection.rows; row++) {
    for (let col = selection.col; col < selection.col + selection.cols; col++) {
      if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) continue;
      byKey.set(cellKey(col, row), { col, row, char: eraseChar });
    }
  }

  // 2) colocar no destino (sobrescreve clears se overlap)
  for (let row = 0; row < selection.rows; row++) {
    for (let col = 0; col < selection.cols; col++) {
      const srcCol = selection.col + col;
      const srcRow = selection.row + row;
      const dstCol = srcCol + dCol;
      const dstRow = srcRow + dRow;
      if (dstCol < 0 || dstRow < 0 || dstCol >= matrix.cols || dstRow >= matrix.rows) continue;
      const existing = matrix.cells.find((c) => c.col === srcCol && c.row === srcRow);
      const char = existing?.char ?? getCharAt(matrix, srcCol, srcRow);
      byKey.set(cellKey(dstCol, dstRow), {
        col: dstCol,
        row: dstRow,
        char,
        luminance: existing?.luminance,
        r: existing?.r,
        g: existing?.g,
        b: existing?.b,
      });
    }
  }

  return [...byKey.values()].filter((p) => getCharAt(matrix, p.col, p.row) !== p.char);
}
