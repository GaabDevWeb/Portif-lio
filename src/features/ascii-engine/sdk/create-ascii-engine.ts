import { ConverterRegistry, defaultConverterRegistry } from "@/features/ascii-engine/converters";
import { ProjectDocument } from "@/features/ascii-engine/document";
import { PlaygroundRegistry, defaultPlaygroundRegistry } from "@/features/ascii-engine/playground";
import { PresetStore, defaultPresetStore } from "@/features/ascii-engine/presets";
import { EXPORTER_CATALOG } from "@/features/ascii-engine/exporters";
import { IMPORTER_CATALOG } from "@/features/ascii-engine/importers";
import { ProjectStore, defaultProjectStore } from "@/features/ascii-engine/storage";
import { ASCII_ENGINE_THEMES, type AsciiEngineThemeId, getTheme } from "@/features/ascii-engine/themes";

export interface AsciiEngineOptions {
  converters?: ConverterRegistry;
  playground?: PlaygroundRegistry;
  presets?: PresetStore;
  themeId?: AsciiEngineThemeId;
  document?: ProjectDocument;
  storage?: ProjectStore;
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
  const document =
    options.document ??
    ProjectDocument.create({ themeId, name: "Untitled Project" });
  const editor = document.editor;
  const storage = options.storage ?? defaultProjectStore;

  return {
    version: "3.0.0-platform",
    converters,
    playground,
    presets,
    editor,
    document,
    storage,
    /** Placeholders — preenchidos em P6/P9/P11. */
    nodes: null,
    plugins: null,
    ai: null,
    exporters: EXPORTER_CATALOG,
    importers: IMPORTER_CATALOG,
    themes: ASCII_ENGINE_THEMES,
    getTheme: () => getTheme(themeId),
    setTheme(id: AsciiEngineThemeId) {
      themeId = id;
      document.setThemeId(id);
      return getTheme(themeId);
    },
  };
}

export type AsciiEngine = ReturnType<typeof createAsciiEngine>;
