import { stripAnsi } from "@/features/ascii/ansi";

export type BoxStyle = "single" | "double";

const BOX: Record<BoxStyle, { tl: string; tr: string; bl: string; br: string; h: string; v: string }> =
  {
    single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
    double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  };

export function boxLines(
  content: string | string[],
  opts: { title?: string; style?: BoxStyle; paddingX?: number } = {},
): string[] {
  const style = opts.style ?? "double";
  const paddingX = opts.paddingX ?? 1;
  const parts = BOX[style];
  const lines = Array.isArray(content) ? content : content.split("\n");

  const stripped = lines.map((l) => stripAnsi(l));
  const width = Math.max(0, ...stripped.map((l) => l.length));
  const innerWidth = width + paddingX * 2;

  const title = opts.title ? ` ${opts.title} ` : "";
  const top = (() => {
    if (!title) return `${parts.tl}${parts.h.repeat(innerWidth)}${parts.tr}`;
    const usable = Math.max(0, innerWidth - title.length);
    const left = Math.floor(usable / 2);
    const right = usable - left;
    return `${parts.tl}${parts.h.repeat(left)}${title}${parts.h.repeat(right)}${parts.tr}`;
  })();

  const mid = lines.map((line, idx) => {
    const raw = line;
    const visible = stripped[idx] ?? "";
    const pad = " ".repeat(Math.max(0, width - visible.length));
    return `${parts.v}${" ".repeat(paddingX)}${raw}${pad}${" ".repeat(paddingX)}${parts.v}`;
  });

  const bottom = `${parts.bl}${parts.h.repeat(innerWidth)}${parts.br}`;
  return [top, ...mid, bottom];
}

