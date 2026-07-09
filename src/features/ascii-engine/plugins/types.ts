import type { AsciiEngineThemeTokens } from "@/features/ascii-engine/themes";

/** Declaração estática do que o plugin contribui (SSOT §3.14). */
export interface PluginContributes {
  converters?: string[];
  exporters?: string[];
  importers?: string[];
  effects?: string[];
  nodes?: string[];
  renderers?: string[];
  charsets?: string[];
  themes?: string[];
}

export interface PluginManifest {
  id: string;
  version: string;
  name?: string;
  description?: string;
  contributes: PluginContributes;
}

export interface CharsetContribution {
  id: string;
  /** Glyph ramp dark→light (ou inverso, conforme pipeline). */
  glyphs: string;
  label?: string;
}

/** Theme contribution — id livre (plugins); built-ins usam AsciiEngineThemeId. */
export interface ThemeContribution {
  id: string;
  label: string;
  tokens: AsciiEngineThemeTokens;
}

/**
 * Módulo same-origin (fase 1 — sem iframe/worker sandbox).
 * Contribuições declarativas + `activate` opcional para registo imperativo.
 */
export interface PluginModule {
  charsets?: CharsetContribution[];
  themes?: ThemeContribution[];
  activate?(ctx: PluginContext): void | Promise<void>;
  deactivate?(ctx: PluginContext): void | Promise<void>;
}

export interface PluginContext {
  manifest: PluginManifest;
  registerCharset(contribution: CharsetContribution): void;
  registerTheme(contribution: ThemeContribution): void;
}

export interface LoadedPlugin {
  manifest: PluginManifest;
  module: PluginModule;
  loadedAt: number;
}
