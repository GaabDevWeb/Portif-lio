import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { EditorLayer, EditorSelection } from "@/features/ascii-engine/editor";

/** Workspace viewport serializado no projeto (espelha lab WorkspaceState). */
export interface ProjectWorkspaceState {
  zoom: "fit" | 1 | 2 | 4 | 8;
  pan: { x: number; y: number };
  showOriginal: boolean;
  originalMode: "split" | "overlay" | "peek";
  focusMode: boolean;
  peeking: boolean;
  sidebarOpen: boolean;
}

export interface ProjectMeta {
  name: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface ProjectAssetRef {
  id: string;
  kind: "image" | "gif" | "other";
  name: string;
  mime: string;
  /** Path relativo dentro do ZIP (`assets/<id>.ext`) ou chave IDB. */
  path: string;
}

/** Placeholder serializável — preenchido em P4/P6. */
export interface TimelineDocumentStub {
  fps: number;
  loop: boolean;
  frameCount: number;
  keyframes: unknown[];
}

export interface NodeGraphStub {
  version: 1;
  nodes: unknown[];
  edges: unknown[];
}

export interface HistoryStackStub {
  pastCount: number;
  futureCount: number;
}

/**
 * SSOT de sessão / ficheiro de projeto (PLATFORM §2.3).
 * Serializável em `document.json` dentro de `*.ascii-project.zip`.
 */
export interface ProjectDocumentData {
  version: "3.0";
  id: string;
  meta: ProjectMeta;
  themeId: string;
  workspace: ProjectWorkspaceState;
  layers: EditorLayer[];
  activeLayerId: string;
  selection: EditorSelection | null;
  interactionConfig: Partial<AsciiInteractionConfig>;
  timeline?: TimelineDocumentStub;
  nodeGraph?: NodeGraphStub;
  history: HistoryStackStub;
  assets: ProjectAssetRef[];
  /** Animação opcional embutida (frames em document; assets separados se grandes). */
  animation?: AsciiAnimation | null;
}

export const DEFAULT_PROJECT_WORKSPACE: ProjectWorkspaceState = {
  zoom: "fit",
  pan: { x: 0, y: 0 },
  showOriginal: false,
  originalMode: "peek",
  focusMode: false,
  peeking: false,
  sidebarOpen: false,
};

export type { AsciiMatrix };
