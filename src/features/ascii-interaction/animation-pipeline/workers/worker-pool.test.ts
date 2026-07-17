import { describe, expect, it } from "vitest";

import {
  ConversionWorkerPool,
  partitionBatch,
} from "@/features/ascii-interaction/animation-pipeline/workers/worker-pool";

describe("partitionBatch", () => {
  it("splits items round-robin across N parts", () => {
    const items = [0, 1, 2, 3, 4, 5, 6];
    const parts = partitionBatch(items, 3);
    expect(parts).toHaveLength(3);
    expect(parts[0]).toEqual([0, 3, 6]);
    expect(parts[1]).toEqual([1, 4]);
    expect(parts[2]).toEqual([2, 5]);
  });

  it("caps parts to item count", () => {
    expect(partitionBatch([1, 2], 8)).toHaveLength(2);
  });

  it("returns empty for empty input", () => {
    expect(partitionBatch([], 4)).toEqual([]);
  });
});

describe("ConversionWorkerPool size", () => {
  it("defaults to min(4, hardwareConcurrency)", () => {
    const pool = new ConversionWorkerPool();
    const hw =
      typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : 4;
    expect(pool.size).toBe(Math.min(4, hw));
    pool.destroy();
  });

  it("respects configurable poolSize capped by hardwareConcurrency", () => {
    const pool = new ConversionWorkerPool({ poolSize: 2 });
    expect(pool.size).toBe(2);
    pool.destroy();
  });

  it("never goes below 1", () => {
    const pool = new ConversionWorkerPool({ poolSize: 0 });
    expect(pool.size).toBe(1);
    pool.destroy();
  });
});
