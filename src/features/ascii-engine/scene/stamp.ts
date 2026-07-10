/**
 * Stamp — extrai região de matrix composta / ImageObject → asset em memória + ReferenceObject.
 */

import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";
import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import { emptyMatrix } from "@/features/ascii-engine/scene/scene-document";
import { composeScene } from "@/features/ascii-engine/scene/compositor";

export interface StampRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StampAsset {
  id: string;
  name: string;
  libraryId: string;
  matrix: AsciiMatrix;
  createdAt: string;
}

/** Biblioteca em memória de stamps (sessão). */
export class StampLibrary {
  readonly libraryId: string;
  private assets = new Map<string, StampAsset>();

  constructor(libraryId = "stamp-memory") {
    this.libraryId = libraryId;
  }

  list(): StampAsset[] {
    return [...this.assets.values()].map((a) => structuredClone(a));
  }

  get(id: string): StampAsset | undefined {
    const a = this.assets.get(id);
    return a ? structuredClone(a) : undefined;
  }

  add(matrix: AsciiMatrix, name?: string): StampAsset {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const asset: StampAsset = {
      id,
      name: name ?? `Stamp ${this.assets.size + 1}`,
      libraryId: this.libraryId,
      matrix: structuredClone(matrix),
      createdAt: new Date().toISOString(),
    };
    this.assets.set(id, asset);
    return structuredClone(asset);
  }

  remove(id: string): boolean {
    return this.assets.delete(id);
  }

  clear(): void {
    this.assets.clear();
  }
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

/** Extrai sub-região de uma AsciiMatrix (células fora = espaço). */
export function extractMatrixRegion(matrix: AsciiMatrix, region: StampRegion): AsciiMatrix {
  const w = Math.max(1, Math.floor(region.w));
  const h = Math.max(1, Math.floor(region.h));
  const ox = Math.floor(region.x);
  const oy = Math.floor(region.y);
  const map = new Map(matrix.cells.map((c) => [cellKey(c.col, c.row), c]));
  const out = emptyMatrix(w, h, matrix.charset);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const src = map.get(cellKey(ox + col, oy + row));
      const dest = out.cells.find((c) => c.col === col && c.row === row);
      if (!dest) continue;
      if (src) {
        dest.char = src.char;
        dest.luminance = src.luminance;
        dest.r = src.r;
        dest.g = src.g;
        dest.b = src.b;
      }
    }
  }
  return out;
}

/** Extrai região do composite actual da cena. */
export function extractStampFromScene(
  scene: SceneDocument,
  region: StampRegion,
): AsciiMatrix {
  const composed = composeScene(scene);
  return extractMatrixRegion(composed, region);
}

/** Extrai região de um ImageObject (coords locais ao objecto). */
export function extractStampFromImageObject(
  scene: SceneDocument,
  objectId: string,
  region: StampRegion,
): AsciiMatrix | null {
  const obj = scene.getObject(objectId);
  if (!obj || obj.type !== "image") return null;
  return extractMatrixRegion(obj.payload.matrix, region);
}

export interface StampIntoSceneOptions {
  name?: string;
  x?: number;
  y?: number;
  layerId?: string;
  /** Se true, também cria ImageObject com a matrix (além da reference). Default false. */
  asImage?: boolean;
}

/**
 * Guarda stamp na library e adiciona ReferenceObject (e opcionalmente ImageObject).
 * ReferenceObject não rasteriza no compositor ainda — use `asImage: true` para preview imediato.
 */
export function stampRegionIntoScene(
  scene: SceneDocument,
  library: StampLibrary,
  region: StampRegion,
  options: StampIntoSceneOptions = {},
): { asset: StampAsset; referenceId: string; imageId?: string } {
  const matrix = extractStampFromScene(scene, region);
  const asset = library.add(matrix, options.name);
  const referenceId = scene.addReferenceObject(
    { assetId: asset.id, libraryId: library.libraryId },
    { w: matrix.cols, h: matrix.rows },
    {
      name: options.name ?? asset.name,
      x: options.x ?? region.x,
      y: options.y ?? region.y,
      layerId: options.layerId,
    },
  );
  let imageId: string | undefined;
  if (options.asImage) {
    imageId = scene.addImageObject(matrix, {
      name: `${asset.name} (raster)`,
      x: options.x ?? region.x,
      y: options.y ?? region.y,
      layerId: options.layerId,
    });
  }
  return { asset, referenceId, imageId };
}

/** Resolve stamp asset → ImageObject na cena (para compose). */
export function placeStampAsset(
  scene: SceneDocument,
  asset: StampAsset,
  options: { name?: string; x?: number; y?: number; layerId?: string } = {},
): string {
  return scene.addImageObject(asset.matrix, {
    name: options.name ?? asset.name,
    x: options.x ?? 0,
    y: options.y ?? 0,
    layerId: options.layerId,
  });
}

/** Utilitário: conta células não-vazias (debug/tests). */
export function countNonEmptyCells(matrix: AsciiMatrix): number {
  return matrix.cells.filter((c: AsciiMatrixCell) => c.char !== " " && c.luminance > 0.01)
    .length;
}
