import { describe, expect, it } from "vitest";

import { ProjectDocument } from "@/features/ascii-engine/document";
import {
  SceneDocument,
  composeScene,
  emptyMatrix,
  SceneHistory,
  runWithHistory,
} from "@/features/ascii-engine/scene";

function sampleMatrix() {
  const m = emptyMatrix(4, 2);
  m.cells[0]!.char = "#";
  m.cells[0]!.luminance = 1;
  m.cells[0]!.g = 255;
  return m;
}

describe("SceneDocument + compositor", () => {
  it("adds image object and composes into scene bounds", () => {
    const scene = SceneDocument.create(10, 8);
    const id = scene.addImageObject(sampleMatrix(), { x: 2, y: 1, name: "Art" });
    expect(id).toBeTruthy();
    const composed = composeScene(scene);
    expect(composed.cols).toBe(10);
    expect(composed.rows).toBe(8);
    const cell = composed.cells.find((c) => c.col === 2 && c.row === 1);
    expect(cell?.char).toBe("#");
  });

  it("undo restores scene via SceneHistory", () => {
    const scene = SceneDocument.create(8, 8);
    const history = new SceneHistory();
    runWithHistory(history, scene, "add", () => {
      scene.addImageObject(sampleMatrix(), { x: 0, y: 0 });
    });
    expect(Object.keys(scene.toJSON().objects)).toHaveLength(1);
    expect(history.undo()).toBe(true);
    expect(Object.keys(scene.toJSON().objects)).toHaveLength(0);
    expect(history.redo()).toBe(true);
    expect(Object.keys(scene.toJSON().objects)).toHaveLength(1);
  });

  it("ProjectDocument round-trips scene in JSON", () => {
    const doc = ProjectDocument.create({ name: "SceneProj" });
    doc.scene.addImageObject(sampleMatrix(), { x: 1, y: 1 });
    const json = doc.toJSON();
    expect(json.scene?.objects).toBeTruthy();
    const restored = ProjectDocument.fromJSON(json);
    expect(Object.keys(restored.scene.toJSON().objects)).toHaveLength(1);
    const composed = composeScene(restored.scene);
    expect(composed.cells.some((c) => c.char === "#")).toBe(true);
  });
});
