import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

/** Exporta configuração atual como JSON formatado. */
export function exportLabConfig(config: AsciiInteractionConfig): string {
  const serializable = {
    ...config,
    parallax: [...config.parallax],
    breakpoints: {
      mobile: { ...config.breakpoints.mobile },
      tablet: { ...config.breakpoints.tablet },
    },
  };
  return JSON.stringify(serializable, null, 2);
}

/** Dispara download do JSON no browser. */
export function downloadLabConfig(config: AsciiInteractionConfig, filename = "ascii-lab-config.json"): void {
  const blob = new Blob([exportLabConfig(config)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
