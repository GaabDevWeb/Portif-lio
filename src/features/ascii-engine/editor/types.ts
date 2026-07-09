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
  strokeChar: string;
  eraseChar: string;
}

/** Contexto passado às tools mutantes (SSOT §3.3). */
export interface ToolContext {
  layer: EditorLayer;
  selection: EditorSelection | null;
  stroke: {
    char: string;
    eraseChar: string;
  };
  col: number;
  row: number;
}
