/** Shared ASCII → PNG/SVG helpers for Library (Icons + Gallery). */

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const FONT_SIZE = 11;
const LINE_HEIGHT = FONT_SIZE * 1.25;
const CHAR_WIDTH = FONT_SIZE * 0.62;
const CANVAS_PADDING = 8;

export function getPhosphorColor(): string {
  if (typeof document === "undefined") return "#39ff14";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--phosphor-primary")
    .trim();
  return value || "#39ff14";
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function asciiToSvg(ascii: string, color: string = getPhosphorColor()): string {
  const lines = ascii.split("\n");
  const maxLen = Math.max(...lines.map((line) => line.length), 1);
  const width = Math.ceil(maxLen * CHAR_WIDTH + CANVAS_PADDING * 2);
  const height = Math.ceil(lines.length * LINE_HEIGHT + CANVAS_PADDING * 2);

  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? FONT_SIZE : LINE_HEIGHT;
      return `<tspan x="${CANVAS_PADDING}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<text font-family="${MONO_FONT}" font-size="${FONT_SIZE}" fill="${color}">${tspans}</text>`,
    `</svg>`,
  ].join("");
}

export function renderAsciiToPng(
  ascii: string,
  color: string = getPhosphorColor(),
): Promise<Blob> {
  const lines = ascii.split("\n");
  const maxLen = Math.max(...lines.map((line) => line.length), 1);
  const width = Math.ceil(maxLen * CHAR_WIDTH + CANVAS_PADDING * 2);
  const height = Math.ceil(lines.length * LINE_HEIGHT + CANVAS_PADDING * 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Canvas 2D unavailable"));
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${FONT_SIZE}px ${MONO_FONT}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    ctx.fillText(line, CANVAS_PADDING, CANVAS_PADDING + index * LINE_HEIGHT);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png");
  });
}
