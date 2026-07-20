import { describe, expect, it } from "vitest";
import {
  PRESET_SCHEMA_VERSION,
  createPreset,
  migratePresetV1ToV2,
  normalizePreset,
  parsePresetJson,
  presetToPipelinePatch,
  type AsciiEnginePresetV1,
} from "@/features/ascii-engine/presets";
import {
  BUILTIN_RECIPES,
  applyRecipe,
  getRecipe,
  getRecipeByName,
  listRecipes,
  recipeToPreset,
} from "@/features/ascii-engine/recipes";
import { matrixToAnsiTruecolor } from "@/features/ascii-engine/exporters";
import { matrixToHtml } from "@/features/ascii-interaction/image-pipeline/exporter";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

describe("preset schema v2", () => {
  it("createPreset emite schemaVersion 2 com campos de primeira classe", () => {
    const preset = createPreset("Test", {
      charset: " .#",
      mappingMode: "edge",
      dithering: "none",
      colorMode: "truecolor",
      gamma: 1.1,
      contrast: 1.2,
      brightness: 0.05,
      effects: ["matrix"],
      rendererId: "canvas",
      themeId: "crt",
      defaultExporter: "html",
    });

    expect(preset.schemaVersion).toBe(PRESET_SCHEMA_VERSION);
    expect(preset.schemaVersion).toBe(2);
    expect(preset.charset).toBe(" .#");
    expect(preset.mappingMode).toBe("edge");
    expect(preset.algorithm).toBe("edge");
    expect(preset.colorMode).toBe("truecolor");
    expect(preset.colors).toBe("truecolor");
    expect(preset.effects).toEqual(["matrix"]);
    expect(preset.rendererId).toBe("canvas");
    expect(preset.defaultExporter).toBe("html");
  });

  it("migra v1 → v2 e parsePresetJson aceita ambos", () => {
    const v1: AsciiEnginePresetV1 = {
      schemaVersion: 1,
      id: "legacy-1",
      name: "Legacy",
      createdAt: "2026-01-01T00:00:00.000Z",
      themeId: "dos",
      effectIds: ["smoke"],
      pipeline: {
        charset: " 01",
        mappingMode: "brightness",
        dithering: "ordered",
        colorMode: "gradient",
        gamma: 0.9,
        contrast: 1.3,
        brightness: 0.1,
      },
    };

    const migrated = migratePresetV1ToV2(v1);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.charset).toBe(" 01");
    expect(migrated.mappingMode).toBe("brightness");
    expect(migrated.colorMode).toBe("gradient");
    expect(migrated.effects).toEqual(["smoke"]);

    const fromJson = parsePresetJson(JSON.stringify(v1));
    expect(fromJson.schemaVersion).toBe(2);
    expect(fromJson.name).toBe("Legacy");

    const patch = presetToPipelinePatch(normalizePreset(migrated));
    expect(patch.charset).toBe(" 01");
    expect(patch.colorMode).toBe("gradient");
    expect(patch.gamma).toBe(0.9);
  });
});

describe("recipes", () => {
  it("expõe pelo menos 20 recipes built-in com nomes esperados", () => {
    expect(BUILTIN_RECIPES.length).toBeGreaterThanOrEqual(20);
    expect(listRecipes().length).toBe(BUILTIN_RECIPES.length);

    const names = BUILTIN_RECIPES.map((r) => r.name);
    for (const expected of [
      "CRT Green",
      "CRT Amber",
      "IBM Terminal",
      "GameBoy",
      "Matrix",
      "Blueprint",
      "Cyberpunk",
      "ANSI",
      "DOS",
      "Linux",
      "Windows Terminal",
      "ASCII Portrait",
      "ASCII Manga",
      "ASCII Pixel",
      "ASCII Sketch",
      "Low Contrast",
      "High Contrast",
      "Noir",
      "Retro Monitor",
      "Anime",
      "Terminal",
      "Sketch",
      "Pixel Art",
      "Phosphor",
    ]) {
      expect(names).toContain(expected);
    }
  });

  it("applyRecipe('crt-green') produz patch de pipeline coerente", () => {
    const recipe = getRecipe("crt-green");
    expect(recipe).toBeDefined();
    expect(getRecipeByName("CRT Green")?.id).toBe("crt-green");

    const patch = applyRecipe("crt-green");
    expect(patch.colorMode).toBe("crt-green");
    expect(patch.mappingMode).toBe("brightness");
    expect(patch.dithering).toBe("floyd-steinberg");
    expect(patch.contrast).toBe(1.25);
    expect(patch.gamma).toBe(1.15);

    const asPreset = recipeToPreset(recipe!);
    expect(asPreset.schemaVersion).toBe(2);
    expect(asPreset.themeId).toBe("crt");
    expect(asPreset.effects).toContain("noise");
    expect("kind" in asPreset).toBe(false);
  });
});

describe("color export", () => {
  const matrix: AsciiMatrix = {
    cols: 2,
    rows: 1,
    charset: " .#",
    cells: [
      { char: "#", col: 0, row: 0, luminance: 1, r: 255, g: 10, b: 20 },
      { char: ".", col: 1, row: 0, luminance: 0.2, r: 0, g: 128, b: 255 },
    ],
  };

  it("matrixToHtml preserva RGB por célula", () => {
    const html = matrixToHtml(matrix);
    expect(html).toContain("rgb(255,10,20)");
    expect(html).toContain("rgb(0,128,255)");
    expect(html).not.toMatch(/body\{[^}]*color:#9dff9d/);
  });

  it("matrixToAnsiTruecolor emite ESC[38;2;r;g;b", () => {
    const ansi = matrixToAnsiTruecolor(matrix);
    expect(ansi).toContain("\x1b[38;2;255;10;20m");
    expect(ansi).toContain("\x1b[38;2;0;128;255m");
    expect(ansi).toContain("#");
    expect(ansi).toContain(".");
  });
});
