/**
 * Export do composite da cena — composeScene + exporters existentes.
 */

import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import { composeScene, type ComposeOptions } from "@/features/ascii-engine/scene/compositor";
import {
  exportMatrix,
  type ExportFormatId,
  matrixToAsciiSource,
  matrixToJson,
} from "@/features/ascii-engine/exporters";

export interface ExportSceneOptions extends ComposeOptions {
  basename?: string;
  sourceWidth?: number;
  sourceHeight?: number;
}

/** Compõe a cena e devolve AsciiMatrix (sem download). */
export function exportSceneCompositeMatrix(
  scene: SceneDocument,
  options: ComposeOptions = {},
): AsciiMatrix {
  return composeScene(scene, options);
}

/** Compõe → string TXT. */
export function exportSceneCompositeTxt(
  scene: SceneDocument,
  options: ComposeOptions = {},
): string {
  return matrixToAsciiSource(composeScene(scene, options));
}

/** Compõe → JSON string da matrix. */
export function exportSceneCompositeJson(
  scene: SceneDocument,
  options: ComposeOptions = {},
): string {
  return matrixToJson(composeScene(scene, options));
}

/**
 * Compõe a cena e exporta via `exportMatrix` (txt/json/html/svg/png/…).
 * Gate de export Scene W7.
 */
export async function exportSceneComposite(
  scene: SceneDocument,
  format: ExportFormatId = "txt",
  options: ExportSceneOptions = {},
): Promise<AsciiMatrix> {
  const { basename, sourceWidth, sourceHeight, ...composeOpts } = options;
  const matrix = composeScene(scene, composeOpts);
  await exportMatrix(matrix, format, { basename, sourceWidth, sourceHeight });
  return matrix;
}
