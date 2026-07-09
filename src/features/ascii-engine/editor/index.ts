/**
 * ASCII Engine — Editor (SSOT §3.3)
 * Tools mutantes + command-pattern history.
 */
export {
  EDITOR_TOOLS,
  EditorDocument,
  CommandHistory,
  PatchCellsCommand,
  SetSelectionCommand,
  createBrushCommand,
  createEraserCommand,
  createFillCommand,
  cloneMatrix,
  patchMatrixCells,
  floodFillPatches,
  getCharAt,
  captureCellPatches,
} from "./document";

export type {
  EditorCommand,
  EditorDocumentState,
  EditorLayer,
  EditorSelection,
  EditorSnapshot,
  EditorToolDescriptor,
  EditorToolId,
  ToolContext,
  CellPatch,
} from "./document";
