import { describe, expect, it, vi } from "vitest";

import {
  canHandleSvgInput,
  convertBatch,
  convertBatchStub,
  ConverterRegistry,
  defaultConverterRegistry,
  isSvgFile,
  isSvgMarkup,
} from "@/features/ascii-engine/converters";
import {
  extractAsciiTextFromHtml,
  extractAsciiTextFromSvg,
  IMPORTER_CATALOG,
} from "@/features/ascii-engine/importers";
import { EXPORTER_CATALOG, matrixToAnsi } from "@/features/ascii-engine/exporters";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

describe("SvgAdapter / canHandle", () => {
  it("detects .svg extension and image/svg+xml mime", () => {
    const byExt = new File(["<svg/>"], "icon.svg", { type: "" });
    const byMime = new File(["<svg/>"], "icon", { type: "image/svg+xml" });
    expect(isSvgFile(byExt)).toBe(true);
    expect(isSvgFile(byMime)).toBe(true);
    expect(canHandleSvgInput(byExt)).toBe(true);
  });

  it("detects SVG markup strings", () => {
    expect(isSvgMarkup('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).toBe(true);
    expect(isSvgMarkup("not svg")).toBe(false);
  });

  it("registers svg as ready in default registry", () => {
    const svg = defaultConverterRegistry.get("svg");
    expect(svg?.capability.status).toBe("ready");
    expect(svg?.canHandle(new File(["<svg/>"], "a.svg", { type: "image/svg+xml" }))).toBe(
      true,
    );
  });

  it("findFor resolves SVG File to SvgAdapter", () => {
    const registry = new ConverterRegistry();
    const file = new File(["<svg width='10' height='10'/>"], "x.svg", {
      type: "image/svg+xml",
    });
    const adapter = registry.findFor(file);
    expect(adapter?.kind).toBe("svg");
  });
});

describe("Clipboard / Canvas adapters (W3)", () => {
  it("registers clipboard and canvas as ready", () => {
    expect(defaultConverterRegistry.get("clipboard")?.capability.status).toBe("ready");
    expect(defaultConverterRegistry.get("canvas")?.capability.status).toBe("ready");
  });

  it("keeps video/webcam/screen/pdf as stubs", () => {
    for (const kind of ["video", "webcam", "screen", "pdf"] as const) {
      expect(defaultConverterRegistry.get(kind)?.capability.status).toBe("stub");
    }
  });

  it("ClipboardAdapter canHandle File image and rejects non-image", () => {
    const adapter = defaultConverterRegistry.get("clipboard")!;
    expect(adapter.canHandle(new File(["x"], "a.png", { type: "image/png" }))).toBe(true);
    expect(adapter.canHandle(new File(["x"], "a.pdf", { type: "application/pdf" }))).toBe(
      false,
    );
  });

  it("ImageAdapter canHandle File PNG for batch", () => {
    const adapter = defaultConverterRegistry.get("image")!;
    expect(adapter.canHandle(new File(["x"], "a.png", { type: "image/png" }))).toBe(true);
    expect(adapter.canHandle(new File(["x"], "a.gif", { type: "image/gif" }))).toBe(false);
  });

  it("findFor prefers ImageAdapter for PNG File", () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    expect(defaultConverterRegistry.findFor(file)?.kind).toBe("image");
  });
});

describe("convertBatch", () => {
  it("returns stub status when processReady is false", async () => {
    const files = [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.svg", { type: "image/svg+xml" }),
    ];
    const result = await convertBatch(files, { processReady: false });
    expect(result.status).toBe("stub");
    expect(result.items).toHaveLength(2);
    expect(result.items.every((i) => i.status === "stub")).toBe(true);
  });

  it("convertBatchStub defaults to stub without processReady", async () => {
    const files = [new File(["a"], "a.png", { type: "image/png" })];
    const result = await convertBatchStub(files);
    expect(result.status).toBe("stub");
  });

  it("skips files without adapter when processReady is true", async () => {
    const files = [new File(["x"], "doc.pdf", { type: "application/pdf" })];
    const result = await convertBatch(files, {
      processReady: true,
      findAdapter: () => undefined,
    });
    expect(result.status).toBe("empty");
    expect(result.items[0]?.status).toBe("skipped");
  });

  it("marks done when adapter converts successfully", async () => {
    const matrix: AsciiMatrix = {
      cols: 2,
      rows: 1,
      cells: [{ char: "#", col: 0, row: 0, luminance: 1, r: 0, g: 255, b: 0 }],
      charset: "#",
    };
    const files = [new File(["x"], "a.png", { type: "image/png" })];
    const result = await convertBatch(files, {
      processReady: true,
      findAdapter: () => ({
        convert: vi.fn().mockResolvedValue({ matrix }),
      }),
    });
    expect(result.status).toBe("done");
    expect(result.items[0]?.status).toBe("done");
    expect(result.items[0]?.matrix?.cols).toBe(2);
  });
});

describe("importers HTML / SVG (W3)", () => {
  it("marks html and svg ready; gif-ascii stub", () => {
    expect(IMPORTER_CATALOG.find((i) => i.id === "html")?.status).toBe("ready");
    expect(IMPORTER_CATALOG.find((i) => i.id === "svg")?.status).toBe("ready");
    expect(IMPORTER_CATALOG.find((i) => i.id === "gif-ascii")?.status).toBe("stub");
  });

  it("extractAsciiTextFromHtml prefers pre content", () => {
    const html = `<!DOCTYPE html><html><body><pre>AB\nCD</pre></body></html>`;
    expect(extractAsciiTextFromHtml(html)).toBe("AB\nCD");
  });

  it("extractAsciiTextFromHtml strips colored spans inside pre", () => {
    const html = `<pre><span style="color:rgb(1,2,3)">#</span> </pre>`;
    expect(extractAsciiTextFromHtml(html)).toBe("# ");
  });

  it("extractAsciiTextFromSvg rebuilds grid from text elements", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12">A</text>
      <text x="7" y="12">B</text>
      <text x="0" y="24">C</text>
    </svg>`;
    const text = extractAsciiTextFromSvg(svg);
    expect(text).toContain("A");
    expect(text).toContain("B");
    expect(text).toContain("C");
    expect(text.split("\n")).toHaveLength(2);
  });
});

describe("exporters catalog (W3)", () => {
  it("marks sprite-sheet and clipboard ready", () => {
    expect(EXPORTER_CATALOG.find((e) => e.id === "sprite-sheet")?.status).toBe("ready");
    expect(EXPORTER_CATALOG.find((e) => e.id === "clipboard")?.status).toBe("ready");
    expect(EXPORTER_CATALOG.find((e) => e.id === "pdf")?.status).toBe("stub");
  });

  it("matrixToAnsi emits truecolor escapes", () => {
    const matrix: AsciiMatrix = {
      cols: 1,
      rows: 1,
      cells: [{ char: "@", col: 0, row: 0, luminance: 1, r: 10, g: 20, b: 30 }],
      charset: "@",
    };
    const ansi = matrixToAnsi(matrix);
    expect(ansi).toContain("\x1b[38;2;10;20;30m@");
  });
});
