import { describe, expect, it } from "vitest";

import {
  addKeyframe,
  blendMatrices,
  createEmptyTimeline,
  createTrack,
  getOnionSkinLayers,
  removeKeyframe,
  sampleTrack,
  updateKeyframe,
} from "@/features/ascii-engine/animator";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import { ProjectDocument } from "@/features/ascii-engine/document";

function cell(
  col: number,
  row: number,
  luminance: number,
  char: string,
): AsciiMatrix["cells"][number] {
  return { col, row, luminance, char, r: 0, g: Math.round(luminance * 255), b: 0 };
}

function matrix(luminances: number[], charset = " .:#@"): AsciiMatrix {
  const cols = luminances.length;
  return {
    cols,
    rows: 1,
    charset,
    cells: luminances.map((l, i) => cell(i, 0, l, charset[Math.round(l * (charset.length - 1))]!)),
  };
}

describe("sampleTrack", () => {
  it("interpolates linearly at mid-point", () => {
    const track = createTrack("opacity", "opacity", [
      { frame: 0, value: 0, interpolation: "linear" },
      { frame: 10, value: 1, interpolation: "linear" },
    ]);
    expect(sampleTrack(5, track)).toBeCloseTo(0.5, 6);
    expect(sampleTrack(2.5, track)).toBeCloseTo(0.25, 6);
  });

  it("holds value until next key in hold mode", () => {
    const track = createTrack("opacity", "opacity", [
      { frame: 0, value: 0.2, interpolation: "hold" },
      { frame: 10, value: 1, interpolation: "linear" },
    ]);
    expect(sampleTrack(0, track)).toBeCloseTo(0.2, 6);
    expect(sampleTrack(5, track)).toBeCloseTo(0.2, 6);
    expect(sampleTrack(9.9, track)).toBeCloseTo(0.2, 6);
    expect(sampleTrack(10, track)).toBeCloseTo(1, 6);
  });
});

describe("keyframe ops", () => {
  it("add/remove/update immutably", () => {
    const track = createTrack("ox", "offsetX", [
      { frame: 0, value: 0, interpolation: "linear" },
    ]);
    const added = addKeyframe(track, { frame: 4, value: 8, interpolation: "linear" });
    expect(added).not.toBe(track);
    expect(added.keys).toHaveLength(2);
    expect(track.keys).toHaveLength(1);

    const updated = updateKeyframe(added, 4, { value: 12 });
    expect(updated.keys.find((k) => k.frame === 4)?.value).toBe(12);

    const removed = removeKeyframe(updated, 0);
    expect(removed.keys).toHaveLength(1);
    expect(removed.keys[0]?.frame).toBe(4);
  });
});

describe("10-frame demo sample", () => {
  it("samples opacity + density across 10 frames", () => {
    const timeline = createEmptyTimeline(10, { fps: 10, loop: true });
    const opacity = createTrack("opacity", "opacity", [
      { frame: 0, value: 0, interpolation: "linear" },
      { frame: 9, value: 1, interpolation: "linear" },
    ]);
    const density = createTrack("density", "charsetDensity", [
      { frame: 0, value: 0.2, interpolation: "linear" },
      { frame: 9, value: 1, interpolation: "hold" },
    ]);
    timeline.tracks = [opacity, density];

    const samples = Array.from({ length: 10 }, (_, f) => ({
      frame: f,
      opacity: sampleTrack(f, opacity),
      density: sampleTrack(f, density),
    }));

    expect(samples[0]?.opacity).toBeCloseTo(0, 6);
    expect(samples[9]?.opacity).toBeCloseTo(1, 6);
    expect(samples[4]?.opacity).toBeCloseTo(4 / 9, 5);
    expect(samples[0]?.density).toBeCloseTo(0.2, 6);
    expect(samples[9]?.density).toBeCloseTo(1, 6);

    const doc = ProjectDocument.create({ name: "P4-demo" });
    doc.setTimeline(timeline);
    const round = ProjectDocument.fromJSON(doc.toJSON());
    expect(round.getTimeline()?.tracks).toHaveLength(2);
    expect(round.getTimeline()?.frameCount).toBe(10);
  });
});

describe("blendMatrices", () => {
  it("lerps luminance and picks nearest char", () => {
    const a = matrix([0, 0]);
    const b = matrix([1, 1]);
    const mid = blendMatrices(a, b, 0.5, " .#");
    expect(mid.cells[0]?.luminance).toBeCloseTo(0.5, 6);
    expect(mid.cells[0]?.char).toBe(".");
  });
});

describe("onion skin", () => {
  it("returns prev/next layers with weights", () => {
    const frames = Array.from({ length: 3 }, (_, i) => ({
      index: i,
      delayMs: 66,
      source: "",
      matrix: matrix([i / 2]),
    }));
    const animation: AsciiAnimation = {
      frames,
      frameDelays: [66, 66, 66],
      frameCount: 3,
      fps: 15,
      loop: true,
      totalDurationMs: 198,
      width: 1,
      height: 1,
      pipelineOptions: {} as AsciiAnimation["pipelineOptions"],
      sourceName: "onion-test",
    };

    const off = getOnionSkinLayers(animation, 1, { enabled: false });
    expect(off.layers).toHaveLength(0);

    const on = getOnionSkinLayers(animation, 1, {
      enabled: true,
      prevOpacity: 0.4,
      nextOpacity: 0.3,
    });
    expect(on.layers).toHaveLength(2);
    expect(on.layers[0]?.direction).toBe(-1);
    expect(on.layers[0]?.opacity).toBe(0.4);
    expect(on.layers[1]?.direction).toBe(1);
    expect(on.layers[1]?.opacity).toBe(0.3);
  });
});
