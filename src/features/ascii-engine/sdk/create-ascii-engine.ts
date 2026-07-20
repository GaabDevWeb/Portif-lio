import { defaultAiProvider, type AiProvider } from "@/features/ascii-engine/ai";
import { ConverterRegistry, defaultConverterRegistry } from "@/features/ascii-engine/converters";
import { ProjectDocument } from "@/features/ascii-engine/document";
import { PlaygroundRegistry, defaultPlaygroundRegistry } from "@/features/ascii-engine/playground";
import { PresetStore, defaultPresetStore } from "@/features/ascii-engine/presets";
import { EXPORTER_CATALOG } from "@/features/ascii-engine/exporters";
import { IMPORTER_CATALOG } from "@/features/ascii-engine/importers";
import { createNodeGraphRunner, type NodeGraphRunner } from "@/features/ascii-engine/nodes";
import { PluginHost, defaultPluginHost } from "@/features/ascii-engine/plugins";
import { ProjectStore, defaultProjectStore } from "@/features/ascii-engine/storage";
import { ASCII_ENGINE_THEMES, type AsciiEngineThemeId, getTheme } from "@/features/ascii-engine/themes";

export interface AsciiEngineOptions {
  converters?: ConverterRegistry;
  playground?: PlaygroundRegistry;
  presets?: PresetStore;
  themeId?: AsciiEngineThemeId;
  document?: ProjectDocument;
  storage?: ProjectStore;
  plugins?: PluginHost;
  nodes?: NodeGraphRunner;
  /** Provider de IA; default = StubAiProvider (sem rede). */
  ai?: AiProvider;
}

/**
 * Factory SDK — ponto de entrada estável para futura extração:
 * `import { createAsciiEngine } from 'ascii-engine'`
 */
export function createAsciiEngine(options: AsciiEngineOptions = {}) {
  const converters = options.converters ?? defaultConverterRegistry;
  const playground = options.playground ?? defaultPlaygroundRegistry;
  const presets = options.presets ?? defaultPresetStore;
  let themeId: AsciiEngineThemeId = options.themeId ?? "crt-green";
  const document =
    options.document ??
    ProjectDocument.create({ themeId, name: "Untitled Project" });
  const editor = document.editor;
  const storage = options.storage ?? defaultProjectStore;
  const plugins = options.plugins ?? defaultPluginHost;
  const nodes = options.nodes ?? createNodeGraphRunner();
  const ai = options.ai ?? defaultAiProvider;

  return {
    version: "3.0.0-platform",
    converters,
    playground,
    presets,
    editor,
    document,
    storage,
    plugins,
    nodes,
    /** AiProvider stub por default — App injeta provider real (§3.15). */
    ai,
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
