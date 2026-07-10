/**
 * Text tool helpers.
 *
 * fontMode:
 * - `plain` (ready): rasteriza caracteres 1:1 no compositor
 * - `figlet-stub` (experimental): schema preparado; renderer FIGlet ainda não ligado.
 *   Quando integrar, trocar `renderTextPayload` / compositor para expandir glyphs FIGlet
 *   e actualizar bounds antes do compose.
 */

import type { TextObjectData } from "@/features/ascii-engine/scene/types";
import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";

export interface TextCreateOptions {
  name?: string;
  x?: number;
  y?: number;
  layerId?: string;
  align?: TextObjectData["align"];
  lineHeight?: number;
  color?: { r: number; g: number; b: number };
  charset?: string;
  /** Default `plain`. Use `figlet-stub` só para marcar intent futuro. */
  fontMode?: TextObjectData["fontMode"];
}

export function measurePlainText(text: string): { w: number; h: number } {
  const lines = text.split("\n");
  return {
    w: Math.max(1, ...lines.map((l) => l.length)),
    h: Math.max(1, lines.length),
  };
}

export function createTextPayload(text: string, options: TextCreateOptions = {}): TextObjectData {
  return {
    text,
    align: options.align ?? "left",
    lineHeight: options.lineHeight ?? 1,
    fontMode: options.fontMode ?? "plain",
    color: options.color,
    charset: options.charset,
  };
}

/**
 * Adiciona TextObject. Com `fontMode: "figlet-stub"` o compositor ainda trata como plain
 * (ver nota no topo do ficheiro).
 */
export function addTextToScene(
  scene: SceneDocument,
  text: string,
  options: TextCreateOptions = {},
): string {
  const id = scene.addTextObject(text, {
    name: options.name ?? "Text",
    x: options.x,
    y: options.y,
    layerId: options.layerId,
  });
  if (
    options.align ||
    options.lineHeight ||
    options.color ||
    options.charset ||
    options.fontMode
  ) {
    const payload = createTextPayload(text, options);
    scene.replaceObjectPayload(id, "text", payload);
    if (options.fontMode === "figlet-stub") {
      // Bounds permanecem plain até FIGlet real; documentado como stub.
      const m = measurePlainText(text);
      scene.updateObject(id, { bounds: m });
    }
  }
  return id;
}

/** Documentação runtime para UI / docs. */
export const TEXT_FONT_MODES = {
  plain: {
    status: "ready" as const,
    description: "Caracteres 1 célula; multilinha e align left/center/right.",
  },
  "figlet-stub": {
    status: "experimental" as const,
    description:
      "Schema preparado (fontMode). Renderer FIGlet não implementado — compose usa plain.",
  },
} as const;
