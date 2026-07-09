import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

export type EditorToolId =
  | "select"
  | "brush"
  | "eraser"
  | "fill"
  | "stamp"
  | "text"
  | "transform";

export interface EditorToolDescriptor {
  id: EditorToolId;
  label: string;
  status: "ready" | "stub";
  description: string;
}

export const EDITOR_TOOLS: EditorToolDescriptor[] = [
  { id: "select", label: "Seleção", status: "ready", description: "Seleciona região da matriz." },
  { id: "brush", label: "Brush", status: "stub", description: "Pintura de caracteres." },
  { id: "eraser", label: "Borracha", status: "stub", description: "Apaga células." },
  { id: "fill", label: "Preenchimento", status: "stub", description: "Flood fill." },
  { id: "stamp", label: "Carimbo", status: "stub", description: "Carimba padrão." },
  { id: "text", label: "Texto", status: "stub", description: "Insere texto ASCII." },
  { id: "transform", label: "Transformar", status: "stub", description: "Scale/rotate/crop." },
];

export interface EditorLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  matrix: AsciiMatrix | null;
}

export interface EditorSelection {
  col: number;
  row: number;
  cols: number;
  rows: number;
}

export interface EditorSnapshot {
  layers: EditorLayer[];
  activeLayerId: string;
  selection: EditorSelection | null;
  config: Partial<AsciiInteractionConfig>;
  clipboard: AsciiMatrix | null;
}

export interface EditorDocumentState {
  layers: EditorLayer[];
  activeLayerId: string;
  selection: EditorSelection | null;
  activeTool: EditorToolId;
  clipboard: AsciiMatrix | null;
  config: Partial<AsciiInteractionConfig>;
  canUndo: boolean;
  canRedo: boolean;
}

function cloneSnapshot(s: EditorSnapshot): EditorSnapshot {
  return structuredClone(s);
}

/** Documento de edição com histórico undo/redo (config + layers). */
export class EditorDocument {
  private layers: EditorLayer[] = [];
  private activeLayerId = "";
  private selection: EditorSelection | null = null;
  private activeTool: EditorToolId = "select";
  private clipboard: AsciiMatrix | null = null;
  private config: Partial<AsciiInteractionConfig> = {};
  private past: EditorSnapshot[] = [];
  private future: EditorSnapshot[] = [];
  private readonly maxHistory: number;

  constructor(maxHistory = 64) {
    this.maxHistory = maxHistory;
    const id = crypto.randomUUID();
    this.layers = [
      { id, name: "Layer 1", visible: true, opacity: 1, matrix: null },
    ];
    this.activeLayerId = id;
  }

  private snapshot(): EditorSnapshot {
    return {
      layers: this.layers,
      activeLayerId: this.activeLayerId,
      selection: this.selection,
      config: this.config,
      clipboard: this.clipboard,
    };
  }

  private pushHistory(): void {
    this.past.push(cloneSnapshot(this.snapshot()));
    if (this.past.length > this.maxHistory) this.past.shift();
    this.future = [];
  }

  getState(): EditorDocumentState {
    return {
      layers: this.layers,
      activeLayerId: this.activeLayerId,
      selection: this.selection,
      activeTool: this.activeTool,
      clipboard: this.clipboard,
      config: this.config,
      canUndo: this.past.length > 0,
      canRedo: this.future.length > 0,
    };
  }

  setActiveTool(tool: EditorToolId): void {
    this.activeTool = tool;
  }

  setSelection(selection: EditorSelection | null): void {
    this.pushHistory();
    this.selection = selection;
  }

  setLayerMatrix(layerId: string, matrix: AsciiMatrix | null): void {
    this.pushHistory();
    this.layers = this.layers.map((l) => (l.id === layerId ? { ...l, matrix } : l));
  }

  setConfig(patch: Partial<AsciiInteractionConfig>): void {
    this.pushHistory();
    this.config = { ...this.config, ...patch };
  }

  addLayer(name?: string): string {
    this.pushHistory();
    const id = crypto.randomUUID();
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
    return id;
  }

  copySelection(): void {
    const layer = this.layers.find((l) => l.id === this.activeLayerId);
    if (!layer?.matrix) return;
    this.pushHistory();
    this.clipboard = structuredClone(layer.matrix);
  }

  pasteClipboard(): void {
    if (!this.clipboard) return;
    this.pushHistory();
    this.layers = this.layers.map((l) =>
      l.id === this.activeLayerId ? { ...l, matrix: structuredClone(this.clipboard) } : l,
    );
  }

  undo(): boolean {
    const prev = this.past.pop();
    if (!prev) return false;
    this.future.push(cloneSnapshot(this.snapshot()));
    this.layers = prev.layers;
    this.activeLayerId = prev.activeLayerId;
    this.selection = prev.selection;
    this.config = prev.config;
    this.clipboard = prev.clipboard;
    return true;
  }

  redo(): boolean {
    const next = this.future.pop();
    if (!next) return false;
    this.past.push(cloneSnapshot(this.snapshot()));
    this.layers = next.layers;
    this.activeLayerId = next.activeLayerId;
    this.selection = next.selection;
    this.config = next.config;
    this.clipboard = next.clipboard;
    return true;
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
      this.past = [];
      this.future = [];
    }
  }
}
