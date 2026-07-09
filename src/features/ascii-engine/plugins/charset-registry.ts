import { IMAGE_CHARSETS } from "@/features/ascii-interaction/image-pipeline";
import type { CharsetContribution } from "@/features/ascii-engine/plugins/types";

export interface CharsetEntry extends CharsetContribution {
  /** Plugin id that registered this charset, or `"builtin"`. */
  source: string;
}

/**
 * Registry de charsets do produto — built-ins + contribuições de plugins.
 * Não muta `IMAGE_CHARSETS`; o lab pode ler daqui para o select.
 */
export class CharsetRegistry {
  private readonly entries = new Map<string, CharsetEntry>();

  constructor(seed: Record<string, string> = IMAGE_CHARSETS) {
    for (const [id, glyphs] of Object.entries(seed)) {
      this.entries.set(id, { id, glyphs, label: id, source: "builtin" });
    }
  }

  register(contribution: CharsetContribution, source = "plugin"): void {
    if (!contribution.id || typeof contribution.glyphs !== "string") {
      throw new Error("CharsetContribution requires id and glyphs string");
    }
    this.entries.set(contribution.id, {
      id: contribution.id,
      glyphs: contribution.glyphs,
      label: contribution.label ?? contribution.id,
      source,
    });
  }

  get(id: string): CharsetEntry | undefined {
    return this.entries.get(id);
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  list(): CharsetEntry[] {
    return [...this.entries.values()];
  }

  /** Snapshot id→glyphs para selects / pipeline options. */
  toRecord(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const e of this.entries.values()) {
      out[e.id] = e.glyphs;
    }
    return out;
  }
}

export const defaultCharsetRegistry = new CharsetRegistry();
