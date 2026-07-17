/**
 * Libraries — asset snippets + procedural shapes (Scene W6).
 * UI opcional: LibraryPanel stub em studio.
 */
export * from "@/features/ascii-engine/libraries/assets";
export * from "@/features/ascii-engine/libraries/shapes";

import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import type { LibraryAsset } from "@/features/ascii-engine/libraries/assets/types";
import { addTextToScene } from "@/features/ascii-engine/scene/text";
import {
  generateProceduralShape,
  type ProceduralShapeKind,
  type ProceduralShapeOptions,
} from "@/features/ascii-engine/libraries/shapes/generators";

/** Insere asset ASCII como TextObject na cena. */
export function insertAssetIntoScene(
  scene: SceneDocument,
  asset: LibraryAsset,
  options: { x?: number; y?: number; layerId?: string; name?: string } = {},
): string {
  return addTextToScene(scene, asset.ascii, {
    name: options.name ?? asset.name,
    x: options.x,
    y: options.y,
    layerId: options.layerId,
  });
}

/** Gera shape procedural e insere como TextObject. */
export function insertProceduralShapeIntoScene(
  scene: SceneDocument,
  kind: ProceduralShapeKind,
  options: ProceduralShapeOptions & {
    x?: number;
    y?: number;
    layerId?: string;
    name?: string;
  } = {},
): string {
  const ascii = generateProceduralShape(kind, options);
  return addTextToScene(scene, ascii, {
    name: options.name ?? kind,
    x: options.x,
    y: options.y,
    layerId: options.layerId,
  });
}
