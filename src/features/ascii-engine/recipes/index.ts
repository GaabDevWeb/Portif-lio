import {
  normalizePreset,
  presetToPipelinePatch,
  type AsciiEnginePreset,
} from "@/features/ascii-engine/presets";
import { BUILTIN_RECIPES } from "@/features/ascii-engine/recipes/builtin";
import type { AsciiRecipe } from "@/features/ascii-engine/recipes/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";

export type { AsciiRecipe, RecipeCategory } from "@/features/ascii-engine/recipes/types";
export { BUILTIN_RECIPES } from "@/features/ascii-engine/recipes/builtin";

export function listRecipes(): AsciiRecipe[] {
  return [...BUILTIN_RECIPES];
}

export function getRecipe(id: string): AsciiRecipe | undefined {
  return BUILTIN_RECIPES.find((r) => r.id === id);
}

export function getRecipeByName(name: string): AsciiRecipe | undefined {
  const needle = name.trim().toLowerCase();
  return BUILTIN_RECIPES.find((r) => r.name.toLowerCase() === needle);
}

/** Converte recipe → preset normalizado (aplicável via PresetStore / UI). */
export function recipeToPreset(recipe: AsciiRecipe): AsciiEnginePreset {
  const { kind: _kind, category: _category, ...rest } = recipe;
  const normalized = normalizePreset(rest);
  return {
    ...normalized,
    // Garante que apply via `preset.pipeline` (AsciiLab legado) também funciona.
    pipeline: presetToPipelinePatch(normalized),
  };
}

/** Patch de pipeline pronto para `mergePipelineOptions`. */
export function applyRecipe(recipe: AsciiRecipe | string): Partial<ImagePipelineOptions> {
  const resolved = typeof recipe === "string" ? getRecipe(recipe) : recipe;
  if (!resolved) throw new Error(`Recipe não encontrada: ${String(recipe)}`);
  return presetToPipelinePatch(recipeToPreset(resolved));
}

export function listRecipeCategories(): string[] {
  return [...new Set(BUILTIN_RECIPES.map((r) => r.category).filter(Boolean))] as string[];
}
