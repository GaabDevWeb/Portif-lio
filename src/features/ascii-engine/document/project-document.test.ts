import { describe, expect, it } from "vitest";

import { ProjectDocument } from "@/features/ascii-engine/document";
import { exportProjectZip, importProjectZip } from "@/features/ascii-engine/storage";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

function tinyMatrix(): AsciiMatrix {
  return {
    cols: 2,
    rows: 1,
    charset: " .#",
    cells: [
      { char: "#", col: 0, row: 0, luminance: 1, r: 0, g: 255, b: 0 },
      { char: ".", col: 1, row: 0, luminance: 0, r: 0, g: 0, b: 0 },
    ],
  };
}

describe("ProjectDocument + project zip round-trip", () => {
  it("serializes and restores layers/meta/theme", () => {
    const doc = ProjectDocument.create({ name: "RoundTrip", themeId: "matrix", author: "test" });
    const layerId = doc.editor.getState().activeLayerId;
    doc.editor.setLayerMatrix(layerId, tinyMatrix());
    doc.setWorkspace({ zoom: 2, focusMode: true });
    doc.addAsset({ kind: "image", name: "src.png", mime: "image/png", path: "assets/src.png" });

    const json = doc.toJSON();
    expect(json.version).toBe("3.0");
    expect(json.meta.name).toBe("RoundTrip");
    expect(json.themeId).toBe("matrix");
    expect(json.layers[0]?.matrix?.cells[0]?.char).toBe("#");
    expect(json.assets).toHaveLength(1);

    const restored = ProjectDocument.fromJSON(json);
    expect(restored.id).toBe(doc.id);
    expect(restored.getMeta().name).toBe("RoundTrip");
    expect(restored.getThemeId()).toBe("matrix");
    expect(restored.editor.getState().layers[0]?.matrix?.cols).toBe(2);
    expect(restored.getWorkspace().zoom).toBe(2);
    expect(restored.getAssets()[0]?.path).toBe("assets/src.png");
  });

  it("exportProjectZip → importProjectZip preserves document", async () => {
    const doc = ProjectDocument.create({ name: "ZipMe", themeId: "crt" });
    doc.editor.setLayerMatrix(doc.editor.getState().activeLayerId, tinyMatrix());

    const blob = await exportProjectZip(doc, {
      assets: [{ path: "assets/note.txt", data: new Blob(["hello"], { type: "text/plain" }) }],
    });
    expect(blob.size).toBeGreaterThan(0);

    const { document: imported, manifest, assets } = await importProjectZip(blob);
    expect(manifest.format).toBe("ascii-project");
    expect(imported.getMeta().name).toBe("ZipMe");
    expect(imported.getThemeId()).toBe("crt");
    expect(imported.editor.getState().layers[0]?.matrix?.cells[0]?.char).toBe("#");
    expect(assets.has("assets/note.txt")).toBe(true);
  });
});
