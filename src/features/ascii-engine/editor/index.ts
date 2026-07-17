/**
 * ASCII Engine — Editor (SSOT §3.3)
 * Tools mutantes + command-pattern history.
 */
export {
  EDITOR_TOOLS,
  EditorDocument,
  CommandHistory,
  CompositeCommand,
  PatchCellsCommand,
  SetSelectionCommand,
  createBrushCommand,
  createEraserCommand,
  createFillCommand,
  createStampCommand,
  createTextCommand,
  createCharacterReplaceCommand,
  createRegionReplaceCommand,
  createMoveCommand,
  cloneMatrix,
  patchMatrixCells,
  floodFillPatches,
  getCharAt,
  captureCellPatches,
  stampPatches,
  textPatches,
  characterReplacePatches,
  regionReplacePatches,
  moveSelectionPatches,
  extractRegion,
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
