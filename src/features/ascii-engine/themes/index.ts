export type AsciiEngineThemeId =
  | "root-os"
  | "dos"
  | "crt"
  | "linux"
  | "amber"
  | "ibm"
  | "gameboy"
  | "windows-xp"
  | "matrix"
  | "monochrome";

export interface AsciiEngineThemeTokens {
  "--ae-bg": string;
  "--ae-panel": string;
  "--ae-border": string;
  "--ae-text": string;
  "--ae-text-dim": string;
  "--ae-accent": string;
  "--ae-accent-dim": string;
  "--ae-warn": string;
}

export interface AsciiEngineTheme {
  id: AsciiEngineThemeId;
  label: string;
  tokens: AsciiEngineThemeTokens;
}

export const ASCII_ENGINE_THEMES: AsciiEngineTheme[] = [
  {
    id: "root-os",
    label: "ROOT OS",
    tokens: {
      "--ae-bg": "oklch(0.07 0.01 260)",
      "--ae-panel": "oklch(0.11 0.015 260)",
      "--ae-border": "oklch(0.32 0.02 260)",
      "--ae-text": "oklch(0.88 0.01 260)",
      "--ae-text-dim": "oklch(0.62 0.01 260)",
      "--ae-accent": "oklch(0.78 0.18 145)",
      "--ae-accent-dim": "oklch(0.55 0.1 145)",
      "--ae-warn": "oklch(0.75 0.16 75)",
    },
  },
  {
    id: "dos",
    label: "DOS",
    tokens: {
      "--ae-bg": "#000000",
      "--ae-panel": "#0000aa",
      "--ae-border": "#55ffff",
      "--ae-text": "#aaaaaa",
      "--ae-text-dim": "#555555",
      "--ae-accent": "#ffffff",
      "--ae-accent-dim": "#55ffff",
      "--ae-warn": "#ffff55",
    },
  },
  {
    id: "crt",
    label: "CRT",
    tokens: {
      "--ae-bg": "#0a0f0a",
      "--ae-panel": "#0d1a0d",
      "--ae-border": "#1f3d1f",
      "--ae-text": "#9dff9d",
      "--ae-text-dim": "#4a7a4a",
      "--ae-accent": "#7dff7d",
      "--ae-accent-dim": "#3d6b3d",
      "--ae-warn": "#c8ff7d",
    },
  },
  {
    id: "linux",
    label: "Linux",
    tokens: {
      "--ae-bg": "#1e1e1e",
      "--ae-panel": "#252526",
      "--ae-border": "#3c3c3c",
      "--ae-text": "#cccccc",
      "--ae-text-dim": "#858585",
      "--ae-accent": "#4ec9b0",
      "--ae-accent-dim": "#2d7a6c",
      "--ae-warn": "#dcdcaa",
    },
  },
  {
    id: "amber",
    label: "Amber",
    tokens: {
      "--ae-bg": "#1a0f00",
      "--ae-panel": "#241500",
      "--ae-border": "#5c3a00",
      "--ae-text": "#ffb000",
      "--ae-text-dim": "#a66f00",
      "--ae-accent": "#ffcc33",
      "--ae-accent-dim": "#cc8800",
      "--ae-warn": "#ff6600",
    },
  },
  {
    id: "ibm",
    label: "IBM",
    tokens: {
      "--ae-bg": "#000000",
      "--ae-panel": "#0a0a2e",
      "--ae-border": "#1a1a5c",
      "--ae-text": "#c0c0ff",
      "--ae-text-dim": "#7070aa",
      "--ae-accent": "#5c5cff",
      "--ae-accent-dim": "#3a3acc",
      "--ae-warn": "#ff5c5c",
    },
  },
  {
    id: "gameboy",
    label: "GameBoy",
    tokens: {
      "--ae-bg": "#0f380f",
      "--ae-panel": "#306230",
      "--ae-border": "#8bac0f",
      "--ae-text": "#9bbc0f",
      "--ae-text-dim": "#8bac0f",
      "--ae-accent": "#9bbc0f",
      "--ae-accent-dim": "#306230",
      "--ae-warn": "#8bac0f",
    },
  },
  {
    id: "windows-xp",
    label: "Windows XP",
    tokens: {
      "--ae-bg": "#3a6ea5",
      "--ae-panel": "#ece9d8",
      "--ae-border": "#0054e3",
      "--ae-text": "#000000",
      "--ae-text-dim": "#555555",
      "--ae-accent": "#0054e3",
      "--ae-accent-dim": "#3a6ea5",
      "--ae-warn": "#ffcc00",
    },
  },
  {
    id: "matrix",
    label: "Matrix",
    tokens: {
      "--ae-bg": "#000000",
      "--ae-panel": "#001100",
      "--ae-border": "#003300",
      "--ae-text": "#00ff41",
      "--ae-text-dim": "#008f11",
      "--ae-accent": "#00ff41",
      "--ae-accent-dim": "#008f11",
      "--ae-warn": "#00ff41",
    },
  },
  {
    id: "monochrome",
    label: "Monochrome",
    tokens: {
      "--ae-bg": "#000000",
      "--ae-panel": "#111111",
      "--ae-border": "#333333",
      "--ae-text": "#ffffff",
      "--ae-text-dim": "#888888",
      "--ae-accent": "#ffffff",
      "--ae-accent-dim": "#aaaaaa",
      "--ae-warn": "#cccccc",
    },
  },
];

export function getTheme(id: AsciiEngineThemeId): AsciiEngineTheme {
  return ASCII_ENGINE_THEMES.find((t) => t.id === id) ?? ASCII_ENGINE_THEMES[0]!;
}

export function themeToCssVars(theme: AsciiEngineTheme): Record<string, string> {
  return { ...theme.tokens };
}

/** Mapeia tokens AE → aliases usados pelo lab atual (phosphor/ui). */
export function themeToLabCssVars(theme: AsciiEngineTheme): Record<string, string> {
  const t = theme.tokens;
  return {
    ...t,
    "--bg-void": t["--ae-bg"],
    "--bg-panel": t["--ae-panel"],
    "--ui-border": t["--ae-border"],
    "--ui-text": t["--ae-text"],
    "--ui-text-dim": t["--ae-text-dim"],
    "--phosphor-primary": t["--ae-accent"],
    "--phosphor-dim": t["--ae-accent-dim"],
    "--amber-led": t["--ae-warn"],
  };
}
