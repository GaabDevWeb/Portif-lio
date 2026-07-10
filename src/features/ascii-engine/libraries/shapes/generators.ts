/**
 * Geradores procedurais de shapes ASCII (boxes, windows, HUD widgets).
 * Devolvem string multilinha → TextObject ou ImageObject via helpers.
 */

export type ProceduralShapeKind =
  | "box"
  | "window"
  | "button"
  | "card"
  | "banner"
  | "terminal"
  | "monitor"
  | "panel";

export interface ProceduralShapeOptions {
  width?: number;
  height?: number;
  title?: string;
  label?: string;
  char?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hLine(w: number, left: string, mid: string, right: string): string {
  if (w <= 2) return left + right;
  return left + mid.repeat(w - 2) + right;
}

function padCenter(text: string, w: number): string {
  if (text.length >= w) return text.slice(0, w);
  const pad = w - text.length;
  const left = Math.floor(pad / 2);
  return " ".repeat(left) + text + " ".repeat(pad - left);
}

function emptyRow(w: number, left: string, right: string): string {
  return left + " ".repeat(Math.max(0, w - 2)) + right;
}

export function generateBox(options: ProceduralShapeOptions = {}): string {
  const w = clamp(options.width ?? 12, 3, 80);
  const h = clamp(options.height ?? 5, 3, 40);
  const lines = [hLine(w, "+", "-", "+")];
  for (let i = 0; i < h - 2; i++) lines.push(emptyRow(w, "|", "|"));
  lines.push(hLine(w, "+", "-", "+"));
  return lines.join("\n");
}

export function generateWindow(options: ProceduralShapeOptions = {}): string {
  const w = clamp(options.width ?? 16, 8, 80);
  const h = clamp(options.height ?? 7, 5, 40);
  const title = options.title ?? "window";
  const titleBar = `[${title}]`.slice(0, w - 4);
  const lines = [
    hLine(w, "+", "-", "+"),
    "|" + padCenter(titleBar, w - 2) + "|",
    hLine(w, "+", "-", "+"),
  ];
  for (let i = 0; i < h - 4; i++) lines.push(emptyRow(w, "|", "|"));
  lines.push(hLine(w, "+", "-", "+"));
  return lines.join("\n");
}

export function generateButton(options: ProceduralShapeOptions = {}): string {
  const label = options.label ?? "OK";
  const inner = ` ${label} `;
  const w = clamp(options.width ?? inner.length + 2, inner.length + 2, 40);
  return [hLine(w, "[", "=", "]"), "|" + padCenter(inner, w - 2) + "|", hLine(w, "[", "=", "]")].join(
    "\n",
  );
}

export function generateCard(options: ProceduralShapeOptions = {}): string {
  const w = clamp(options.width ?? 14, 8, 80);
  const h = clamp(options.height ?? 6, 4, 40);
  const title = (options.title ?? "Card").slice(0, w - 4);
  const lines = [
    hLine(w, ".", "-", "."),
    ":" + padCenter(title, w - 2) + ":",
    hLine(w, ":", "-", ":"),
  ];
  for (let i = 0; i < h - 4; i++) lines.push(emptyRow(w, ":", ":"));
  lines.push(hLine(w, "'", "-", "'"));
  return lines.join("\n");
}

export function generateBanner(options: ProceduralShapeOptions = {}): string {
  const label = options.label ?? options.title ?? "BANNER";
  const w = clamp(options.width ?? Math.max(label.length + 4, 12), 6, 80);
  return [
    hLine(w, "/", "=", "\\"),
    "|" + padCenter(label, w - 2) + "|",
    hLine(w, "\\", "=", "/"),
  ].join("\n");
}

export function generateTerminal(options: ProceduralShapeOptions = {}): string {
  const w = clamp(options.width ?? 20, 10, 80);
  const h = clamp(options.height ?? 6, 4, 40);
  const lines = [
    hLine(w, "┌", "─", "┐"),
    "│" + padCenter(" terminal ", w - 2) + "│",
    hLine(w, "├", "─", "┤"),
  ];
  for (let i = 0; i < h - 4; i++) {
    const content = i === h - 5 ? " $ _" : "";
    lines.push("│" + (content + " ".repeat(Math.max(0, w - 2 - content.length))).slice(0, w - 2) + "│");
  }
  lines.push(hLine(w, "└", "─", "┘"));
  return lines.join("\n");
}

export function generateMonitor(options: ProceduralShapeOptions = {}): string {
  const w = clamp(options.width ?? 18, 10, 80);
  const h = clamp(options.height ?? 8, 5, 40);
  const lines = [hLine(w, "╔", "═", "╗")];
  for (let i = 0; i < h - 3; i++) lines.push(emptyRow(w, "║", "║"));
  lines.push(hLine(w, "╚", "═", "╝"));
  lines.push(padCenter("══╤══", w));
  lines.push(padCenter("└─┘", w));
  return lines.join("\n");
}

export function generatePanel(options: ProceduralShapeOptions = {}): string {
  const w = clamp(options.width ?? 16, 6, 80);
  const h = clamp(options.height ?? 5, 3, 40);
  const title = (options.title ?? "PANEL").slice(0, w - 2);
  const lines = ["#" + padCenter(title, w - 2) + "#"];
  for (let i = 0; i < h - 2; i++) lines.push("#" + " ".repeat(w - 2) + "#");
  lines.push("#".repeat(w));
  return lines.join("\n");
}

const GENERATORS: Record<ProceduralShapeKind, (o?: ProceduralShapeOptions) => string> = {
  box: generateBox,
  window: generateWindow,
  button: generateButton,
  card: generateCard,
  banner: generateBanner,
  terminal: generateTerminal,
  monitor: generateMonitor,
  panel: generatePanel,
};

export function generateProceduralShape(
  kind: ProceduralShapeKind,
  options: ProceduralShapeOptions = {},
): string {
  return GENERATORS[kind](options);
}

export function listProceduralShapeKinds(): ProceduralShapeKind[] {
  return Object.keys(GENERATORS) as ProceduralShapeKind[];
}
