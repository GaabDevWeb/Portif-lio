import {
  ASCII_ENGINE_THEMES,
  type AsciiEngineTheme,
  type AsciiEngineThemeTokens,
} from "@/features/ascii-engine/themes";
import type { ThemeContribution } from "@/features/ascii-engine/plugins/types";

export interface ThemeEntry {
  id: string;
  label: string;
  tokens: AsciiEngineThemeTokens;
  source: string;
}

/**
 * Themes built-in + contribuições de plugins (ids string livres).
 * Built-ins continuam em `ASCII_ENGINE_THEMES`; este registry é a vista unificada.
 */
export class ThemeRegistry {
  private readonly entries = new Map<string, ThemeEntry>();

  constructor(seed: AsciiEngineTheme[] = ASCII_ENGINE_THEMES) {
    for (const t of seed) {
      this.entries.set(t.id, {
        id: t.id,
        label: t.label,
        tokens: t.tokens,
        source: "builtin",
      });
    }
  }

  register(contribution: ThemeContribution, source = "plugin"): void {
    if (!contribution.id || !contribution.tokens) {
      throw new Error("ThemeContribution requires id and tokens");
    }
    this.entries.set(contribution.id, {
      id: contribution.id,
      label: contribution.label,
      tokens: contribution.tokens,
      source,
    });
  }

  get(id: string): ThemeEntry | undefined {
    return this.entries.get(id);
  }

  list(): ThemeEntry[] {
    return [...this.entries.values()];
  }
}

export const defaultThemeRegistry = new ThemeRegistry();
