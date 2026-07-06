import type { AnsiColor } from "@/features/ascii/types";

export type AsciiTheme = {
  stdout: AnsiColor;
  stderr: AnsiColor;
  accent: AnsiColor;
  dim: AnsiColor;
  warn: AnsiColor;
  ok: AnsiColor;
  err: AnsiColor;
};

export const ROOT_OS_THEME: AsciiTheme = {
  stdout: "green",
  stderr: "red",
  accent: "cyan",
  dim: "dim",
  warn: "yellow",
  ok: "green",
  err: "red",
};

