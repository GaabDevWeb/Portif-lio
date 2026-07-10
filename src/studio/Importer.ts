import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { mergeAsciiConfig } from "@/features/ascii-interaction/config";

/** Importa JSON parcial e mescla com defaults da engine. */
export function importLabConfig(json: string): AsciiInteractionConfig | null {
  try {
    const parsed = JSON.parse(json) as Partial<AsciiInteractionConfig>;
    if (!parsed || typeof parsed !== "object") return null;
    return mergeAsciiConfig(parsed);
  } catch {
    return null;
  }
}

/** Abre seletor de arquivo e retorna config parseada. */
export function pickAndImportLabConfig(): Promise<AsciiInteractionConfig | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const text = await file.text();
      resolve(importLabConfig(text));
    };
    input.click();
  });
}
