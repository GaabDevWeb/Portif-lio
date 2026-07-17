import { describe, expect, it } from "vitest";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  AiProviderNotConfiguredError,
  StubAiProvider,
  ThrowingAiProvider,
  defaultAiProvider,
} from "@/features/ascii-engine/ai";
import { createAsciiEngine } from "@/features/ascii-engine/sdk/create-ascii-engine";

const sampleMatrix: AsciiMatrix = {
  cols: 2,
  rows: 2,
  charset: " .:-=+*#%@",
  cells: [
    { char: "#", col: 0, row: 0, luminance: 0.9, r: 255, g: 255, b: 255 },
    { char: ".", col: 1, row: 0, luminance: 0.1, r: 20, g: 20, b: 20 },
    { char: " ", col: 0, row: 1, luminance: 0, r: 0, g: 0, b: 0 },
    { char: "*", col: 1, row: 1, luminance: 0.5, r: 128, g: 128, b: 128 },
  ],
};

describe("AiProvider stubs", () => {
  it("defaultAiProvider returns stub payloads without throwing", async () => {
    const ai = defaultAiProvider;
    expect(ai.status).toBe("stub");
    expect(ai.id).toBe("stub");

    const prompt = await ai.promptToAscii("a cat");
    expect(prompt.status).toBe("stub");
    expect(prompt.method).toBe("promptToAscii");
    expect(prompt.matrix).toBeUndefined();

    const charset = await ai.suggestCharset(sampleMatrix);
    expect(charset.status).toBe("stub");

    const params = await ai.suggestParams(sampleMatrix);
    expect(params.status).toBe("stub");

    const enhance = await ai.enhance(sampleMatrix);
    expect(enhance.status).toBe("stub");

    const reverse = await ai.reverseAscii(sampleMatrix);
    expect(reverse.status).toBe("stub");

    const ocr = await ai.ocrAscii(sampleMatrix);
    expect(ocr.status).toBe("stub");
  });

  it("ThrowingAiProvider fails fast on every method", async () => {
    const ai = new ThrowingAiProvider();
    await expect(ai.promptToAscii("x")).rejects.toBeInstanceOf(AiProviderNotConfiguredError);
    await expect(ai.suggestCharset(sampleMatrix)).rejects.toBeInstanceOf(
      AiProviderNotConfiguredError,
    );
    await expect(ai.enhance(sampleMatrix)).rejects.toBeInstanceOf(AiProviderNotConfiguredError);
  });

  it("createAsciiEngine().ai is the stub provider (not null)", () => {
    const engine = createAsciiEngine();
    expect(engine.ai).toBeInstanceOf(StubAiProvider);
    expect(engine.ai.status).toBe("stub");
  });

  it("createAsciiEngine accepts injected AiProvider", async () => {
    const custom = new ThrowingAiProvider();
    const engine = createAsciiEngine({ ai: custom });
    expect(engine.ai).toBe(custom);
    await expect(engine.ai.ocrAscii(sampleMatrix)).rejects.toThrow(/ocrAscii/);
  });
});
