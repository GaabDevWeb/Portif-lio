import type { AnsiColor } from "@/features/ascii/types";

const ESC = "\u001b[";

const CODES: Record<AnsiColor, string> = {
  reset: "0m",
  dim: "2m",
  bold: "1m",
  green: "32m",
  red: "31m",
  yellow: "33m",
  blue: "34m",
  magenta: "35m",
  cyan: "36m",
  gray: "90m",
};

export function ansi(color: AnsiColor): string {
  return `${ESC}${CODES[color]}`;
}

const ANSI_RE = /\u001b\[[0-9;]*m/g;

export function hasAnsi(input: string): boolean {
  return ANSI_RE.test(input);
}

export function stripAnsi(input: string): string {
  return input.replaceAll(ANSI_RE, "");
}

