import type { AsciiEnginePreset } from "@/features/ascii-engine/presets";

/** Recipe = preset v2 product-facing (mesmo schema, `kind: "recipe"`). */
export interface AsciiRecipe extends AsciiEnginePreset {
  kind: "recipe";
  category?: string;
}

export type RecipeCategory =
  | "terminal"
  | "art"
  | "tone"
  | "retro"
  | (string & {});
