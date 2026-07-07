import {
  charForGlyphIndex,
  glyphIndexForChar,
  parseAsciiSource,
} from "@/features/ascii-interaction/grid/ascii-source";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

/** Grade de caracteres com estado contíguo em typed arrays (zero GC por frame). */
export class CharacterGrid {
  readonly count: number;
  readonly cols: number;
  readonly rows: number;
  readonly characterSet: string;

  readonly originX: Float32Array;
  readonly originY: Float32Array;
  readonly offsetX: Float32Array;
  readonly offsetY: Float32Array;
  readonly velX: Float32Array;
  readonly velY: Float32Array;
  readonly accelX: Float32Array;
  readonly accelY: Float32Array;
  readonly intensity: Float32Array;
  readonly baseIntensity: Float32Array;
  readonly energy: Float32Array;
  readonly peakEnergy: Float32Array;
  readonly restorationMs: Float32Array;
  readonly trailEnergy: Float32Array;
  readonly age: Float32Array;
  readonly alpha: Float32Array;
  readonly baseAlpha: Float32Array;
  readonly layer: Uint8Array;
  readonly glyphIndex: Uint16Array;
  readonly baseGlyphIndex: Uint16Array;
  readonly gridCol: Uint16Array;
  readonly gridRow: Uint16Array;
  readonly dirty: Uint8Array;
  /** Máscara reutilizada para deduplicar active set (zero GC). */
  readonly activeMask: Uint8Array;

  /** Pool reutilizado de índices ativos (sem alocação por frame). */
  readonly activeIndices: Uint32Array;
  activeCount = 0;

  /** Pool de índices sujos para render parcial. */
  readonly dirtyIndices: Uint32Array;
  dirtyCount = 0;

  readonly layoutOffsetX: number;
  readonly layoutOffsetY: number;
  readonly layoutWidth: number;
  readonly layoutHeight: number;
  readonly cellWidth: number;
  readonly cellHeight: number;

  constructor(source: string, config: AsciiInteractionConfig) {
    this.characterSet = config.characterSet;
    const parsed = parseAsciiSource(source, config.layerCount);

    if (parsed.cells.length > config.maxCharacters) {
      throw new Error(
        `ASCII source exceeds maxCharacters (${parsed.cells.length} > ${config.maxCharacters})`,
      );
    }

    this.count = parsed.cells.length;
    this.cols = parsed.cols;
    this.rows = parsed.rows;

    const n = this.count;
    this.originX = new Float32Array(n);
    this.originY = new Float32Array(n);
    this.offsetX = new Float32Array(n);
    this.offsetY = new Float32Array(n);
    this.velX = new Float32Array(n);
    this.velY = new Float32Array(n);
    this.accelX = new Float32Array(n);
    this.accelY = new Float32Array(n);
    this.intensity = new Float32Array(n);
    this.baseIntensity = new Float32Array(n);
    this.energy = new Float32Array(n);
    this.peakEnergy = new Float32Array(n);
    this.restorationMs = new Float32Array(n);
    this.trailEnergy = new Float32Array(n);
    this.age = new Float32Array(n);
    this.alpha = new Float32Array(n);
    this.baseAlpha = new Float32Array(n);
    this.layer = new Uint8Array(n);
    this.glyphIndex = new Uint16Array(n);
    this.baseGlyphIndex = new Uint16Array(n);
    this.gridCol = new Uint16Array(n);
    this.gridRow = new Uint16Array(n);
    this.dirty = new Uint8Array(n);
    this.activeMask = new Uint8Array(n);

    this.activeIndices = new Uint32Array(Math.min(n, config.maxActiveCells));
    this.dirtyIndices = new Uint32Array(n);

    this.cellWidth = config.cellWidth;
    this.cellHeight = config.cellHeight;
    this.layoutWidth = parsed.cols * this.cellWidth;
    this.layoutHeight = parsed.rows * this.cellHeight;

    for (let i = 0; i < n; i += 1) {
      const cell = parsed.cells[i]!;
      const gx = cell.col * this.cellWidth + this.cellWidth * 0.5;
      const gy = cell.row * this.cellHeight + this.cellHeight * 0.5;

      this.originX[i] = gx;
      this.originY[i] = gy;
      this.gridCol[i] = cell.col;
      this.gridRow[i] = cell.row;
      this.layer[i] = cell.layer;
      this.intensity[i] = cell.baseDensity;
      this.baseIntensity[i] = cell.baseDensity;
      const baseAlpha = 0.35 + cell.baseDensity * 0.55;
      this.alpha[i] = baseAlpha;
      this.baseAlpha[i] = baseAlpha;
      this.energy[i] = 0;
      this.peakEnergy[i] = 0;
      this.restorationMs[i] = config.restorationMinMs;

      const baseIdx = glyphIndexForChar(cell.char, config.characterSet);
      this.baseGlyphIndex[i] = baseIdx;
      this.glyphIndex[i] = baseIdx;
      this.dirty[i] = 1;
      this.markDirty(i);
    }

    this.layoutOffsetX = 0;
    this.layoutOffsetY = 0;
  }

  /** Centraliza o layout no canvas (chamado após resize). */
  centerIn(width: number, height: number): void {
    const ox = (width - this.layoutWidth) * 0.5;
    const oy = (height - this.layoutHeight) * 0.5;

    for (let i = 0; i < this.count; i += 1) {
      const nx = ox + this.gridCol[i]! * this.cellWidth + this.cellWidth * 0.5;
      const ny = oy + this.gridRow[i]! * this.cellHeight + this.cellHeight * 0.5;
      this.originX[i] = nx;
      this.originY[i] = ny;
      this.markDirty(i);
    }
  }

  markDirty(index: number): void {
    if (this.dirty[index]) return;
    this.dirty[index] = 1;
    if (this.dirtyCount < this.dirtyIndices.length) {
      this.dirtyIndices[this.dirtyCount] = index;
      this.dirtyCount += 1;
    }
  }

  clearDirty(): void {
    this.dirtyCount = 0;
    this.dirty.fill(0);
  }

  addActive(index: number): void {
    if (this.activeCount >= this.activeIndices.length) return;
    this.activeIndices[this.activeCount] = index;
    this.activeCount += 1;
  }

  clearActive(): void {
    this.activeCount = 0;
  }

  getGlyphChar(index: number): string {
    return charForGlyphIndex(this.glyphIndex[index]!, this.characterSet);
  }

  getBaseGlyphChar(index: number): string {
    return charForGlyphIndex(this.baseGlyphIndex[index]!, this.characterSet);
  }

  /** Posição atual (origem + offset). */
  getPosX(index: number): number {
    return this.originX[index]! + this.offsetX[index]!;
  }

  getPosY(index: number): number {
    return this.originY[index]! + this.offsetY[index]!;
  }
}
