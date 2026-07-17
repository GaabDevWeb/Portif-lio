import type { AsciiAnimationFrame } from "@/features/ascii-interaction/animation-pipeline/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

/** Cache LRU de frames ASCII convertidos. */
export class FrameCache {
  private readonly map = new Map<string, AsciiAnimationFrame>();
  private readonly order: string[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 64) {
    this.maxSize = Math.max(8, maxSize);
  }

  private key(frameIndex: number, optionsHash: string): string {
    return `${optionsHash}:${frameIndex}`;
  }

  get(frameIndex: number, optionsHash: string): AsciiAnimationFrame | undefined {
    const k = this.key(frameIndex, optionsHash);
    const hit = this.map.get(k);
    if (!hit) return undefined;
    const idx = this.order.indexOf(k);
    if (idx >= 0) {
      this.order.splice(idx, 1);
      this.order.push(k);
    }
    return hit;
  }

  set(frameIndex: number, optionsHash: string, frame: AsciiAnimationFrame): void {
    const k = this.key(frameIndex, optionsHash);
    if (this.map.has(k)) {
      this.map.set(k, frame);
      return;
    }
    while (this.order.length >= this.maxSize) {
      const oldest = this.order.shift();
      if (oldest) this.map.delete(oldest);
    }
    this.order.push(k);
    this.map.set(k, frame);
  }

  has(frameIndex: number, optionsHash: string): boolean {
    return this.map.has(this.key(frameIndex, optionsHash));
  }

  getMatrix(frameIndex: number, optionsHash: string): AsciiMatrix | undefined {
    return this.get(frameIndex, optionsHash)?.matrix;
  }

  clear(): void {
    this.map.clear();
    this.order.length = 0;
  }

  get size(): number {
    return this.map.size;
  }

  /** Mantém apenas janela virtualizada em torno do frame atual. */
  pruneAround(currentFrame: number, radius: number, optionsHash: string): void {
    const keep = new Set<string>();
    for (let i = Math.max(0, currentFrame - radius); i <= currentFrame + radius; i += 1) {
      keep.add(this.key(i, optionsHash));
    }
    for (const k of [...this.order]) {
      if (!keep.has(k)) {
        this.map.delete(k);
        const idx = this.order.indexOf(k);
        if (idx >= 0) this.order.splice(idx, 1);
      }
    }
  }
}

export function hashPipelineOptions(options: unknown): string {
  return JSON.stringify(options);
}
