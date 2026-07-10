import { downloadBlob } from "@/features/ascii-engine/browser";
import type { ExportFormatId } from "@/features/ascii-engine/exporters";
import type {
  ColorMode,
  DitheringMode,
  ImagePipelineOptions,
  MappingMode,
} from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { WorkspaceState } from "@/studio/workspace/types";
import { DEFAULT_WORKSPACE_STATE } from "@/studio/workspace/types";

function downloadText(content: string, filename: string, mime = "text/plain"): void {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename);
}

export const PRESET_SCHEMA_VERSION = 2 as const;
export const PRESET_SCHEMA_VERSION_V1 = 1 as const;

/** Renderer id estável — canvas é o default do Studio/engine. */
export type AsciiRendererId = "canvas" | "dom" | (string & {});

/**
 * Preset schema v2 — campos de pipeline de primeira classe + bags opcionais.
 * `algorithm` é alias de `mappingMode`; `colors` é alias de `colorMode`.
 */
export interface AsciiEnginePreset {
  schemaVersion: typeof PRESET_SCHEMA_VERSION;
  id: string;
  name: string;
  createdAt: string;
  /** Charset de mapeamento (ex.: `" .:-=+*#%@"`). */
  charset?: string;
  /** Algoritmo de mapeamento luminância→char. */
  mappingMode?: MappingMode;
  /** Alias de `mappingMode`. */
  algorithm?: MappingMode;
  dithering?: DitheringMode;
  colorMode?: ColorMode;
  /** Alias de `colorMode`. */
  colors?: ColorMode;
  gamma?: number;
  contrast?: number;
  brightness?: number;
  /** Playground / post-fx effect ids. */
  effects?: string[];
  /** @deprecated use `effects` — mantido na migração v1. */
  effectIds?: string[];
  rendererId?: AsciiRendererId;
  themeId?: string;
  defaultExporter?: ExportFormatId | string;
  pipeline?: Partial<ImagePipelineOptions>;
  interaction?: Partial<AsciiInteractionConfig>;
  workspace?: Partial<WorkspaceState>;
  notes?: string;
  description?: string;
  tags?: string[];
}

export type AsciiEnginePresetV1 = {
  schemaVersion: typeof PRESET_SCHEMA_VERSION_V1;
  id: string;
  name: string;
  createdAt: string;
  pipeline?: Partial<ImagePipelineOptions>;
  interaction?: Partial<AsciiInteractionConfig>;
  workspace?: Partial<WorkspaceState>;
  themeId?: string;
  effectIds?: string[];
  notes?: string;
};

export function resolveMappingMode(preset: Pick<AsciiEnginePreset, "mappingMode" | "algorithm" | "pipeline">): MappingMode | undefined {
  return preset.mappingMode ?? preset.algorithm ?? preset.pipeline?.mappingMode;
}

export function resolveColorMode(preset: Pick<AsciiEnginePreset, "colorMode" | "colors" | "pipeline">): ColorMode | undefined {
  return preset.colorMode ?? preset.colors ?? preset.pipeline?.colorMode;
}

export function resolveEffects(preset: Pick<AsciiEnginePreset, "effects" | "effectIds">): string[] {
  return preset.effects ?? preset.effectIds ?? [];
}

/** Extrai patch de ImagePipelineOptions a partir dos campos v2 (+ bag pipeline). */
export function presetToPipelinePatch(preset: AsciiEnginePreset): Partial<ImagePipelineOptions> {
  const patch: Partial<ImagePipelineOptions> = { ...preset.pipeline };
  if (preset.charset != null) patch.charset = preset.charset;
  const mapping = resolveMappingMode(preset);
  if (mapping != null) patch.mappingMode = mapping;
  if (preset.dithering != null) patch.dithering = preset.dithering;
  const color = resolveColorMode(preset);
  if (color != null) patch.colorMode = color;
  if (preset.gamma != null) patch.gamma = preset.gamma;
  if (preset.contrast != null) patch.contrast = preset.contrast;
  if (preset.brightness != null) patch.brightness = preset.brightness;
  return patch;
}

export function migratePresetV1ToV2(v1: AsciiEnginePresetV1): AsciiEnginePreset {
  const p = v1.pipeline ?? {};
  return {
    schemaVersion: PRESET_SCHEMA_VERSION,
    id: v1.id,
    name: v1.name,
    createdAt: v1.createdAt,
    charset: p.charset,
    mappingMode: p.mappingMode,
    algorithm: p.mappingMode,
    dithering: p.dithering,
    colorMode: p.colorMode,
    colors: p.colorMode,
    gamma: p.gamma,
    contrast: p.contrast,
    brightness: p.brightness,
    effects: v1.effectIds,
    effectIds: v1.effectIds,
    rendererId: "canvas",
    themeId: v1.themeId,
    defaultExporter: "html",
    pipeline: v1.pipeline,
    interaction: v1.interaction,
    workspace: v1.workspace,
    notes: v1.notes,
  };
}

export function normalizePreset(raw: AsciiEnginePreset | AsciiEnginePresetV1): AsciiEnginePreset {
  if (raw.schemaVersion === PRESET_SCHEMA_VERSION_V1) {
    return migratePresetV1ToV2(raw);
  }
  if (raw.schemaVersion !== PRESET_SCHEMA_VERSION) {
    throw new Error(`Preset schema ${String((raw as { schemaVersion?: unknown }).schemaVersion)} não suportado.`);
  }
  return {
    ...raw,
    mappingMode: resolveMappingMode(raw),
    algorithm: resolveMappingMode(raw),
    colorMode: resolveColorMode(raw),
    colors: resolveColorMode(raw),
    effects: resolveEffects(raw),
    rendererId: raw.rendererId ?? "canvas",
  };
}

export function createPreset(
  name: string,
  partial: Omit<AsciiEnginePreset, "schemaVersion" | "id" | "name" | "createdAt"> = {},
): AsciiEnginePreset {
  const base: AsciiEnginePreset = {
    schemaVersion: PRESET_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    workspace: DEFAULT_WORKSPACE_STATE,
    rendererId: "canvas",
    defaultExporter: "html",
    ...partial,
  };
  return normalizePreset(base);
}

export function duplicatePreset(preset: AsciiEnginePreset, newName?: string): AsciiEnginePreset {
  return {
    ...structuredClone(normalizePreset(preset)),
    id: crypto.randomUUID(),
    name: newName ?? `${preset.name} (copy)`,
    createdAt: new Date().toISOString(),
  };
}

export function exportPresetJson(preset: AsciiEnginePreset): string {
  return JSON.stringify(normalizePreset(preset), null, 2);
}

export function downloadPreset(preset: AsciiEnginePreset): void {
  downloadText(exportPresetJson(preset), `${slugify(preset.name)}.ascii-preset.json`, "application/json");
}

export function parsePresetJson(raw: string): AsciiEnginePreset {
  const data = JSON.parse(raw) as AsciiEnginePreset | AsciiEnginePresetV1;
  if (!data.id || !data.name) throw new Error("Preset inválido.");
  return normalizePreset(data);
}

export async function importPresetFromFile(file: File): Promise<AsciiEnginePreset> {
  const text = await file.text();
  return parsePresetJson(text);
}

/** Store em memória de sessão — base para partilha futura. */
export class PresetStore {
  private presets: AsciiEnginePreset[] = [];

  list(): AsciiEnginePreset[] {
    return [...this.presets];
  }

  save(preset: AsciiEnginePreset): void {
    const normalized = normalizePreset(preset);
    const idx = this.presets.findIndex((p) => p.id === normalized.id);
    if (idx >= 0) this.presets[idx] = normalized;
    else this.presets.push(normalized);
  }

  remove(id: string): void {
    this.presets = this.presets.filter((p) => p.id !== id);
  }

  get(id: string): AsciiEnginePreset | undefined {
    return this.presets.find((p) => p.id === id);
  }
}

export const defaultPresetStore = new PresetStore();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "preset";
}
