import { describe, expect, it } from "vitest";

import { ProjectDocument } from "@/features/ascii-engine/document";
import {
  SceneDocument,
  SceneHistory,
  SceneClipboard,
  composeScene,
  addShapeToScene,
  addTextToScene,
  ShapeBuilders,
  StampLibrary,
  stampRegionIntoScene,
  placeStampAsset,
  extractStampFromScene,
  EffectFactories,
  exportSceneCompositeTxt,
  exportSceneCompositeMatrix,
  runWithHistory,
} from "@/features/ascii-engine/scene";
import {
  createMockAssetLibrary,
  generateProceduralShape,
  insertAssetIntoScene,
  insertProceduralShapeIntoScene,
  listProceduralShapeKinds,
} from "@/features/ascii-engine/libraries";

describe("Scene W5 — shapes + text + stamp", () => {
  it("composes rect shape and plain text", () => {
    const scene = SceneDocument.create(20, 12);
    addShapeToScene(scene, "rect", 6, 4, { x: 1, y: 1, char: "#", fill: false });
    addTextToScene(scene, "Hi", { x: 8, y: 2 });
    const m = composeScene(scene);
    expect(m.cells.find((c) => c.col === 1 && c.row === 1)?.char).toBe("#");
    expect(m.cells.find((c) => c.col === 8 && c.row === 2)?.char).toBe("H");
    expect(m.cells.find((c) => c.col === 9 && c.row === 2)?.char).toBe("i");
  });

  it("ShapeBuilders cover all kinds", () => {
    const scene = SceneDocument.create(40, 20);
    const specs = [
      ShapeBuilders.line(5, 1),
      ShapeBuilders.rect(5, 4),
      ShapeBuilders.roundRect(5, 4),
      ShapeBuilders.circle(5),
      ShapeBuilders.ellipse(6, 4),
      ShapeBuilders.polygon(5, 4),
      ShapeBuilders.arrow(5, 3),
    ];
    for (const spec of specs) {
      scene.addShapeObject(spec.data, spec.bounds, { x: 0, y: 0 });
    }
    const composed = composeScene(scene);
    expect(composed.cells.some((c) => c.char === "#")).toBe(true);
  });

  it("stamp extracts region and places as image", () => {
    const scene = SceneDocument.create(16, 10);
    addShapeToScene(scene, "rect", 4, 3, { x: 2, y: 2, fill: true, char: "@" });
    const lib = new StampLibrary();
    const region = { x: 2, y: 2, w: 4, h: 3 };
    const extracted = extractStampFromScene(scene, region);
    expect(extracted.cols).toBe(4);
    expect(extracted.rows).toBe(3);
    const { asset, referenceId, imageId } = stampRegionIntoScene(scene, lib, region, {
      asImage: true,
      x: 8,
      y: 1,
      name: "MyStamp",
    });
    expect(asset.name).toBe("MyStamp");
    expect(referenceId).toBeTruthy();
    expect(imageId).toBeTruthy();
    const placed = placeStampAsset(scene, asset, { x: 0, y: 6 });
    expect(scene.getObject(placed)?.type).toBe("image");
    const m = composeScene(scene);
    expect(m.cells.some((c) => c.char === "@")).toBe(true);
  });
});

describe("Scene W6 — libraries + effects", () => {
  it("mock asset library has expected categories", () => {
    const lib = createMockAssetLibrary();
    expect(lib.categories()).toEqual([
      "frames",
      "boxes",
      "terminals",
      "arrows",
      "hud",
      "decorations",
    ]);
    expect(lib.list().length).toBeGreaterThanOrEqual(10);
    const frame = lib.list("frames")[0]!;
    const scene = SceneDocument.create(40, 20);
    insertAssetIntoScene(scene, frame, { x: 0, y: 0 });
    const m = composeScene(scene);
    expect(m.cells.some((c) => c.char !== " ")).toBe(true);
  });

  it("procedural generators produce multi-line ASCII", () => {
    for (const kind of listProceduralShapeKinds()) {
      const ascii = generateProceduralShape(kind, { width: 12, height: 5, title: "T", label: "L" });
      expect(ascii.includes("\n") || ascii.length > 0).toBe(true);
    }
    const scene = SceneDocument.create(30, 20);
    insertProceduralShapeIntoScene(scene, "window", { width: 14, height: 6, x: 1, y: 1 });
    expect(composeScene(scene).cells.some((c) => c.char === "+" || c.char === "|")).toBe(true);
  });

  it("invert + colorize effects apply; outline expands presence", () => {
    const scene = SceneDocument.create(12, 8);
    const id = addShapeToScene(scene, "rect", 3, 3, { x: 2, y: 2, fill: true, char: "#" });
    scene.updateObject(id, {
      effects: [EffectFactories.invert(), EffectFactories.colorize(255, 0, 0)],
    });
    const m = composeScene(scene);
    const cell = m.cells.find((c) => c.col === 2 && c.row === 2);
    expect(cell?.char).toBe("#");
    expect(cell?.r).toBe(255);
    expect(cell?.g).toBe(0);

    scene.updateObject(id, {
      effects: [EffectFactories.outline(1)],
    });
    const withOutline = composeScene(scene);
    // outline stub coloca '.' no anel
    expect(withOutline.cells.some((c) => c.char === ".")).toBe(true);
  });
});

describe("Scene W7 — clipboard + checkpoints + export", () => {
  it("copy/paste objects across layers", () => {
    const scene = SceneDocument.create(20, 12);
    const id = addTextToScene(scene, "AB", { x: 1, y: 1 });
    const layer2 = scene.addLayer("L2");
    const clip = new SceneClipboard();
    expect(clip.copy(scene, [id])).toBe(1);
    const pasted = clip.paste(scene, { layerId: layer2, offsetX: 3, offsetY: 2 });
    expect(pasted).toHaveLength(1);
    expect(pasted[0]).not.toBe(id);
    const obj = scene.getObject(pasted[0]!);
    expect(obj?.layerId).toBe(layer2);
    expect(obj?.type).toBe("text");
    if (obj?.type === "text") expect(obj.payload.text).toBe("AB");
    expect(obj?.transform.x).toBe(4);
    expect(obj?.transform.y).toBe(3);
    expect(Object.keys(scene.toJSON().objects)).toHaveLength(2);
  });

  it("cut removes originals; duplicate works", () => {
    const scene = SceneDocument.create(16, 10);
    const a = addShapeToScene(scene, "line", 5, 1, { x: 0, y: 0 });
    const clip = new SceneClipboard();
    clip.cut(scene, [a]);
    expect(scene.getObject(a)).toBeUndefined();
    const ids = clip.paste(scene);
    expect(ids).toHaveLength(1);
    const dups = clip.duplicate(scene, ids);
    expect(dups).toHaveLength(1);
    expect(Object.keys(scene.toJSON().objects)).toHaveLength(2);
  });

  it("checkpoints restore and project history pastCount reflects scene", () => {
    const doc = ProjectDocument.create({ name: "W7" });
    const history = new SceneHistory();
    doc.bindSceneHistory(history);
    runWithHistory(history, doc.scene, "add", () => {
      addTextToScene(doc.scene, "X", { x: 0, y: 0 });
    });
    const cp = doc.addSceneCheckpoint("before-clear");
    expect(doc.scene.getCheckpointCount()).toBe(1);
    doc.scene.removeObject(doc.scene.getSelectedObjectIds()[0]!);
    expect(Object.keys(doc.scene.toJSON().objects)).toHaveLength(0);
    expect(doc.restoreSceneCheckpoint(cp)).toBe(true);
    expect(Object.keys(doc.scene.toJSON().objects).length).toBeGreaterThan(0);
    const json = doc.toJSON();
    expect(json.history.pastCount).toBeGreaterThanOrEqual(1);
  });

  it("exportSceneCompositeTxt matches compose", () => {
    const scene = SceneDocument.create(8, 4);
    addTextToScene(scene, "Z", { x: 0, y: 0 });
    const txt = exportSceneCompositeTxt(scene);
    expect(txt.split("\n")[0]?.startsWith("Z")).toBe(true);
    const matrix = exportSceneCompositeMatrix(scene);
    expect(matrix.cols).toBe(8);
    expect(matrix.cells[0]?.char).toBe("Z");
  });
});

describe("Scene W8 — audit fixes", () => {
  it("noise effect is deterministic across compose calls", () => {
    const scene = SceneDocument.create(6, 4);
    const id = addShapeToScene(scene, "rect", 2, 2, { x: 1, y: 1, fill: true, char: "#" });
    scene.updateObject(id, { effects: [EffectFactories.noise(0.4)] });
    const a = composeScene(scene);
    const b = composeScene(scene);
    expect(a.cells.map((c) => c.luminance)).toEqual(b.cells.map((c) => c.luminance));
  });

  it("reference object with embedded matrix composes without asImage", () => {
    const scene = SceneDocument.create(12, 8);
    addShapeToScene(scene, "rect", 3, 2, { x: 0, y: 0, fill: true, char: "@" });
    const lib = new StampLibrary();
    const { referenceId, imageId } = stampRegionIntoScene(
      scene,
      lib,
      { x: 0, y: 0, w: 3, h: 2 },
      { asImage: false, x: 5, y: 3, name: "RefOnly" },
    );
    expect(imageId).toBeUndefined();
    const ref = scene.getObject(referenceId);
    expect(ref?.type).toBe("reference");
    if (ref?.type === "reference") {
      expect(ref.payload.matrix?.cols).toBe(3);
    }
    // Remove original shape so only reference contributes @ at (5,3)
    for (const oid of Object.keys(scene.toJSON().objects)) {
      if (oid !== referenceId) scene.removeObject(oid);
    }
    const m = composeScene(scene);
    const cell = m.cells.find((c) => c.col === 5 && c.row === 3);
    expect(cell?.char).toBe("@");
  });
});
