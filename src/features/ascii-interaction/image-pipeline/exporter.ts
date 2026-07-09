import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  canvasToPngBlob,
  renderMatrixToCanvas,
  type MatrixRenderOptions,
} from "@/features/ascii-interaction/image-pipeline/render-utils";

/** Converte matriz em string multilinha compatível com parseAsciiSource. */
export function matrixToAsciiSource(matrix: AsciiMatrix): string {
  const grid: string[][] = Array.from({ length: matrix.rows }, () =>
    Array.from({ length: matrix.cols }, () => " "),
  );

  for (const cell of matrix.cells) {
    if (cell.row < matrix.rows && cell.col < matrix.cols) {
      grid[cell.row]![cell.col] = cell.char;
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}

export function matrixToJson(matrix: AsciiMatrix): string {
  return JSON.stringify(matrix, null, 2);
}

export function matrixToHtml(
  matrix: AsciiMatrix,
  targetWidth?: number,
  targetHeight?: number,
): string {
  const source = matrixToAsciiSource(matrix);
  const escaped = source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const fontSize =
    targetHeight != null
      ? Math.max(8, Math.floor(targetHeight / matrix.rows * 0.85))
      : 10;

  const width = targetWidth ?? matrix.cols * 7;
  const height = targetHeight ?? matrix.rows * 12;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{margin:0;background:#0a120a;color:#9dff9d;width:${width}px;height:${height}px;overflow:hidden;}
pre{margin:0;font:${fontSize}px "Courier New",monospace;line-height:${fontSize * 1.15}px;white-space:pre;}
</style></head><body><pre>${escaped}</pre></body></html>`;
}

export function matrixToSvg(
  matrix: AsciiMatrix,
  targetWidth?: number,
  targetHeight?: number,
): string {
  const cellW = targetWidth != null ? targetWidth / matrix.cols : 7;
  const cellH = targetHeight != null ? targetHeight / matrix.rows : 12;
  const svgW = targetWidth ?? matrix.cols * cellW;
  const svgH = targetHeight ?? matrix.rows * cellH;
  const fontSize = Math.max(1, cellH * 0.85);

  const lines: string[] = [];
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`,
  );
  lines.push(`<rect width="100%" height="100%" fill="#0a120a"/>`);

  for (const cell of matrix.cells) {
    const x = cell.col * cellW;
    const y = (cell.row + 1) * cellH - cellH * 0.08;
    const fill = `rgb(${Math.round(cell.r)},${Math.round(cell.g)},${Math.round(cell.b)})`;
    const escaped = cell.char
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    lines.push(
      `<text x="${x}" y="${y}" fill="${fill}" font-family="Courier New,monospace" font-size="${fontSize}">${escaped}</text>`,
    );
  }

  lines.push("</svg>");
  return lines.join("");
}

export function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface MatrixExportOptions {
  basename?: string;
  sourceWidth?: number;
  sourceHeight?: number;
}

export function downloadMatrix(
  matrix: AsciiMatrix,
  format: "txt" | "json" | "html" | "svg",
  options: MatrixExportOptions = {},
): void {
  const basename = options.basename ?? "ascii-art";
  const { sourceWidth, sourceHeight } = options;

  switch (format) {
    case "txt":
      downloadText(matrixToAsciiSource(matrix), `${basename}.txt`, "text/plain");
      break;
    case "json":
      downloadText(matrixToJson(matrix), `${basename}.json`, "application/json");
      break;
    case "html":
      downloadText(
        matrixToHtml(matrix, sourceWidth, sourceHeight),
        `${basename}.html`,
        "text/html",
      );
      break;
    case "svg":
      downloadText(
        matrixToSvg(matrix, sourceWidth, sourceHeight),
        `${basename}.svg`,
        "image/svg+xml",
      );
      break;
    default:
      break;
  }
}

export async function renderMatrixToPng(
  matrix: AsciiMatrix,
  options: MatrixRenderOptions = {},
): Promise<Blob> {
  const canvas = renderMatrixToCanvas(matrix, options);
  return canvasToPngBlob(canvas);
}

export async function downloadMatrixPng(
  matrix: AsciiMatrix,
  options: MatrixExportOptions = {},
): Promise<void> {
  const basename = options.basename ?? "ascii-art";
  const blob = await renderMatrixToPng(matrix, {
    targetWidth: options.sourceWidth,
    targetHeight: options.sourceHeight,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${basename}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export type CopyAsciiResult = "copied" | "unsupported" | "error";

/** Copia arte ASCII para clipboard preservando formatação exata. */
export async function copyAsciiToClipboard(text: string): Promise<CopyAsciiResult> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return "unsupported";
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "error";
  }
}
