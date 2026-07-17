"use client";

import {
  ASCII_ENGINE_THEMES,
  themeToLabCssVars,
  type AsciiEngineThemeId,
} from "@/features/ascii-engine/themes";
import {
  createPreset,
  defaultPresetStore,
  downloadPreset,
  duplicatePreset,
  importPresetFromFile,
  type AsciiEnginePreset,
} from "@/features/ascii-engine/presets";
import {
  listRecipeCategories,
  listRecipes,
  recipeToPreset,
  type AsciiRecipe,
} from "@/features/ascii-engine/recipes";
import { PanelButton, PanelSection } from "@/studio/ui/controls";
import { useMemo, useState } from "react";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { WorkspaceState } from "@/studio/workspace/types";

interface ThemesPresetsPanelProps {
  themeId: AsciiEngineThemeId;
  onThemeChange: (id: AsciiEngineThemeId) => void;
  pipeline: Partial<ImagePipelineOptions>;
  interaction: Partial<AsciiInteractionConfig>;
  workspace: Partial<WorkspaceState>;
  onApplyPreset: (preset: AsciiEnginePreset) => void;
}

export function ThemesPresetsPanel({
  themeId,
  onThemeChange,
  pipeline,
  interaction,
  workspace,
  onApplyPreset,
}: ThemesPresetsPanelProps) {
  const [presets, setPresets] = useState(() => defaultPresetStore.list());
  const [name, setName] = useState("My Preset");
  const [recipeCategory, setRecipeCategory] = useState<string>("all");
  const [recipeQuery, setRecipeQuery] = useState("");

  const recipes = useMemo(() => listRecipes(), []);
  const categories = useMemo(() => listRecipeCategories(), []);

  const filteredRecipes = useMemo(() => {
    const q = recipeQuery.trim().toLowerCase();
    return recipes.filter((r) => {
      if (recipeCategory !== "all" && r.category !== recipeCategory) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.id.includes(q) ||
        (r.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [recipes, recipeCategory, recipeQuery]);

  const refresh = () => setPresets(defaultPresetStore.list());

  const applyRecipe = (recipe: AsciiRecipe) => {
    onApplyPreset(recipeToPreset(recipe));
  };

  return (
    <div className="space-y-4 px-4 py-3">
      <PanelSection title="Themes">
        <div className="grid grid-cols-2 gap-1">
          {ASCII_ENGINE_THEMES.map((t) => (
            <PanelButton
              key={t.id}
              className={
                themeId === t.id
                  ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10"
                  : ""
              }
              onClick={() => onThemeChange(t.id)}
            >
              {t.label}
            </PanelButton>
          ))}
        </div>
      </PanelSection>

      <PanelSection title={`Recipes (${filteredRecipes.length})`}>
        <input
          type="search"
          value={recipeQuery}
          onChange={(e) => setRecipeQuery(e.target.value)}
          placeholder="Filtrar…"
          className="mb-2 w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1 font-mono text-[10px]"
        />
        <div className="mb-2 flex flex-wrap gap-1">
          <PanelButton
            className={recipeCategory === "all" ? "border-[var(--phosphor-primary)]" : ""}
            onClick={() => setRecipeCategory("all")}
          >
            All
          </PanelButton>
          {categories.map((cat) => (
            <PanelButton
              key={cat}
              className={recipeCategory === cat ? "border-[var(--phosphor-primary)]" : ""}
              onClick={() => setRecipeCategory(cat)}
            >
              {cat}
            </PanelButton>
          ))}
        </div>
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {filteredRecipes.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                title={r.description ?? r.name}
                className="flex w-full cursor-pointer flex-col rounded border border-[var(--ui-border)] px-2 py-1.5 text-left transition-colors hover:border-[var(--phosphor-primary)] hover:bg-[var(--phosphor-primary)]/5"
                onClick={() => applyRecipe(r)}
              >
                <span className="font-mono text-[10px] text-[var(--phosphor-primary)]">{r.name}</span>
                {r.description ? (
                  <span className="font-mono text-[8px] text-[var(--ui-text-dim)]">{r.description}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </PanelSection>

      <PanelSection title="Presets">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1 font-mono text-[10px]"
        />
        <div className="mb-2 flex gap-1">
          <PanelButton
            className="flex-1"
            onClick={() => {
              const preset = createPreset(name || "Preset", {
                pipeline,
                interaction,
                workspace,
                themeId,
                charset: pipeline.charset,
                mappingMode: pipeline.mappingMode,
                algorithm: pipeline.mappingMode,
                dithering: pipeline.dithering,
                colorMode: pipeline.colorMode,
                colors: pipeline.colorMode,
                gamma: pipeline.gamma,
                contrast: pipeline.contrast,
                brightness: pipeline.brightness,
              });
              defaultPresetStore.save(preset);
              refresh();
            }}
          >
            Save
          </PanelButton>
          <label className="flex-1 cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 text-center font-mono text-[10px] text-[var(--phosphor-primary)]">
            Import
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void importPresetFromFile(f).then((p) => {
                  defaultPresetStore.save(p);
                  refresh();
                  onApplyPreset(p);
                });
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {presets.length === 0 ? (
          <p className="text-[9px] text-[var(--ui-text-dim)]">Nenhum preset na sessão.</p>
        ) : (
          <ul className="space-y-1">
            {presets.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-1 rounded border border-[var(--ui-border)] px-2 py-1"
              >
                <button
                  type="button"
                  className="flex-1 cursor-pointer text-left font-mono text-[10px] text-[var(--phosphor-primary)]"
                  onClick={() => onApplyPreset(p)}
                >
                  {p.name}
                </button>
                <PanelButton
                  onClick={() => {
                    const dup = duplicatePreset(p);
                    defaultPresetStore.save(dup);
                    refresh();
                  }}
                >
                  Dup
                </PanelButton>
                <PanelButton onClick={() => downloadPreset(p)}>Export</PanelButton>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>
    </div>
  );
}

export { themeToLabCssVars };
