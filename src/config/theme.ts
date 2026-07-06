import type { TerminalTheme } from "@/types/root-os";

export const phosphorTerminalTheme: TerminalTheme = {
  background: "#0a120a",
  foreground: "#9dff9d",
  cursor: "#9dff9d",
  selectionBackground: "rgba(157, 255, 157, 0.25)",
  black: "#0a120a",
  red: "#e06c75",
  green: "#9dff9d",
  yellow: "#e5c07b",
  blue: "#61afef",
  magenta: "#c678dd",
  cyan: "#56b6c2",
  white: "#abb2bf",
  brightBlack: "#5c6370",
  brightRed: "#e06c75",
  brightGreen: "#98c379",
  brightYellow: "#e5c07b",
  brightBlue: "#61afef",
  brightMagenta: "#c678dd",
  brightCyan: "#56b6c2",
  brightWhite: "#ffffff",
};

export const designTokens = {
  bgVoid: "oklch(0.08 0.01 260)",
  bgTerminal: "oklch(0.12 0.02 145)",
  phosphorPrimary: "oklch(0.78 0.18 145)",
  phosphorDim: "oklch(0.55 0.10 145)",
  amberLed: "oklch(0.75 0.16 75)",
  stderr: "oklch(0.65 0.20 25)",
  uiChrome: "oklch(0.18 0.01 260)",
  uiBorder: "oklch(0.35 0.02 260)",
  uiText: "oklch(0.88 0.01 260)",
  accentLink: "oklch(0.72 0.12 230)",
} as const;
