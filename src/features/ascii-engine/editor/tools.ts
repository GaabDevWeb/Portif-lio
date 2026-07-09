import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

import type { EditorCommand } from "./commands";
import {
  captureCellPatches,
  floodFillPatches,
  patchMatrixCells,
  type CellPatch,
} from "./matrix-ops";
import type { EditorSelection, ToolContext } from "./types";

export type LayerMatrixSetter = (layerId: string, matrix: AsciiMatrix | null) => void;
export type SelectionSetter = (selection: EditorSelection | null) => void;

/** Comando que aplica patches de células numa layer (brush/eraser/fill). */
export class PatchCellsCommand implements EditorCommand {
  readonly label: string;
  private readonly layerId: string;
  private readonly before: CellPatch[];
  private readonly after: CellPatch[];
  private readonly getMatrix: () => AsciiMatrix | null;
  private readonly setMatrix: LayerMatrixSetter;

  constructor(opts: {
    label: string;
    layerId: string;
    before: CellPatch[];
    after: CellPatch[];
    getMatrix: () => AsciiMatrix | null;
    setMatrix: LayerMatrixSetter;
  }) {
    this.label = opts.label;
    this.layerId = opts.layerId;
    this.before = opts.before;
    this.after = opts.after;
    this.getMatrix = opts.getMatrix;
    this.setMatrix = opts.setMatrix;
  }

  execute(): void {
    const matrix = this.getMatrix();
    if (!matrix) return;
    this.setMatrix(this.layerId, patchMatrixCells(matrix, this.after));
  }

  undo(): void {
    const matrix = this.getMatrix();
    if (!matrix) return;
    this.setMatrix(this.layerId, patchMatrixCells(matrix, this.before));
  }
}

export class SetSelectionCommand implements EditorCommand {
  readonly label = "selection";
  private readonly before: EditorSelection | null;
  private readonly after: EditorSelection | null;
  private readonly setSelection: SelectionSetter;

  constructor(
    before: EditorSelection | null,
    after: EditorSelection | null,
    setSelection: SelectionSetter,
  ) {
    this.before = before ? { ...before } : null;
    this.after = after ? { ...after } : null;
    this.setSelection = setSelection;
  }

  execute(): void {
    this.setSelection(this.after ? { ...this.after } : null);
  }

  undo(): void {
    this.setSelection(this.before ? { ...this.before } : null);
  }
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

function createCellPaintCommand(
  label: string,
  ctx: ToolContext,
  char: string,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  const { layer, col, row, selection } = ctx;
  if (!inSelection(col, row, selection)) return null;

  const matrix = layer.matrix;
  if (!matrix) return null;
  if (col < 0 || row < 0 || col >= matrix.cols || row >= matrix.rows) return null;

  const after: CellPatch[] = [{ col, row, char }];
  const before = captureCellPatches(matrix, after);
  if (before[0]?.char === char) return null;

  return new PatchCellsCommand({
    label,
    layerId: layer.id,
    before,
    after,
    getMatrix,
    setMatrix,
  });
}

/** Brush: pinta stroke.char em (col, row). */
export function createBrushCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  return createCellPaintCommand("brush", ctx, ctx.stroke.char, getMatrix, setMatrix);
}

/** Eraser: define eraseChar (default espaço) em (col, row). */
export function createEraserCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  return createCellPaintCommand("eraser", ctx, ctx.stroke.eraseChar, getMatrix, setMatrix);
}

/** Fill: flood fill 4-conectado a partir de (col, row). */
export function createFillCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  const { layer, col, row, stroke, selection } = ctx;
  const matrix = layer.matrix;
  if (!matrix) return null;

  const after = floodFillPatches(matrix, col, row, stroke.char, selection);
  if (after.length === 0) return null;

  const before = captureCellPatches(matrix, after);
  return new PatchCellsCommand({
    label: "fill",
    layerId: layer.id,
    before,
    after,
    getMatrix,
    setMatrix,
  });
}
