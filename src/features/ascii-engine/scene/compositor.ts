import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";
import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import { emptyMatrix } from "@/features/ascii-engine/scene/scene-document";
import type {
  EffectRef,
  SceneObject,
  ShapeObjectData,
  TextObjectData,
} from "@/features/ascii-engine/scene/types";

export interface ComposeOptions {
  /** Override canvas size; default scene width/height. */
  width?: number;
  height?: number;
  charset?: string;
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function applyOpacitySim(
  cell: AsciiMatrixCell,
  opacity: number,
  charset: string,
): AsciiMatrixCell {
  if (opacity >= 0.99) return cell;
  if (opacity <= 0.01) return { ...cell, char: " ", luminance: 0 };
  const density = Math.max(0, Math.min(1, cell.luminance * opacity));
  const idx = Math.min(charset.length - 1, Math.floor(density * (charset.length - 1)));
  const char = cell.char === " " ? " " : charset[Math.max(1, idx)] ?? cell.char;
  return {
    ...cell,
    char,
    luminance: density,
    r: Math.round(cell.r * opacity),
    g: Math.round(cell.g * opacity),
    b: Math.round(cell.b * opacity),
  };
}

function applyEffects(cell: AsciiMatrixCell, effects: EffectRef[]): AsciiMatrixCell {
  let out = { ...cell };
  for (const fx of effects) {
    if (!fx.enabled) continue;
    switch (fx.kind) {
      case "invert":
        out = {
          ...out,
          luminance: 1 - out.luminance,
          r: 255 - out.r,
          g: 255 - out.g,
          b: 255 - out.b,
        };
        break;
      case "colorize": {
        const r = Number(fx.params.r ?? 0);
        const g = Number(fx.params.g ?? 255);
        const b = Number(fx.params.b ?? 0);
        out = { ...out, r, g, b };
        break;
      }
      case "noise": {
        const amt = Number(fx.params.amount ?? 0.1);
        const n = (Math.random() * 2 - 1) * amt;
        out = {
          ...out,
          luminance: Math.max(0, Math.min(1, out.luminance + n)),
        };
        break;
      }
      case "outline":
      case "glow":
      case "shadow":
      case "crt":
      case "scanline":
      case "posterize":
        // Applied at buffer level in post-pass when needed; per-cell noop for now.
        break;
      default:
        break;
    }
  }
  return out;
}

function rasterizeText(data: TextObjectData, bounds: { w: number; h: number }): AsciiMatrix {
  const matrix = emptyMatrix(bounds.w, bounds.h);
  const lines = data.text.split("\n");
  const map = new Map(matrix.cells.map((c) => [cellKey(c.col, c.row), c]));
  for (let row = 0; row < lines.length && row < bounds.h; row++) {
    let line = lines[row] ?? "";
    if (data.align === "center") {
      const pad = Math.max(0, Math.floor((bounds.w - line.length) / 2));
      line = " ".repeat(pad) + line;
    } else if (data.align === "right") {
      const pad = Math.max(0, bounds.w - line.length);
      line = " ".repeat(pad) + line;
    }
    for (let col = 0; col < Math.min(line.length, bounds.w); col++) {
      const ch = line[col]!;
      if (ch === " ") continue;
      const cell = map.get(cellKey(col, row));
      if (!cell) continue;
      cell.char = ch;
      cell.luminance = 1;
      if (data.color) {
        cell.r = data.color.r;
        cell.g = data.color.g;
        cell.b = data.color.b;
      } else {
        cell.r = 0;
        cell.g = 255;
        cell.b = 0;
      }
    }
  }
  return matrix;
}

function rasterizeShape(data: ShapeObjectData, bounds: { w: number; h: number }): AsciiMatrix {
  const matrix = emptyMatrix(bounds.w, bounds.h);
  const map = new Map(matrix.cells.map((c) => [cellKey(c.col, c.row), c]));
  const set = (col: number, row: number) => {
    if (col < 0 || row < 0 || col >= bounds.w || row >= bounds.h) return;
    const cell = map.get(cellKey(col, row));
    if (!cell) return;
    cell.char = data.char || "#";
    cell.luminance = 1;
    if (data.color) {
      cell.r = data.color.r;
      cell.g = data.color.g;
      cell.b = data.color.b;
    } else {
      cell.r = 0;
      cell.g = 220;
      cell.b = 80;
    }
  };

  const w = bounds.w;
  const h = bounds.h;
  switch (data.shape) {
    case "rect":
    case "round-rect":
      for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
          const edge = row === 0 || col === 0 || row === h - 1 || col === w - 1;
          if (data.fill || edge) set(col, row);
        }
      }
      break;
    case "line":
    case "arrow": {
      const x1 = 0;
      const y1 = 0;
      const x2 = w - 1;
      const y2 = h - 1;
      const steps = Math.max(w, h, 1);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        set(Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t));
      }
      if (data.shape === "arrow") {
        set(w - 1, h - 1);
        set(w - 2, h - 1);
        set(w - 1, h - 2);
      }
      break;
    }
    case "circle":
    case "ellipse": {
      const cx = (w - 1) / 2;
      const cy = (h - 1) / 2;
      const rx = Math.max(0.5, w / 2);
      const ry = Math.max(0.5, h / 2);
      for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
          const nx = (col - cx) / rx;
          const ny = (row - cy) / ry;
          const d = nx * nx + ny * ny;
          if (data.fill ? d <= 1 : d <= 1 && d >= 0.7) set(col, row);
        }
      }
      break;
    }
    case "polygon": {
      const pts = data.points?.length
        ? data.points
        : [
            { x: w / 2, y: 0 },
            { x: w - 1, y: h - 1 },
            { x: 0, y: h - 1 },
          ];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!;
        const b = pts[(i + 1) % pts.length]!;
        const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y), 1);
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          set(Math.round(a.x + (b.x - a.x) * t), Math.round(a.y + (b.y - a.y) * t));
        }
      }
      break;
    }
    default:
      break;
  }
  return matrix;
}

function rasterizeObject(obj: SceneObject): AsciiMatrix | null {
  if (!obj.visible) return null;
  switch (obj.type) {
    case "image":
      return structuredClone(obj.payload.matrix);
    case "text":
      return rasterizeText(obj.payload, obj.bounds);
    case "shape":
      return rasterizeShape(obj.payload, obj.bounds);
    case "stroke":
      return obj.payload.baked ? structuredClone(obj.payload.baked) : null;
    case "group":
    case "reference":
      return null;
    default:
      return null;
  }
}

function blit(
  target: Map<string, AsciiMatrixCell>,
  src: AsciiMatrix,
  ox: number,
  oy: number,
  opacity: number,
  effects: EffectRef[],
  charset: string,
  canvasW: number,
  canvasH: number,
): void {
  for (const cell of src.cells) {
    if (cell.char === " " && cell.luminance < 0.05) continue;
    const col = Math.round(ox + cell.col);
    const row = Math.round(oy + cell.row);
    if (col < 0 || row < 0 || col >= canvasW || row >= canvasH) continue;
    let next = applyOpacitySim(cell, opacity, charset);
    next = applyEffects(next, effects);
    next = { ...next, col, row };
    const key = cellKey(col, row);
    const prev = target.get(key);
    if (!prev || next.luminance >= prev.luminance) {
      target.set(key, next);
    }
  }
}

/**
 * Flatten scene → AsciiMatrix. Deterministic (exceto effect noise).
 */
export function composeScene(scene: SceneDocument, options: ComposeOptions = {}): AsciiMatrix {
  const width = options.width ?? scene.getWidth();
  const height = options.height ?? scene.getHeight();
  const charset = options.charset ?? " .:-=+*#%@";
  const buffer = new Map<string, AsciiMatrixCell>();

  for (const layer of scene.getLayers()) {
    if (!layer.visible) continue;
    const layerOpacity = layer.opacity;
    for (const oid of layer.objectIds) {
      const obj = scene.getObject(oid);
      if (!obj || !obj.visible) continue;
      const raster = rasterizeObject(obj);
      if (!raster) continue;
      const ox = obj.transform.x;
      const oy = obj.transform.y;
      blit(
        buffer,
        raster,
        ox,
        oy,
        Math.max(0, Math.min(1, obj.opacity * layerOpacity)),
        obj.effects,
        charset,
        width,
        height,
      );
    }
  }

  const cells: AsciiMatrixCell[] = [];
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const existing = buffer.get(cellKey(col, row));
      cells.push(
        existing ?? {
          char: " ",
          col,
          row,
          luminance: 0,
          r: 0,
          g: 0,
          b: 0,
        },
      );
    }
  }

  return { cols: width, rows: height, charset, cells };
}

/** Simple cache wrapper keyed by scene revision. */
export class SceneCompositorCache {
  private revision = -1;
  private matrix: AsciiMatrix | null = null;

  compose(scene: SceneDocument, options?: ComposeOptions): AsciiMatrix {
    const rev = scene.getRevision();
    if (this.matrix && rev === this.revision) return this.matrix;
    this.matrix = composeScene(scene, options);
    this.revision = rev;
    return this.matrix;
  }

  invalidate(): void {
    this.revision = -1;
    this.matrix = null;
  }
}
