import { EditorDocument } from "@/features/ascii-engine/editor";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import {
  DEFAULT_PROJECT_WORKSPACE,
  type ProjectAssetRef,
  type ProjectDocumentData,
  type ProjectMeta,
  type ProjectWorkspaceState,
  type NodeGraph,
  type TimelineDocument,
} from "@/features/ascii-engine/document/types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Aceita TimelineDocument P4 ou stub legado `{ keyframes: unknown[] }`. */
function normalizeTimeline(
  raw: TimelineDocument | (Partial<TimelineDocument> & { keyframes?: unknown[] }) | undefined,
): TimelineDocument | undefined {
  if (!raw) return undefined;
  const tracks = Array.isArray((raw as TimelineDocument).tracks)
    ? structuredClone((raw as TimelineDocument).tracks)
    : [];
  return {
    fps: typeof raw.fps === "number" ? raw.fps : 15,
    loop: typeof raw.loop === "boolean" ? raw.loop : true,
    frameCount: typeof raw.frameCount === "number" ? raw.frameCount : 0,
    tracks,
    onionSkin: raw.onionSkin ? structuredClone(raw.onionSkin) : undefined,
  };
}

export interface CreateProjectOptions {
  name?: string;
  author?: string;
  themeId?: string;
  workspace?: Partial<ProjectWorkspaceState>;
}

/**
 * Documento de projeto — SSOT serializável (PLATFORM §2.3).
 * Mantém um `EditorDocument` interno; `toJSON` / `fromJSON` para persistência.
 */
export class ProjectDocument {
  readonly id: string;
  private meta: ProjectMeta;
  private themeId: string;
  private workspace: ProjectWorkspaceState;
  private assets: ProjectAssetRef[] = [];
  private timeline: TimelineDocument | undefined;
  private nodeGraph: NodeGraph | undefined;
  private animation: AsciiAnimation | null = null;
  readonly editor: EditorDocument;

  private constructor(data: {
    id: string;
    meta: ProjectMeta;
    themeId: string;
    workspace: ProjectWorkspaceState;
    editor: EditorDocument;
    assets?: ProjectAssetRef[];
    timeline?: TimelineDocument;
    nodeGraph?: NodeGraph;
    animation?: AsciiAnimation | null;
  }) {
    this.id = data.id;
    this.meta = data.meta;
    this.themeId = data.themeId;
    this.workspace = data.workspace;
    this.editor = data.editor;
    this.assets = data.assets ?? [];
    this.timeline = data.timeline;
    this.nodeGraph = data.nodeGraph;
    this.animation = data.animation ?? null;
  }

  static create(options: CreateProjectOptions = {}): ProjectDocument {
    const createdAt = nowIso();
    return new ProjectDocument({
      id: newId(),
      meta: {
        name: options.name ?? "Untitled Project",
        createdAt,
        updatedAt: createdAt,
        author: options.author,
      },
      themeId: options.themeId ?? "root-os",
      workspace: { ...DEFAULT_PROJECT_WORKSPACE, ...options.workspace },
      editor: new EditorDocument(),
    });
  }

  static fromJSON(data: ProjectDocumentData): ProjectDocument {
    if (data.version !== "3.0") {
      throw new Error(
        `ProjectDocument version não suportada: ${String((data as { version?: string }).version)}`,
      );
    }
    const editor = new EditorDocument();
    const layers =
      data.layers.length > 0
        ? data.layers
        : [
            {
              id: crypto.randomUUID(),
              name: "Layer 1",
              visible: true,
              opacity: 1,
              matrix: null,
            },
          ];
    editor.hydrate({
      layers: structuredClone(layers),
      activeLayerId: data.activeLayerId || layers[0]!.id,
      selection: data.selection ?? null,
      config: data.interactionConfig ?? {},
      clipboard: null,
    });

    return new ProjectDocument({
      id: data.id,
      meta: { ...data.meta },
      themeId: data.themeId,
      workspace: { ...DEFAULT_PROJECT_WORKSPACE, ...data.workspace },
      editor,
      assets: structuredClone(data.assets ?? []),
      timeline: normalizeTimeline(data.timeline),
      nodeGraph: data.nodeGraph ? structuredClone(data.nodeGraph) : undefined,
      animation: data.animation ? structuredClone(data.animation) : null,
    });
  }

  static fromEditor(
    editor: EditorDocument,
    options: CreateProjectOptions & { id?: string } = {},
  ): ProjectDocument {
    const createdAt = nowIso();
    return new ProjectDocument({
      id: options.id ?? newId(),
      meta: {
        name: options.name ?? "Untitled Project",
        createdAt,
        updatedAt: createdAt,
        author: options.author,
      },
      themeId: options.themeId ?? "root-os",
      workspace: { ...DEFAULT_PROJECT_WORKSPACE, ...options.workspace },
      editor,
    });
  }

  touch(): void {
    this.meta = { ...this.meta, updatedAt: nowIso() };
  }

  getMeta(): ProjectMeta {
    return { ...this.meta };
  }

  setMeta(patch: Partial<ProjectMeta>): void {
    this.meta = { ...this.meta, ...patch, updatedAt: nowIso() };
  }

  getThemeId(): string {
    return this.themeId;
  }

  setThemeId(themeId: string): void {
    this.themeId = themeId;
    this.touch();
  }

  getWorkspace(): ProjectWorkspaceState {
    return structuredClone(this.workspace);
  }

  setWorkspace(patch: Partial<ProjectWorkspaceState>): void {
    this.workspace = { ...this.workspace, ...patch };
    this.touch();
  }

  getAssets(): ProjectAssetRef[] {
    return structuredClone(this.assets);
  }

  addAsset(ref: Omit<ProjectAssetRef, "id"> & { id?: string }): ProjectAssetRef {
    const asset: ProjectAssetRef = {
      id: ref.id ?? newId(),
      kind: ref.kind,
      name: ref.name,
      mime: ref.mime,
      path: ref.path,
    };
    this.assets = [...this.assets, asset];
    this.touch();
    return asset;
  }

  getTimeline(): TimelineDocument | undefined {
    return this.timeline ? structuredClone(this.timeline) : undefined;
  }

  setTimeline(timeline: TimelineDocument | undefined): void {
    this.timeline = timeline ? structuredClone(timeline) : undefined;
    this.touch();
  }

  getNodeGraph(): NodeGraph | undefined {
    return this.nodeGraph ? structuredClone(this.nodeGraph) : undefined;
  }

  setNodeGraph(graph: NodeGraph | undefined): void {
    this.nodeGraph = graph ? structuredClone(graph) : undefined;
    this.touch();
  }

  getAnimation(): AsciiAnimation | null {
    return this.animation ? structuredClone(this.animation) : null;
  }

  setAnimation(animation: AsciiAnimation | null): void {
    this.animation = animation ? structuredClone(animation) : null;
    this.touch();
  }

  toJSON(): ProjectDocumentData {
    const ed = this.editor.getState();
    return {
      version: "3.0",
      id: this.id,
      meta: { ...this.meta },
      themeId: this.themeId,
      workspace: structuredClone(this.workspace),
      layers: structuredClone(ed.layers),
      activeLayerId: ed.activeLayerId,
      selection: ed.selection ? structuredClone(ed.selection) : null,
      interactionConfig: structuredClone(ed.config),
      timeline: this.timeline ? structuredClone(this.timeline) : undefined,
      nodeGraph: this.nodeGraph ? structuredClone(this.nodeGraph) : undefined,
      history: {
        pastCount: ed.canUndo ? 1 : 0,
        futureCount: ed.canRedo ? 1 : 0,
      },
      assets: structuredClone(this.assets),
      animation: this.animation ? structuredClone(this.animation) : null,
    };
  }

  clone(): ProjectDocument {
    return ProjectDocument.fromJSON(this.toJSON());
  }
}
