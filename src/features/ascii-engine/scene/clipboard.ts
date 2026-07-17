/**
 * Scene clipboard — copy/cut/paste/duplicate de SceneObject[] entre layers.
 * Serializa objetos (structuredClone); novos IDs no paste.
 */

import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import type { SceneObject } from "@/features/ascii-engine/scene/types";

export interface SceneClipboardPayload {
  version: 1;
  objects: SceneObject[];
  /** Offset aplicado no próximo paste (acumulativo). */
  pasteGeneration: number;
}

function newId(prefix = "obj"): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class SceneClipboard {
  private payload: SceneClipboardPayload | null = null;

  get isEmpty(): boolean {
    return !this.payload || this.payload.objects.length === 0;
  }

  get size(): number {
    return this.payload?.objects.length ?? 0;
  }

  /** Snapshot serializável (para testes / persistência de sessão). */
  toJSON(): SceneClipboardPayload | null {
    return this.payload ? structuredClone(this.payload) : null;
  }

  fromJSON(data: SceneClipboardPayload | null): void {
    this.payload = data ? structuredClone(data) : null;
  }

  clear(): void {
    this.payload = null;
  }

  /**
   * Copia objetos por id (ordem preservada).
   * Se `ids` vazio, usa seleção actual.
   */
  copy(scene: SceneDocument, ids?: string[]): number {
    const selected = ids?.length ? ids : scene.getSelectedObjectIds();
    const objects: SceneObject[] = [];
    for (const id of selected) {
      const obj = scene.getObject(id);
      if (obj) objects.push(obj);
    }
    if (objects.length === 0) return 0;
    this.payload = { version: 1, objects, pasteGeneration: 0 };
    return objects.length;
  }

  /** Copy + remove da cena. */
  cut(scene: SceneDocument, ids?: string[]): number {
    const selected = ids?.length ? ids : scene.getSelectedObjectIds();
    const n = this.copy(scene, selected);
    if (n === 0) return 0;
    for (const id of selected) {
      scene.removeObject(id);
    }
    return n;
  }

  /**
   * Cola clipboard na layer alvo (default: active).
   * Novos IDs; offset +2/+1 por geração de paste.
   */
  paste(
    scene: SceneDocument,
    options: { layerId?: string; offsetX?: number; offsetY?: number } = {},
  ): string[] {
    if (!this.payload || this.payload.objects.length === 0) return [];
    this.payload.pasteGeneration += 1;
    const gen = this.payload.pasteGeneration;
    const ox = options.offsetX ?? gen * 2;
    const oy = options.offsetY ?? gen * 1;
    const layerId = options.layerId ?? scene.getActiveLayerId();
    const newIds: string[] = [];
    const data = scene.toJSON();
    const layer = data.layers.find((l) => l.id === layerId);
    if (!layer) return [];

    for (const src of this.payload.objects) {
      const nid = newId("obj");
      const clone = structuredClone(src) as SceneObject;
      clone.id = nid;
      clone.layerId = layerId;
      clone.name = src.name.endsWith(" copy") ? src.name : `${src.name} copy`;
      clone.transform = {
        ...src.transform,
        x: src.transform.x + ox,
        y: src.transform.y + oy,
      };
      data.objects[nid] = clone;
      layer.objectIds.push(nid);
      newIds.push(nid);
    }
    data.selectedObjectIds = newIds;
    scene.replaceData(data);
    return newIds;
  }

  /**
   * Duplicata in-place (não usa clipboard). Offset fixo +2/+1.
   * Pode cruzar layers se `targetLayerId` for passado.
   */
  duplicate(
    scene: SceneDocument,
    ids?: string[],
    options: { targetLayerId?: string } = {},
  ): string[] {
    const selected = ids?.length ? ids : scene.getSelectedObjectIds();
    const newIds: string[] = [];
    for (const id of selected) {
      const dup = scene.duplicateObject(id);
      if (!dup) continue;
      if (options.targetLayerId) {
        scene.moveObjectToLayer(dup, options.targetLayerId);
      }
      newIds.push(dup);
    }
    if (newIds.length) scene.setSelectedObjectIds(newIds);
    return newIds;
  }

}

/** Serializa SceneObject[] para string (interop / debug). */
export function serializeSceneObjects(objects: SceneObject[]): string {
  return JSON.stringify({ version: 1, objects });
}

export function deserializeSceneObjects(raw: string): SceneObject[] {
  const parsed = JSON.parse(raw) as { version?: number; objects?: SceneObject[] };
  if (!parsed.objects || !Array.isArray(parsed.objects)) {
    throw new Error("Clipboard payload inválido");
  }
  return structuredClone(parsed.objects);
}
