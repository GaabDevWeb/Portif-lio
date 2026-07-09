import { describe, expect, it } from "vitest";

import {
  canHandleSvgInput,
  convertBatchStub,
  ConverterRegistry,
  defaultConverterRegistry,
  isSvgFile,
  isSvgMarkup,
} from "@/features/ascii-engine/converters";

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

describe("convertBatchStub", () => {
  it("returns stub status for a file list without processing", async () => {
    const files = [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.svg", { type: "image/svg+xml" }),
    ];
    const result = await convertBatchStub(files);
    expect(result.status).toBe("stub");
    expect(result.items).toHaveLength(2);
    expect(result.items.every((i) => i.status === "stub")).toBe(true);
    expect(result.message).toMatch(/stub/i);
  });

  it("skips files without adapter when processReady is true", async () => {
    const files = [new File(["x"], "doc.pdf", { type: "application/pdf" })];
    const result = await convertBatchStub(files, {
      processReady: true,
      findAdapter: () => undefined,
    });
    expect(result.status).toBe("stub");
    expect(result.items[0]?.status).toBe("skipped");
  });
});
