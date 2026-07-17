import { describe, expect, it } from "vitest";

import { applyDithering } from "@/features/ascii-interaction/image-pipeline/dithering";

describe("applyDithering", () => {
  it("does not double-decrement levels (charset length 10 → valid range)", () => {
    const w = 8;
    const h = 1;
    const lum = new Float32Array(w);
    for (let i = 0; i < w; i += 1) lum[i] = i / (w - 1);
    const out = applyDithering(lum, w, h, "none", 10);
    const dithered = applyDithering(new Float32Array(lum), w, h, "floyd-steinberg", 10);
    expect(Math.max(...dithered)).toBeLessThanOrEqual(1);
    expect(Math.min(...dithered)).toBeGreaterThanOrEqual(0);
    expect(out).toBe(lum);
    const steps = new Set([...dithered].map((v) => Math.round(v * 9)));
    expect(steps.size).toBeGreaterThanOrEqual(2);
  });

  it("Atkinson differs from Sierra on the same field (divisor/pattern)", () => {
    const w = 12;
    const h = 8;
    const seed = new Float32Array(w * h);
    for (let i = 0; i < seed.length; i += 1) seed[i] = (i % 11) / 10;
    const atkinson = applyDithering(new Float32Array(seed), w, h, "atkinson", 8);
    const sierra = applyDithering(new Float32Array(seed), w, h, "sierra", 8);
    let diff = 0;
    for (let i = 0; i < atkinson.length; i += 1) {
      diff += Math.abs(atkinson[i]! - sierra[i]!);
    }
    expect(diff).toBeGreaterThan(0.1);
  });

  it("Sierra preserves energy on mid-gray interior pixel", () => {
    const w = 7;
    const h = 4;
    const lum = new Float32Array(w * h);
    lum[w + 3] = 0.5;
    const out = applyDithering(lum, w, h, "sierra", 8);
    const sum = [...out].reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0.2);
    expect(Math.max(...out)).toBeLessThanOrEqual(1);
  });

  it("Jarvis (÷48) and Stucki (÷42) diverge on mid-gray field", () => {
    const w = 10;
    const h = 6;
    const seed = new Float32Array(w * h);
    for (let i = 0; i < seed.length; i += 1) seed[i] = 0.37 + (i % 5) * 0.05;
    const jarvis = applyDithering(new Float32Array(seed), w, h, "jarvis", 3);
    const stucki = applyDithering(new Float32Array(seed), w, h, "stucki", 3);
    let diff = 0;
    for (let i = 0; i < jarvis.length; i += 1) {
      diff += Math.abs(jarvis[i]! - stucki[i]!);
    }
    expect(diff).toBeGreaterThan(0.01);
  });
});
