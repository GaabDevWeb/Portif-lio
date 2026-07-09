import { ConverterRegistry, defaultConverterRegistry } from "@/features/ascii-engine/converters";
import { EditorDocument } from "@/features/ascii-engine/editor";
import { PlaygroundRegistry, defaultPlaygroundRegistry } from "@/features/ascii-engine/playground";
import { PresetStore, defaultPresetStore } from "@/features/ascii-engine/presets";
import { EXPORTER_CATALOG } from "@/features/ascii-engine/exporters";
import { IMPORTER_CATALOG } from "@/features/ascii-engine/importers";
import { ASCII_ENGINE_THEMES, type AsciiEngineThemeId, getTheme } from "@/features/ascii-engine/themes";

export interface AsciiEngineOptions {
  converters?: ConverterRegistry;
  playground?: PlaygroundRegistry;
  presets?: PresetStore;
  themeId?: AsciiEngineThemeId;
}

/**
 * Factory SDK — ponto de entrada estável para futura extração:
 * `import { createAsciiEngine } from 'ascii-engine'`
 */
export function createAsciiEngine(options: AsciiEngineOptions = {}) {
  const converters = options.converters ?? defaultConverterRegistry;
  const playground = options.playground ?? defaultPlaygroundRegistry;
  const presets = options.presets ?? defaultPresetStore;
  let themeId: AsciiEngineThemeId = options.themeId ?? "root-os";
  const editor = new EditorDocument();

  return {
    version: "3.0.0-next",
    converters,
    playground,
    presets,
    editor,
    exporters: EXPORTER_CATALOG,
    importers: IMPORTER_CATALOG,
    themes: ASCII_ENGINE_THEMES,
    getTheme: () => getTheme(themeId),
    setTheme(id: AsciiEngineThemeId) {
      themeId = id;
      return getTheme(themeId);
    },
  };
}

export type AsciiEngine = ReturnType<typeof createAsciiEngine>;
