import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

import type { EditorCommand } from "./commands";
import {
  captureCellPatches,
  characterReplacePatches,
  floodFillPatches,
  moveSelectionPatches,
  patchMatrixCells,
  regionReplacePatches,
  stampPatches,
  textPatches,
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

/** Agrupa vários comandos num único passo de histórico. */
export class CompositeCommand implements EditorCommand {
  readonly label: string;
  private readonly commands: EditorCommand[];

  constructor(label: string, commands: EditorCommand[]) {
    this.label = label;
    this.commands = commands;
  }

  execute(): void {
    for (const cmd of this.commands) cmd.execute();
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i]!.undo();
    }
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

function createPatchCommandFromAfter(
  label: string,
  layerId: string,
  matrix: AsciiMatrix,
  after: CellPatch[],
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  if (after.length === 0) return null;
  const before = captureCellPatches(matrix, after);
  return new PatchCellsCommand({
    label,
    layerId,
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

/** Stamp: carimba padrão (clipboard/stamp) em (col, row). */
export function createStampCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  const { layer, col, row, selection, stamp } = ctx;
  const matrix = layer.matrix;
  if (!matrix || !stamp) return null;
  const after = stampPatches(matrix, stamp, col, row, selection);
  return createPatchCommandFromAfter("stamp", layer.id, matrix, after, getMatrix, setMatrix);
}

/** Text: insere string horizontal simples a partir de (col, row). */
export function createTextCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  const { layer, col, row, selection, text } = ctx;
  const matrix = layer.matrix;
  if (!matrix || !text) return null;
  const after = textPatches(matrix, text, col, row, selection);
  return createPatchCommandFromAfter("text", layer.id, matrix, after, getMatrix, setMatrix);
}

/** Character Replace: substitui from → to (selection opcional). */
export function createCharacterReplaceCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  const { layer, selection, replaceFrom, replaceTo } = ctx;
  const matrix = layer.matrix;
  if (!matrix || replaceFrom == null || replaceTo == null) return null;
  const after = characterReplacePatches(matrix, replaceFrom, replaceTo, selection);
  return createPatchCommandFromAfter(
    "character-replace",
    layer.id,
    matrix,
    after,
    getMatrix,
    setMatrix,
  );
}

/** Region Replace: preenche selection com stroke.char. */
export function createRegionReplaceCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
): EditorCommand | null {
  const { layer, selection, stroke } = ctx;
  const matrix = layer.matrix;
  if (!matrix || !selection) return null;
  const after = regionReplacePatches(matrix, stroke.char, selection);
  return createPatchCommandFromAfter(
    "region-replace",
    layer.id,
    matrix,
    after,
    getMatrix,
    setMatrix,
  );
}

/**
 * Move: desloca conteúdo da selection por moveDelta e actualiza selection.
 * Requer selection + moveDelta.
 */
export function createMoveCommand(
  ctx: ToolContext,
  getMatrix: () => AsciiMatrix | null,
  setMatrix: LayerMatrixSetter,
  setSelection: SelectionSetter,
): EditorCommand | null {
  const { layer, selection, moveDelta, stroke } = ctx;
  const matrix = layer.matrix;
  if (!matrix || !selection || !moveDelta) return null;
  if (moveDelta.col === 0 && moveDelta.row === 0) return null;

  const after = moveSelectionPatches(
    matrix,
    selection,
    moveDelta.col,
    moveDelta.row,
    stroke.eraseChar,
  );
  const patchCmd = createPatchCommandFromAfter(
    "move-cells",
    layer.id,
    matrix,
    after,
    getMatrix,
    setMatrix,
  );
  if (!patchCmd) return null;

  const nextSelection: EditorSelection = {
    col: selection.col + moveDelta.col,
    row: selection.row + moveDelta.row,
    cols: selection.cols,
    rows: selection.rows,
  };
  const selCmd = new SetSelectionCommand(selection, nextSelection, setSelection);
  return new CompositeCommand("move", [patchCmd, selCmd]);
}
