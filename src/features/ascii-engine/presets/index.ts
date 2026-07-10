import { downloadBlob } from "@/features/ascii-engine/browser";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { WorkspaceState } from "@/studio/workspace/types";
import { DEFAULT_WORKSPACE_STATE } from "@/studio/workspace/types";

function downloadText(content: string, filename: string, mime = "text/plain"): void {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename);
}

export const PRESET_SCHEMA_VERSION = 1 as const;

export interface AsciiEnginePreset {
  schemaVersion: typeof PRESET_SCHEMA_VERSION;
  id: string;
  name: string;
  createdAt: string;
  pipeline?: Partial<ImagePipelineOptions>;
  interaction?: Partial<AsciiInteractionConfig>;
  workspace?: Partial<WorkspaceState>;
  themeId?: string;
  effectIds?: string[];
  notes?: string;
}

export function createPreset(
  name: string,
  partial: Omit<AsciiEnginePreset, "schemaVersion" | "id" | "name" | "createdAt"> = {},
): AsciiEnginePreset {
  return {
    schemaVersion: PRESET_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    workspace: DEFAULT_WORKSPACE_STATE,
    ...partial,
  };
}

export function duplicatePreset(preset: AsciiEnginePreset, newName?: string): AsciiEnginePreset {
  return {
    ...structuredClone(preset),
    id: crypto.randomUUID(),
    name: newName ?? `${preset.name} (copy)`,
    createdAt: new Date().toISOString(),
  };
}

export function exportPresetJson(preset: AsciiEnginePreset): string {
  return JSON.stringify(preset, null, 2);
}

export function downloadPreset(preset: AsciiEnginePreset): void {
  downloadText(exportPresetJson(preset), `${slugify(preset.name)}.ascii-preset.json`, "application/json");
}

export function parsePresetJson(raw: string): AsciiEnginePreset {
  const data = JSON.parse(raw) as AsciiEnginePreset;
  if (data.schemaVersion !== PRESET_SCHEMA_VERSION) {
    throw new Error(`Preset schema ${String(data.schemaVersion)} não suportado.`);
  }
  if (!data.id || !data.name) throw new Error("Preset inválido.");
  return data;
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
    const idx = this.presets.findIndex((p) => p.id === preset.id);
    if (idx >= 0) this.presets[idx] = preset;
    else this.presets.push(preset);
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
