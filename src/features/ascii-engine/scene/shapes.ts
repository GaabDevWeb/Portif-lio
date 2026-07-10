/**
 * Shape tool helpers — criam ShapeObjectData + bounds prontos para SceneDocument.addShapeObject.
 * Rasterização real vive no compositor (`rasterizeShape`).
 */

import type { ShapeKind, ShapeObjectData } from "@/features/ascii-engine/scene/types";
import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";

export interface ShapeCreateOptions {
  name?: string;
  x?: number;
  y?: number;
  layerId?: string;
  char?: string;
  fill?: boolean;
  strokeWidth?: number;
  color?: { r: number; g: number; b: number };
  points?: Array<{ x: number; y: number }>;
}

export interface ShapeSpec {
  data: ShapeObjectData;
  bounds: { w: number; h: number };
}

function baseShape(
  shape: ShapeKind,
  options: ShapeCreateOptions = {},
): ShapeObjectData {
  return {
    shape,
    char: options.char ?? "#",
    fill: options.fill ?? false,
    strokeWidth: options.strokeWidth ?? 1,
    color: options.color,
    points: options.points,
  };
}

/** Specs por kind — defaults sensatos em células. */
export function createShapeSpec(
  kind: ShapeKind,
  width: number,
  height: number,
  options: ShapeCreateOptions = {},
): ShapeSpec {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  switch (kind) {
    case "line":
    case "arrow":
      return {
        data: baseShape(kind, options),
        bounds: { w: Math.max(2, w), h: Math.max(1, h) },
      };
    case "circle": {
      const d = Math.max(w, h);
      return { data: baseShape("circle", options), bounds: { w: d, h: d } };
    }
    case "ellipse":
      return { data: baseShape("ellipse", options), bounds: { w, h } };
    case "polygon": {
      const pts =
        options.points ??
        [
          { x: w / 2, y: 0 },
          { x: w - 1, y: h - 1 },
          { x: 0, y: h - 1 },
        ];
      return {
        data: baseShape("polygon", { ...options, points: pts }),
        bounds: { w, h },
      };
    }
    case "round-rect":
      return { data: baseShape("round-rect", options), bounds: { w, h } };
    case "rect":
    default:
      return { data: baseShape("rect", options), bounds: { w, h } };
  }
}

/** Atalhos tipados. */
export const ShapeBuilders = {
  line: (w: number, h: number, o?: ShapeCreateOptions) => createShapeSpec("line", w, h, o),
  rect: (w: number, h: number, o?: ShapeCreateOptions) => createShapeSpec("rect", w, h, o),
  roundRect: (w: number, h: number, o?: ShapeCreateOptions) =>
    createShapeSpec("round-rect", w, h, o),
  circle: (d: number, o?: ShapeCreateOptions) => createShapeSpec("circle", d, d, o),
  ellipse: (w: number, h: number, o?: ShapeCreateOptions) =>
    createShapeSpec("ellipse", w, h, o),
  polygon: (w: number, h: number, o?: ShapeCreateOptions) =>
    createShapeSpec("polygon", w, h, o),
  arrow: (w: number, h: number, o?: ShapeCreateOptions) => createShapeSpec("arrow", w, h, o),
} as const;

/** Insere shape na cena via SceneDocument.addShapeObject. */
export function addShapeToScene(
  scene: SceneDocument,
  kind: ShapeKind,
  width: number,
  height: number,
  options: ShapeCreateOptions = {},
): string {
  const spec = createShapeSpec(kind, width, height, options);
  return scene.addShapeObject(spec.data, spec.bounds, {
    name: options.name ?? kind,
    x: options.x,
    y: options.y,
    layerId: options.layerId,
  });
}
