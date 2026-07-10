import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";
import {
  createEmptyScene,
  type SceneCameraState,
  type SceneDocumentData,
  type SceneLayer,
  type SceneObject,
  type SceneObjectType,
  type SceneTransform,
  type ImageObjectData,
  type TextObjectData,
  type ShapeObjectData,
  type StrokeObjectData,
  type GroupObjectData,
  type ReferenceObjectData,
  type SceneHistoryCheckpoint,
} from "@/features/ascii-engine/scene/types";

function newId(prefix = "obj"): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultTransform(x = 0, y = 0): SceneTransform {
  return { x, y, rotation: 0, scaleX: 1, scaleY: 1 };
}

export type SceneListener = () => void;

/**
 * Scene graph SSOT — objetos + layers. Sem DOM.
 * Mutações notificam listeners; histórico via SceneHistory (externo).
 */
export class SceneDocument {
  private data: SceneDocumentData;
  private listeners = new Set<SceneListener>();
  private revision = 0;

  private constructor(data: SceneDocumentData) {
    this.data = data;
  }

  static create(width = 80, height = 40): SceneDocument {
    return new SceneDocument(createEmptyScene(width, height));
  }

  static fromJSON(data: SceneDocumentData): SceneDocument {
    if (data.version !== "1.0") {
      throw new Error(`SceneDocument version não suportada: ${String((data as { version?: string }).version)}`);
    }
    return new SceneDocument(structuredClone(data));
  }

  toJSON(): SceneDocumentData {
    return structuredClone(this.data);
  }

  getRevision(): number {
    return this.revision;
  }

  subscribe(fn: SceneListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.revision += 1;
    for (const fn of this.listeners) fn();
  }

  getWidth(): number {
    return this.data.width;
  }

  getHeight(): number {
    return this.data.height;
  }

  setSize(width: number, height: number): void {
    this.data.width = Math.max(1, Math.floor(width));
    this.data.height = Math.max(1, Math.floor(height));
    this.notify();
  }

  getLayers(): SceneLayer[] {
    return structuredClone(this.data.layers);
  }

  getActiveLayerId(): string {
    return this.data.activeLayerId;
  }

  setActiveLayerId(id: string): void {
    if (!this.data.layers.some((l) => l.id === id)) return;
    this.data.activeLayerId = id;
    this.notify();
  }

  getObject(id: string): SceneObject | undefined {
    const o = this.data.objects[id];
    return o ? structuredClone(o) : undefined;
  }

  getObjects(): SceneObject[] {
    return Object.values(this.data.objects).map((o) => structuredClone(o));
  }

  getSelectedObjectIds(): string[] {
    return [...this.data.selectedObjectIds];
  }

  setSelectedObjectIds(ids: string[]): void {
    this.data.selectedObjectIds = [...ids];
    this.notify();
  }

  getCamera(): SceneCameraState {
    return { ...this.data.camera };
  }

  setCamera(patch: Partial<SceneCameraState>): void {
    this.data.camera = { ...this.data.camera, ...patch };
    this.notify();
  }

  addLayer(name?: string): string {
    const id = newId("layer");
    this.data.layers.push({
      id,
      name: name ?? `Layer ${this.data.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      mask: null,
      objectIds: [],
    });
    this.data.activeLayerId = id;
    this.notify();
    return id;
  }

  updateLayer(id: string, patch: Partial<Omit<SceneLayer, "id" | "objectIds">>): void {
    const layer = this.data.layers.find((l) => l.id === id);
    if (!layer) return;
    Object.assign(layer, patch);
    this.notify();
  }

  reorderLayer(id: string, toIndex: number): void {
    const from = this.data.layers.findIndex((l) => l.id === id);
    if (from < 0) return;
    const [layer] = this.data.layers.splice(from, 1);
    if (!layer) return;
    const idx = Math.max(0, Math.min(toIndex, this.data.layers.length));
    this.data.layers.splice(idx, 0, layer);
    this.notify();
  }

  duplicateLayer(id: string): string | null {
    const layer = this.data.layers.find((l) => l.id === id);
    if (!layer) return null;
    const newLayerId = newId("layer");
    const idMap = new Map<string, string>();
    const newObjectIds: string[] = [];
    for (const oid of layer.objectIds) {
      const obj = this.data.objects[oid];
      if (!obj) continue;
      const nid = newId("obj");
      idMap.set(oid, nid);
      const clone = structuredClone(obj) as SceneObject;
      clone.id = nid;
      clone.layerId = newLayerId;
      clone.name = `${obj.name} copy`;
      this.data.objects[nid] = clone;
      newObjectIds.push(nid);
    }
    this.data.layers.push({
      ...structuredClone(layer),
      id: newLayerId,
      name: `${layer.name} copy`,
      objectIds: newObjectIds,
    });
    this.data.activeLayerId = newLayerId;
    this.notify();
    return newLayerId;
  }

  removeLayer(id: string): boolean {
    if (this.data.layers.length <= 1) return false;
    const layer = this.data.layers.find((l) => l.id === id);
    if (!layer) return false;
    for (const oid of layer.objectIds) {
      delete this.data.objects[oid];
    }
    this.data.layers = this.data.layers.filter((l) => l.id !== id);
    this.data.selectedObjectIds = this.data.selectedObjectIds.filter(
      (sid) => this.data.objects[sid]?.layerId !== id,
    );
    if (this.data.activeLayerId === id) {
      this.data.activeLayerId = this.data.layers[0]!.id;
    }
    this.notify();
    return true;
  }

  addImageObject(
    matrix: AsciiMatrix,
    options: { name?: string; x?: number; y?: number; layerId?: string } = {},
  ): string {
    const layerId = options.layerId ?? this.data.activeLayerId;
    const id = newId("obj");
    const obj: SceneObject = {
      id,
      type: "image",
      name: options.name ?? "Image",
      layerId,
      transform: defaultTransform(options.x ?? 0, options.y ?? 0),
      bounds: { w: matrix.cols, h: matrix.rows },
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      effects: [],
      payload: { matrix: structuredClone(matrix) } satisfies ImageObjectData,
    };
    this.data.objects[id] = obj;
    const layer = this.data.layers.find((l) => l.id === layerId);
    layer?.objectIds.push(id);
    this.data.selectedObjectIds = [id];
    this.notify();
    return id;
  }

  addTextObject(
    text: string,
    options: { name?: string; x?: number; y?: number; layerId?: string } = {},
  ): string {
    const layerId = options.layerId ?? this.data.activeLayerId;
    const id = newId("obj");
    const lines = text.split("\n");
    const w = Math.max(1, ...lines.map((l) => l.length));
    const h = Math.max(1, lines.length);
    const payload: TextObjectData = {
      text,
      align: "left",
      lineHeight: 1,
      fontMode: "plain",
    };
    const obj: SceneObject = {
      id,
      type: "text",
      name: options.name ?? "Text",
      layerId,
      transform: defaultTransform(options.x ?? 0, options.y ?? 0),
      bounds: { w, h },
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      effects: [],
      payload,
    };
    this.data.objects[id] = obj;
    this.data.layers.find((l) => l.id === layerId)?.objectIds.push(id);
    this.data.selectedObjectIds = [id];
    this.notify();
    return id;
  }

  addShapeObject(
    shape: ShapeObjectData,
    bounds: { w: number; h: number },
    options: { name?: string; x?: number; y?: number; layerId?: string } = {},
  ): string {
    const layerId = options.layerId ?? this.data.activeLayerId;
    const id = newId("obj");
    const obj: SceneObject = {
      id,
      type: "shape",
      name: options.name ?? shape.shape,
      layerId,
      transform: defaultTransform(options.x ?? 0, options.y ?? 0),
      bounds: { w: Math.max(1, bounds.w), h: Math.max(1, bounds.h) },
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      effects: [],
      payload: structuredClone(shape),
    };
    this.data.objects[id] = obj;
    this.data.layers.find((l) => l.id === layerId)?.objectIds.push(id);
    this.data.selectedObjectIds = [id];
    this.notify();
    return id;
  }

  addStrokeObject(
    stroke: StrokeObjectData,
    bounds: { w: number; h: number },
    options: { name?: string; x?: number; y?: number; layerId?: string } = {},
  ): string {
    const layerId = options.layerId ?? this.data.activeLayerId;
    const id = newId("obj");
    const obj: SceneObject = {
      id,
      type: "stroke",
      name: options.name ?? "Stroke",
      layerId,
      transform: defaultTransform(options.x ?? 0, options.y ?? 0),
      bounds: { w: Math.max(1, bounds.w), h: Math.max(1, bounds.h) },
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      effects: [],
      payload: structuredClone(stroke),
    };
    this.data.objects[id] = obj;
    this.data.layers.find((l) => l.id === layerId)?.objectIds.push(id);
    this.data.selectedObjectIds = [id];
    this.notify();
    return id;
  }

  addGroupObject(childIds: string[], options: { name?: string; layerId?: string } = {}): string {
    const layerId = options.layerId ?? this.data.activeLayerId;
    const id = newId("obj");
    const payload: GroupObjectData = { childIds: [...childIds] };
    const obj: SceneObject = {
      id,
      type: "group",
      name: options.name ?? "Group",
      layerId,
      transform: defaultTransform(0, 0),
      bounds: { w: 1, h: 1 },
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      effects: [],
      payload,
    };
    this.data.objects[id] = obj;
    this.data.layers.find((l) => l.id === layerId)?.objectIds.push(id);
    this.data.selectedObjectIds = [id];
    this.notify();
    return id;
  }

  addReferenceObject(
    ref: ReferenceObjectData,
    bounds: { w: number; h: number },
    options: { name?: string; x?: number; y?: number; layerId?: string } = {},
  ): string {
    const layerId = options.layerId ?? this.data.activeLayerId;
    const id = newId("obj");
    const obj: SceneObject = {
      id,
      type: "reference",
      name: options.name ?? "Reference",
      layerId,
      transform: defaultTransform(options.x ?? 0, options.y ?? 0),
      bounds,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      effects: [],
      payload: structuredClone(ref),
    };
    this.data.objects[id] = obj;
    this.data.layers.find((l) => l.id === layerId)?.objectIds.push(id);
    this.data.selectedObjectIds = [id];
    this.notify();
    return id;
  }

  updateObject(id: string, patch: Partial<SceneObjectBaseFields>): void {
    const obj = this.data.objects[id];
    if (!obj) return;
    const { transform, bounds, effects, ...rest } = patch;
    Object.assign(obj, rest);
    if (transform) obj.transform = { ...obj.transform, ...transform };
    if (bounds) obj.bounds = { ...obj.bounds, ...bounds };
    if (effects) obj.effects = structuredClone(effects);
    this.notify();
  }

  replaceObjectPayload(id: string, type: SceneObjectType, payload: SceneObject["payload"]): void {
    const obj = this.data.objects[id];
    if (!obj || obj.type !== type) return;
    (obj as SceneObject).payload = structuredClone(payload) as never;
    this.notify();
  }

  removeObject(id: string): boolean {
    const obj = this.data.objects[id];
    if (!obj) return false;
    const layer = this.data.layers.find((l) => l.id === obj.layerId);
    if (layer) layer.objectIds = layer.objectIds.filter((oid) => oid !== id);
    delete this.data.objects[id];
    this.data.selectedObjectIds = this.data.selectedObjectIds.filter((sid) => sid !== id);
    this.notify();
    return true;
  }

  duplicateObject(id: string): string | null {
    const obj = this.data.objects[id];
    if (!obj) return null;
    const nid = newId("obj");
    const clone = structuredClone(obj) as SceneObject;
    clone.id = nid;
    clone.name = `${obj.name} copy`;
    clone.transform = { ...obj.transform, x: obj.transform.x + 2, y: obj.transform.y + 1 };
    this.data.objects[nid] = clone;
    this.data.layers.find((l) => l.id === obj.layerId)?.objectIds.push(nid);
    this.data.selectedObjectIds = [nid];
    this.notify();
    return nid;
  }

  moveObjectToLayer(objectId: string, targetLayerId: string): boolean {
    const obj = this.data.objects[objectId];
    const target = this.data.layers.find((l) => l.id === targetLayerId);
    if (!obj || !target) return false;
    const src = this.data.layers.find((l) => l.id === obj.layerId);
    if (src) src.objectIds = src.objectIds.filter((id) => id !== objectId);
    obj.layerId = targetLayerId;
    target.objectIds.push(objectId);
    this.notify();
    return true;
  }

  addCheckpoint(label: string): string {
    const id = newId("cp");
    const cp: SceneHistoryCheckpoint = {
      id,
      label,
      createdAt: new Date().toISOString(),
      snapshot: this.toJSON(),
    };
    this.data.checkpoints.push(cp);
    if (this.data.checkpoints.length > 32) this.data.checkpoints.shift();
    this.notify();
    return id;
  }

  restoreCheckpoint(id: string): boolean {
    const cp = this.data.checkpoints.find((c) => c.id === id);
    if (!cp) return false;
    const checkpoints = this.data.checkpoints;
    this.data = structuredClone(cp.snapshot);
    this.data.checkpoints = checkpoints;
    this.notify();
    return true;
  }

  /** Replace entire scene data (used by history undo). */
  replaceData(data: SceneDocumentData, notify = true): void {
    this.data = structuredClone(data);
    if (notify) this.notify();
  }
}

type SceneObjectBaseFields = Omit<SceneObject, "id" | "type" | "payload">;

export function emptyMatrix(cols: number, rows: number, charset = " .:-=+*#%@"): AsciiMatrix {
  const cells: AsciiMatrixCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({ char: " ", col, row, luminance: 0, r: 0, g: 0, b: 0 });
    }
  }
  return { cols, rows, charset, cells };
}
