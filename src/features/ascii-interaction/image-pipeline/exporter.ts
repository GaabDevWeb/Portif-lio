import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  canvasToPngBlob,
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
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

function escapeHtmlChar(ch: string): string {
  return ch
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * HTML com RGB por célula (AsciiMatrix.cells[].r/g/b).
 * Evita o gap mono-only do export legado (cor única no `<pre>`).
 */
export function matrixToHtml(
  matrix: AsciiMatrix,
  targetWidth?: number,
  targetHeight?: number,
): string {
  const fontSize =
    targetHeight != null
      ? Math.max(8, Math.floor((targetHeight / matrix.rows) * 0.85))
      : 10;

  const width = targetWidth ?? matrix.cols * 7;
  const height = targetHeight ?? matrix.rows * 12;

  const grid: (AsciiMatrix["cells"][number] | null)[][] = Array.from(
    { length: matrix.rows },
    () => Array.from({ length: matrix.cols }, () => null),
  );
  for (const cell of matrix.cells) {
    if (cell.row < matrix.rows && cell.col < matrix.cols) {
      grid[cell.row]![cell.col] = cell;
    }
  }

  const body: string[] = [];
  for (let row = 0; row < matrix.rows; row++) {
    for (let col = 0; col < matrix.cols; col++) {
      const cell = grid[row]![col];
      if (!cell) {
        body.push(" ");
        continue;
      }
      const r = Math.round(cell.r);
      const g = Math.round(cell.g);
      const b = Math.round(cell.b);
      body.push(
        `<span style="color:rgb(${r},${g},${b})">${escapeHtmlChar(cell.char)}</span>`,
      );
    }
    if (row < matrix.rows - 1) body.push("\n");
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{margin:0;background:#0a120a;width:${width}px;height:${height}px;overflow:hidden;}
pre{margin:0;font:${fontSize}px "Courier New",monospace;line-height:${fontSize * 1.15}px;white-space:pre;}
</style></head><body><pre>${body.join("")}</pre></body></html>`;
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
  /** When true, PNG/HTML/SVG match source pixel size. Default: cell metrics (preview parity). */
  matchSourceResolution?: boolean;
  sourceWidth?: number;
  sourceHeight?: number;
  cellW?: number;
  cellH?: number;
  /** PNG only — characters on transparent canvas. */
  transparentBackground?: boolean;
}

export function downloadMatrix(
  matrix: AsciiMatrix,
  format: "txt" | "json" | "html" | "svg",
  options: MatrixExportOptions = {},
): void {
  const basename = options.basename ?? "ascii-art";
  const useSource =
    options.matchSourceResolution === true &&
    options.sourceWidth != null &&
    options.sourceHeight != null;
  const width = useSource
    ? options.sourceWidth
    : matrix.cols * (options.cellW ?? DEFAULT_MATRIX_CELL_W);
  const height = useSource
    ? options.sourceHeight
    : matrix.rows * (options.cellH ?? DEFAULT_MATRIX_CELL_H);

  switch (format) {
    case "txt":
      downloadText(matrixToAsciiSource(matrix), `${basename}.txt`, "text/plain");
      break;
    case "json":
      downloadText(matrixToJson(matrix), `${basename}.json`, "application/json");
      break;
    case "html":
      downloadText(matrixToHtml(matrix, width, height), `${basename}.html`, "text/html");
      break;
    case "svg":
      downloadText(matrixToSvg(matrix, width, height), `${basename}.svg`, "image/svg+xml");
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
  const useSource =
    options.matchSourceResolution === true &&
    options.sourceWidth != null &&
    options.sourceHeight != null;
  const blob = await renderMatrixToPng(matrix, {
    ...(useSource
      ? { targetWidth: options.sourceWidth, targetHeight: options.sourceHeight }
      : {
          cellW: options.cellW ?? DEFAULT_MATRIX_CELL_W,
          cellH: options.cellH ?? DEFAULT_MATRIX_CELL_H,
        }),
    transparentBackground: options.transparentBackground === true,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${basename}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Pack still conversion: manifest + ascii.txt + preview.png + metadata.json */
export async function downloadMatrixZip(
  matrix: AsciiMatrix,
  options: MatrixExportOptions & {
    pipeline?: Record<string, unknown>;
  } = {},
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const basename = options.basename ?? "ascii-art";
  const zip = new JSZip();
  const ascii = matrixToAsciiSource(matrix);
  const useSource =
    options.matchSourceResolution === true &&
    options.sourceWidth != null &&
    options.sourceHeight != null;
  const png = await renderMatrixToPng(matrix, {
    ...(useSource
      ? { targetWidth: options.sourceWidth, targetHeight: options.sourceHeight }
      : {
          cellW: options.cellW ?? DEFAULT_MATRIX_CELL_W,
          cellH: options.cellH ?? DEFAULT_MATRIX_CELL_H,
        }),
    transparentBackground: options.transparentBackground !== false,
  });

  const manifest = {
    version: 1,
    format: "ascii-engine-still",
    cols: matrix.cols,
    rows: matrix.rows,
    charset: matrix.charset,
    matchSourceResolution: Boolean(options.matchSourceResolution),
    sourceWidth: options.sourceWidth ?? null,
    sourceHeight: options.sourceHeight ?? null,
  };
  const metadata = {
    exportedAt: new Date().toISOString(),
    characterCount: matrix.cells.length,
    pipeline: options.pipeline ?? null,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("ascii.txt", ascii);
  zip.file("preview.png", png);
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${basename}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export type CopyAsciiResult = "copied" | "unsupported" | "error";

/** Copia arte ASCII para clipboard preservando formatação exata. */
export async function copyAsciiToClipboard(text: string): Promise<CopyAsciiResult> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // fallback abaixo (ex.: permissões / contexto inseguro)
    }
  }

  if (typeof document === "undefined") return "unsupported";

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok ? "copied" : "unsupported";
  } catch {
    return "error";
  }
}
