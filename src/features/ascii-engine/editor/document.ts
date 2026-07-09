import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

import { CommandHistory, type EditorCommand } from "./commands";
import { getCharAt } from "./matrix-ops";
import {
  createBrushCommand,
  createEraserCommand,
  createFillCommand,
  SetSelectionCommand,
} from "./tools";
import type {
  EditorDocumentState,
  EditorLayer,
  EditorSelection,
  EditorSnapshot,
  EditorToolId,
  ToolContext,
} from "./types";

export type {
  EditorDocumentState,
  EditorLayer,
  EditorSelection,
  EditorSnapshot,
  EditorToolDescriptor,
  EditorToolId,
  ToolContext,
} from "./types";

export type { EditorCommand } from "./commands";
export type { CellPatch } from "./matrix-ops";
export { CommandHistory } from "./commands";
export {
  captureCellPatches,
  cloneMatrix,
  floodFillPatches,
  getCharAt,
  patchMatrixCells,
} from "./matrix-ops";
export {
  createBrushCommand,
  createEraserCommand,
  createFillCommand,
  PatchCellsCommand,
  SetSelectionCommand,
} from "./tools";

import type { EditorToolDescriptor } from "./types";

export const EDITOR_TOOLS: EditorToolDescriptor[] = [
  { id: "select", label: "Seleção", status: "ready", description: "Seleciona região da matriz." },
  { id: "brush", label: "Brush", status: "ready", description: "Pintura de caracteres." },
  { id: "eraser", label: "Borracha", status: "ready", description: "Apaga células." },
  { id: "fill", label: "Preenchimento", status: "ready", description: "Flood fill." },
  { id: "stamp", label: "Carimbo", status: "stub", description: "Carimba padrão." },
  { id: "text", label: "Texto", status: "stub", description: "Insere texto ASCII." },
  { id: "transform", label: "Transformar", status: "stub", description: "Scale/rotate/crop." },
];

/** Snapshot legado empilhado como comando (compatibilidade undo/redo). */
class LegacySnapshotCommand implements EditorCommand {
  readonly label: string;
  private readonly before: EditorSnapshot;
  private readonly mutate: () => void;
  private after: EditorSnapshot | null = null;
  private readonly capture: () => EditorSnapshot;
  private readonly restore: (s: EditorSnapshot) => void;

  constructor(
    label: string,
    before: EditorSnapshot,
    mutate: () => void,
    capture: () => EditorSnapshot,
    restore: (s: EditorSnapshot) => void,
  ) {
    this.label = label;
    this.before = structuredClone(before);
    this.mutate = mutate;
    this.capture = capture;
    this.restore = restore;
  }

  execute(): void {
    if (this.after) {
      this.restore(structuredClone(this.after));
      return;
    }
    this.mutate();
    this.after = structuredClone(this.capture());
  }

  undo(): void {
    this.restore(structuredClone(this.before));
  }
}

/**
 * Documento de edição com histórico command-pattern (SSOT §3.3).
 * Mantém APIs de snapshot (setLayerMatrix, etc.) via LegacySnapshotCommand.
 * Path preferido para tools: applyCommand / paintAt / fillAt / setSelection.
 */
export class EditorDocument {
  private layers: EditorLayer[] = [];
  private activeLayerId = "";
  private selection: EditorSelection | null = null;
  private activeTool: EditorToolId = "select";
  private clipboard: AsciiMatrix | null = null;
  private config: Partial<AsciiInteractionConfig> = {};
  private strokeChar = "#";
  private eraseChar = " ";
  private readonly history: CommandHistory;

  constructor(maxHistory = 64) {
    this.history = new CommandHistory(maxHistory);
    const id = crypto.randomUUID();
    this.layers = [
      { id, name: "Layer 1", visible: true, opacity: 1, matrix: null },
    ];
    this.activeLayerId = id;
  }

  private captureSnapshot(): EditorSnapshot {
    return {
      layers: this.layers,
      activeLayerId: this.activeLayerId,
      selection: this.selection,
      config: this.config,
      clipboard: this.clipboard,
    };
  }

  private restoreSnapshot(s: EditorSnapshot): void {
    this.layers = s.layers;
    this.activeLayerId = s.activeLayerId;
    this.selection = s.selection;
    this.config = s.config;
    this.clipboard = s.clipboard;
  }

  /** Aplica mutação legada como comando (snapshot before/after). */
  private applyLegacyMutation(label: string, mutate: () => void): void {
    const before = this.captureSnapshot();
    this.history.push(
      new LegacySnapshotCommand(
        label,
        before,
        mutate,
        () => this.captureSnapshot(),
        (s) => this.restoreSnapshot(s),
      ),
    );
  }

  private getActiveLayer(): EditorLayer | undefined {
    return this.layers.find((l) => l.id === this.activeLayerId);
  }

  private getLayerMatrix = (layerId?: string): AsciiMatrix | null => {
    const id = layerId ?? this.activeLayerId;
    return this.layers.find((l) => l.id === id)?.matrix ?? null;
  };

  private setLayerMatrixSilent = (layerId: string, matrix: AsciiMatrix | null): void => {
    this.layers = this.layers.map((l) => (l.id === layerId ? { ...l, matrix } : l));
  };

  private setSelectionSilent = (selection: EditorSelection | null): void => {
    this.selection = selection;
  };

  buildToolContext(col: number, row: number): ToolContext | null {
    const layer = this.getActiveLayer();
    if (!layer) return null;
    return {
      layer,
      selection: this.selection,
      stroke: { char: this.strokeChar, eraseChar: this.eraseChar },
      col,
      row,
    };
  }

  getState(): EditorDocumentState {
    return {
      layers: this.layers,
      activeLayerId: this.activeLayerId,
      selection: this.selection,
      activeTool: this.activeTool,
      clipboard: this.clipboard,
      config: this.config,
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
      strokeChar: this.strokeChar,
      eraseChar: this.eraseChar,
    };
  }

  /** Profundidade do histórico de comandos (útil em testes). */
  getHistoryDepth(): { undo: number; redo: number } {
    return { undo: this.history.undoDepth, redo: this.history.redoDepth };
  }

  setActiveTool(tool: EditorToolId): void {
    this.activeTool = tool;
  }

  setStrokeChar(char: string): void {
    this.strokeChar = char.length > 0 ? char[0]! : "#";
  }

  setEraseChar(char: string): void {
    this.eraseChar = char.length > 0 ? char[0]! : " ";
  }

  /** Path preferido: aplica um EditorCommand e empilha no histórico. */
  applyCommand(command: EditorCommand): void {
    this.history.push(command);
  }

  setSelection(selection: EditorSelection | null): void {
    const before = this.selection;
    const same =
      before === selection ||
      (before !== null &&
        selection !== null &&
        before.col === selection.col &&
        before.row === selection.row &&
        before.cols === selection.cols &&
        before.rows === selection.rows);
    if (same) return;
    this.history.push(new SetSelectionCommand(before, selection, this.setSelectionSilent));
  }

  setLayerMatrix(layerId: string, matrix: AsciiMatrix | null): void {
    this.applyLegacyMutation("setLayerMatrix", () => {
      this.layers = this.layers.map((l) => (l.id === layerId ? { ...l, matrix } : l));
    });
  }

  setConfig(patch: Partial<AsciiInteractionConfig>): void {
    this.applyLegacyMutation("setConfig", () => {
      this.config = { ...this.config, ...patch };
    });
  }

  addLayer(name?: string): string {
    let id = "";
    this.applyLegacyMutation("addLayer", () => {
      id = crypto.randomUUID();
      this.layers = [
        ...this.layers,
        {
          id,
          name: name ?? `Layer ${this.layers.length + 1}`,
          visible: true,
          opacity: 1,
          matrix: null,
        },
      ];
      this.activeLayerId = id;
    });
    return id;
  }

  copySelection(): void {
    const layer = this.getActiveLayer();
    if (!layer?.matrix) return;
    this.applyLegacyMutation("copy", () => {
      this.clipboard = structuredClone(layer.matrix);
    });
  }

  pasteClipboard(): void {
    if (!this.clipboard) return;
    this.applyLegacyMutation("paste", () => {
      this.layers = this.layers.map((l) =>
        l.id === this.activeLayerId ? { ...l, matrix: structuredClone(this.clipboard) } : l,
      );
    });
  }

  /**
   * Aplica a tool activa em (col, row).
   * brush/eraser/fill mutam células; select actualiza selection 1×1 se sem drag.
   */
  applyToolAt(col: number, row: number): boolean {
    switch (this.activeTool) {
      case "brush":
        return this.paintAt(col, row);
      case "eraser":
        return this.eraseAt(col, row);
      case "fill":
        return this.fillAt(col, row);
      case "select":
        this.setSelection({ col, row, cols: 1, rows: 1 });
        return true;
      default:
        return false;
    }
  }

  paintAt(col: number, row: number): boolean {
    const ctx = this.buildToolContext(col, row);
    if (!ctx) return false;
    const cmd = createBrushCommand(ctx, this.getLayerMatrix, this.setLayerMatrixSilent);
    if (!cmd) return false;
    this.history.push(cmd);
    return true;
  }

  eraseAt(col: number, row: number): boolean {
    const ctx = this.buildToolContext(col, row);
    if (!ctx) return false;
    const cmd = createEraserCommand(ctx, this.getLayerMatrix, this.setLayerMatrixSilent);
    if (!cmd) return false;
    this.history.push(cmd);
    return true;
  }

  fillAt(col: number, row: number): boolean {
    const ctx = this.buildToolContext(col, row);
    if (!ctx) return false;
    const cmd = createFillCommand(ctx, this.getLayerMatrix, this.setLayerMatrixSilent);
    if (!cmd) return false;
    this.history.push(cmd);
    return true;
  }

  /** Lê carácter na layer activa (útil em testes / inspector). */
  getCharAt(col: number, row: number): string {
    const matrix = this.getLayerMatrix();
    if (!matrix) return "";
    return getCharAt(matrix, col, row);
  }

  undo(): boolean {
    return this.history.undo();
  }

  redo(): boolean {
    return this.history.redo();
  }

  setActiveLayerId(layerId: string): void {
    if (!this.layers.some((l) => l.id === layerId)) return;
    this.activeLayerId = layerId;
  }

  /**
   * Hidrata o documento a partir de um snapshot serializado (sem empilhar histórico).
   * Usado por ProjectDocument.fromJSON — additive, não remove APIs existentes.
   */
  hydrate(snapshot: EditorSnapshot, options: { clearHistory?: boolean } = {}): void {
    this.layers = structuredClone(snapshot.layers);
    this.activeLayerId = snapshot.activeLayerId;
    this.selection = snapshot.selection ? structuredClone(snapshot.selection) : null;
    this.config = structuredClone(snapshot.config);
    this.clipboard = snapshot.clipboard ? structuredClone(snapshot.clipboard) : null;
    if (options.clearHistory !== false) {
      this.history.clear();
    }
  }
}
