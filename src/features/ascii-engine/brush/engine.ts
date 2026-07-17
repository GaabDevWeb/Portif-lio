import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";
import type { BrushPreset, StampCell, StampOptions } from "@/features/ascii-engine/brush/types";
import { getBrushPreset } from "@/features/ascii-engine/brush/presets";

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickChar(preset: BrushPreset, luminance: number, rand: () => number): string {
  const cs = preset.charset.length > 0 ? preset.charset : "#";
  switch (preset.charsetMode) {
    case "fixed":
      return cs[0] ?? "#";
    case "random":
      return cs[Math.floor(rand() * cs.length)] ?? "#";
    case "gradient":
    case "density": {
      const idx = Math.min(cs.length - 1, Math.floor(luminance * (cs.length - 1)));
      return cs[Math.max(0, idx)] ?? "#";
    }
    default:
      return cs[0] ?? "#";
  }
}

function pickColor(preset: BrushPreset, rand: () => number): { r: number; g: number; b: number } {
  const colors = preset.colors.length > 0 ? preset.colors : [{ r: 0, g: 255, b: 100 }];
  if (colors.length === 1) return { ...colors[0]! };
  const i = Math.floor(rand() * colors.length);
  return { ...colors[i]! };
}

/**
 * BrushEngine — stamps cells into a buffer from a serializable BrushPreset.
 * Deterministic when seed is provided.
 */
export class BrushEngine {
  private preset: BrushPreset;

  constructor(preset?: BrushPreset) {
    this.preset = preset ?? getBrushPreset("brush")!;
  }

  getPreset(): BrushPreset {
    return structuredClone(this.preset);
  }

  setPreset(preset: BrushPreset): void {
    this.preset = structuredClone(preset);
  }

  setPresetById(id: string): boolean {
    const p = getBrushPreset(id);
    if (!p) return false;
    this.preset = structuredClone(p);
    return true;
  }

  /**
   * Compute stamp cells around (col, row) without mutating a matrix.
   */
  stampCells(options: StampOptions): StampCell[] {
    const preset = this.preset;
    const pressure = options.pressure ?? 1;
    const rand = mulberry32(options.seed ?? (options.col * 73856093) ^ (options.row * 19349663));
    const radius = Math.max(0.5, (preset.size / 2) * (0.5 + 0.5 * pressure));
    const cells: StampCell[] = [];
    const rCeil = Math.ceil(radius + preset.scatter * radius);

    for (let dy = -rCeil; dy <= rCeil; dy++) {
      for (let dx = -rCeil; dx <= rCeil; dx++) {
        const dist = Math.hypot(dx, dy);
        const scatterJitter = preset.scatter > 0 ? (rand() - 0.5) * preset.scatter * radius : 0;
        const effective = dist + scatterJitter;
        if (effective > radius) continue;

        const edge = radius <= 0 ? 1 : 1 - effective / radius;
        const soft = Math.pow(Math.max(0, edge), 1 + (1 - preset.hardness) * 2);
        const chance = preset.density * soft * preset.flow * pressure;
        if (rand() > chance) continue;

        let lum = soft * preset.opacitySim;
        if (preset.randomization > 0) {
          lum = Math.max(0, Math.min(1, lum + (rand() - 0.5) * preset.randomization));
        }

        const color = pickColor(preset, rand);
        const char = pickChar(preset, lum, rand);
        if (char === " " && lum < 0.05) continue;

        cells.push({
          col: options.col + dx,
          row: options.row + dy,
          char,
          luminance: lum,
          r: color.r,
          g: color.g,
          b: color.b,
        });
      }
    }

    // Pencil / size 1 always paints center.
    if (cells.length === 0 && preset.size <= 1) {
      const color = pickColor(preset, rand);
      cells.push({
        col: options.col,
        row: options.row,
        char: pickChar(preset, 1, rand),
        luminance: preset.opacitySim,
        r: color.r,
        g: color.g,
        b: color.b,
      });
    }

    return cells;
  }

  /** Apply stamp into an AsciiMatrix (in place). Cells outside bounds are skipped. */
  stampInto(matrix: AsciiMatrix, options: StampOptions): number {
    const stamped = this.stampCells(options);
    let written = 0;
    for (const s of stamped) {
      if (s.col < 0 || s.row < 0 || s.col >= matrix.cols || s.row >= matrix.rows) continue;
      const idx = s.row * matrix.cols + s.col;
      const cell = matrix.cells[idx];
      if (!cell) continue;
      matrix.cells[idx] = {
        ...cell,
        char: s.char,
        luminance: s.luminance,
        r: s.r,
        g: s.g,
        b: s.b,
        col: s.col,
        row: s.row,
      } satisfies AsciiMatrixCell;
      written += 1;
    }
    return written;
  }

  /** Erase: stamp spaces into matrix. */
  eraseInto(matrix: AsciiMatrix, col: number, row: number, size = 1): number {
    const radius = Math.max(0, Math.floor(size / 2));
    let written = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.hypot(dx, dy) > radius + 0.01 && radius > 0) continue;
        const c = col + dx;
        const r = row + dy;
        if (c < 0 || r < 0 || c >= matrix.cols || r >= matrix.rows) continue;
        const idx = r * matrix.cols + c;
        const cell = matrix.cells[idx];
        if (!cell) continue;
        matrix.cells[idx] = { ...cell, char: " ", luminance: 0, r: 0, g: 0, b: 0 };
        written += 1;
      }
    }
    return written;
  }
}
