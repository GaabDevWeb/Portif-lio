import type { KGColorToken } from "@/lib/content/knowledge-graph";

const FALLBACK_COLORS: Record<KGColorToken, string> = {
  primary: "oklch(0.78 0.18 145)",
  accent: "oklch(0.72 0.08 230)",
  dim: "oklch(0.55 0.1 145)",
  amber: "oklch(0.75 0.16 75)",
  text: "oklch(0.88 0.01 260)",
  muted: "oklch(0.62 0.01 260)",
  link: "oklch(0.72 0.12 230)",
};

const CSS_VAR_MAP: Record<KGColorToken, string> = {
  primary: "--phosphor-primary",
  accent: "--accent-data",
  dim: "--phosphor-dim",
  amber: "--amber-led",
  text: "--ui-text",
  muted: "--ui-text-dim",
  link: "--accent-link",
};

export function resolveNodeColor(token: KGColorToken): string {
  if (typeof window === "undefined") return FALLBACK_COLORS[token];
  const cssVar = CSS_VAR_MAP[token];
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || FALLBACK_COLORS[token];
}

export function resolveThemeColors() {
  if (typeof window === "undefined") {
    return {
      background: "oklch(0.07 0.01 260)",
      linkDim: "oklch(0.32 0.02 260)",
      linkBright: "oklch(0.55 0.1 145)",
      label: "oklch(0.62 0.01 260)",
      labelBright: "oklch(0.88 0.01 260)",
    };
  }
  const root = document.documentElement;
  const get = (v: string, fb: string) =>
    getComputedStyle(root).getPropertyValue(v).trim() || fb;

  return {
    background: get("--bg-void", FALLBACK_COLORS.text),
    linkDim: get("--ui-border", "oklch(0.32 0.02 260)"),
    linkBright: get("--phosphor-dim", FALLBACK_COLORS.dim),
    label: get("--ui-text-dim", FALLBACK_COLORS.muted),
    labelBright: get("--ui-text", FALLBACK_COLORS.text),
  };
}

export function nodeRadius(type: string, level = 50): number {
  const base: Record<string, number> = {
    project: 7,
    skill: 5,
    framework: 4.5,
    technology: 4,
    language: 3.5,
    tool: 3.5,
    concept: 4,
  };
  const b = base[type] ?? 4;
  return b + (level / 100) * 2;
}
