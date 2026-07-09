import { describe, expect, it } from "vitest";

import {
  BUILTIN_NODE_DEFINITIONS,
  NodeGraphRunner,
  createNodeGraphRunner,
  validateNodeGraph,
  type ImageBuffer,
  type NodeGraph,
} from "@/features/ascii-engine/nodes";
import { ProjectDocument } from "@/features/ascii-engine/document";
import { createAsciiEngine } from "@/features/ascii-engine/sdk/create-ascii-engine";

function makeBuffer(width: number, height: number, fill = 0.4): ImageBuffer {
  const n = width * height;
  const luminance = new Float32Array(n);
  const r = new Uint8ClampedArray(n);
  const g = new Uint8ClampedArray(n);
  const b = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i += 1) {
    const t = (i % width) / Math.max(1, width - 1);
    const lum = Math.min(1, Math.max(0, fill + t * 0.5));
    luminance[i] = lum;
    const v = Math.round(lum * 255);
    r[i] = v;
    g[i] = v;
    b[i] = v;
  }
  return { width, height, luminance, r, g, b };
}

describe("builtin nodes catalog", () => {
  it("registers at least 12 built-in nodes", () => {
    expect(BUILTIN_NODE_DEFINITIONS.length).toBeGreaterThanOrEqual(12);
    const types = BUILTIN_NODE_DEFINITIONS.map((d) => d.type);
    for (const required of [
      "ImageSource",
      "Brightness",
      "CharsetMap",
      "Export",
      "Resize",
      "Contrast",
      "Gamma",
      "Blur",
      "Dither",
      "Invert",
      "Threshold",
      "ColorMode",
    ]) {
      expect(types).toContain(required);
    }
  });
});

describe("NodeGraphRunner", () => {
  it("validates DAG and rejects cycles", () => {
    const cyclic: NodeGraph = {
      version: 1,
      nodes: [
        { id: "a", type: "Brightness" },
        { id: "b", type: "Contrast" },
      ],
      edges: [
        { id: "e1", from: "a", fromPort: "image", to: "b", toPort: "image" },
        { id: "e2", from: "b", fromPort: "image", to: "a", toPort: "image" },
      ],
    };
    const result = validateNodeGraph(cyclic);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "cycle")).toBe(true);
  });

  it("executes source→brightness→charset→export to AsciiMatrix + Blob", async () => {
    const graph: NodeGraph = {
      version: 1,
      nodes: [
        { id: "src", type: "ImageSource" },
        { id: "br", type: "Brightness", params: { amount: 0.25 } },
        {
          id: "cs",
          type: "CharsetMap",
          params: { charset: " .:-=+*#%@", colorMode: "mono", dithering: "none" },
        },
        { id: "ex", type: "Export", params: { format: "txt" } },
      ],
      edges: [
        { id: "e1", from: "src", fromPort: "image", to: "br", toPort: "image" },
        { id: "e2", from: "br", fromPort: "image", to: "cs", toPort: "image" },
        { id: "e3", from: "cs", fromPort: "matrix", to: "ex", toPort: "matrix" },
      ],
    };

    const runner = createNodeGraphRunner();
    const buffer = makeBuffer(16, 8, 0.3);
    const result = await runner.execute(graph, {
      bindings: { src: { image: buffer } },
    });

    const matrix = result.outputs.ex?.matrix;
    const blob = result.outputs.ex?.blob;

    expect(matrix).toBeDefined();
    expect(matrix && "cells" in matrix).toBe(true);
    if (matrix && "cols" in matrix) {
      expect(matrix.cols).toBe(16);
      expect(matrix.rows).toBe(8);
      expect(matrix.cells.length).toBeGreaterThan(0);
    }

    expect(blob).toBeInstanceOf(Blob);
    if (blob instanceof Blob) {
      const text = await new Response(blob).text();
      expect(text.length).toBeGreaterThan(0);
      expect(text.includes("\n") || text.length >= 8).toBe(true);
    }

    // memo hit on second run
    const again = await runner.execute(graph, {
      bindings: { src: { image: buffer } },
    });
    expect(again.cacheHits).toBeGreaterThan(0);
  });

  it("round-trips NodeGraph via ProjectDocument", () => {
    const graph: NodeGraph = {
      version: 1,
      nodes: [{ id: "src", type: "ImageSource" }],
      edges: [],
    };
    const doc = ProjectDocument.create({ name: "nodes-p6" });
    doc.setNodeGraph(graph);
    const json = doc.toJSON();
    expect(json.nodeGraph?.nodes).toHaveLength(1);
    const restored = ProjectDocument.fromJSON(json);
    expect(restored.getNodeGraph()?.nodes[0]?.type).toBe("ImageSource");
  });
});

describe("createAsciiEngine().nodes", () => {
  it("exposes NodeGraphRunner instead of null", () => {
    const engine = createAsciiEngine();
    expect(engine.nodes).toBeInstanceOf(NodeGraphRunner);
    expect(engine.nodes.listDefinitions().length).toBeGreaterThanOrEqual(12);
  });
});
