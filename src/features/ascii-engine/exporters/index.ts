import { downloadBlob, writeHtmlToClipboard, writeTextToClipboard } from "@/features/ascii-engine/browser";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ProjectDocument } from "@/features/ascii-engine/document";
import { downloadProjectZip } from "@/features/ascii-engine/storage";
import {
  downloadMatrix,
  downloadMatrixPng,
  matrixToAsciiSource,
  matrixToHtml,
  matrixToJson,
  matrixToSvg,
} from "@/features/ascii-interaction/image-pipeline/exporter";
import {
  canvasToPngBlob,
  renderMatrixToCanvas,
  resolveMatrixRenderDimensions,
} from "@/features/ascii-interaction/image-pipeline/render-utils";
import {
  downloadAsciiAnimationGif,
  downloadAsciiAnimationTxtSequence,
  downloadAsciiAnimationZip,
} from "@/features/ascii-interaction/animation-pipeline";

function downloadText(content: string, filename: string, mime = "text/plain"): void {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename);
}

export type ExportFormatId =
  | "txt"
  | "json"
  | "html"
  | "svg"
  | "png"
  | "ansi"
  | "markdown"
  | "zip"
  | "gif"
  | "txt-sequence"
  | "project"
  | "pdf"
  | "sprite-sheet"
  | "clipboard";

export type ClipboardExportFormat = "txt" | "html";

export interface ExporterDescriptor {
  id: ExportFormatId;
  label: string;
  status: "ready" | "stub";
  target: "matrix" | "animation" | "project" | "both";
}

export const EXPORTER_CATALOG: ExporterDescriptor[] = [
  { id: "txt", label: "TXT", status: "ready", target: "matrix" },
  { id: "json", label: "JSON", status: "ready", target: "matrix" },
  { id: "html", label: "HTML", status: "ready", target: "matrix" },
  { id: "svg", label: "SVG", status: "ready", target: "matrix" },
  { id: "png", label: "PNG", status: "ready", target: "matrix" },
  { id: "ansi", label: "ANSI", status: "ready", target: "matrix" },
  { id: "markdown", label: "Markdown", status: "ready", target: "matrix" },
  { id: "clipboard", label: "Clipboard", status: "ready", target: "both" },
  { id: "zip", label: "ASCII ZIP", status: "ready", target: "animation" },
  { id: "gif", label: "GIF", status: "ready", target: "animation" },
  { id: "txt-sequence", label: "TXT Sequence", status: "ready", target: "animation" },
  { id: "sprite-sheet", label: "Sprite Sheet", status: "ready", target: "animation" },
  { id: "project", label: "Project ZIP", status: "ready", target: "project" },
  { id: "pdf", label: "PDF", status: "stub", target: "both" },
];

export async function exportProject(doc: ProjectDocument): Promise<void> {
  await downloadProjectZip(doc);
}

/** ANSI truecolor (24-bit) — preserva RGB por célula. */
export function matrixToAnsi(matrix: AsciiMatrix): string {
  const grid: Array<Array<{ char: string; r: number; g: number; b: number } | null>> = Array.from(
    { length: matrix.rows },
    () => Array.from({ length: matrix.cols }, () => null),
  );

  for (const cell of matrix.cells) {
    if (cell.row < matrix.rows && cell.col < matrix.cols) {
      grid[cell.row]![cell.col] = {
        char: cell.char,
        r: Math.round(cell.r),
        g: Math.round(cell.g),
        b: Math.round(cell.b),
      };
    }
  }

  const reset = "\x1b[0m";
  const lines: string[] = [];
  for (let row = 0; row < matrix.rows; row++) {
    let line = "";
    for (let col = 0; col < matrix.cols; col++) {
      const cell = grid[row]![col];
      if (!cell || cell.char === " ") {
        line += " ";
        continue;
      }
      line += `\x1b[38;2;${cell.r};${cell.g};${cell.b}m${cell.char}`;
    }
    lines.push(line + reset);
  }
  return lines.join("\n");
}

function matrixToMarkdown(matrix: AsciiMatrix): string {
  return ["```text", matrixToAsciiSource(matrix), "```", ""].join("\n");
}

export interface SpriteSheetOptions {
  columns?: number;
  cellW?: number;
  cellH?: number;
  gap?: number;
  backgroundColor?: string;
  basename?: string;
}

/** Monta atlas PNG horizontal/grid com todos os frames da animação. */
export async function renderAnimationSpriteSheet(
  animation: AsciiAnimation,
  options: SpriteSheetOptions = {},
): Promise<Blob> {
  if (animation.frames.length === 0) {
    throw new Error("Animação sem frames para sprite sheet.");
  }

  const first = animation.frames[0]!.matrix;
  const dims = resolveMatrixRenderDimensions(first, {
    cellW: options.cellW,
    cellH: options.cellH,
  });
  const gap = options.gap ?? 0;
  const columns = Math.max(
    1,
    options.columns ?? Math.ceil(Math.sqrt(animation.frames.length)),
  );
  const rows = Math.ceil(animation.frames.length / columns);

  const sheet = document.createElement("canvas");
  sheet.width = Math.max(1, columns * dims.width + Math.max(0, columns - 1) * gap);
  sheet.height = Math.max(1, rows * dims.height + Math.max(0, rows - 1) * gap);
  const ctx = sheet.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível para sprite sheet.");

  ctx.fillStyle = options.backgroundColor ?? "#0a120a";
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  for (let i = 0; i < animation.frames.length; i++) {
    const frame = animation.frames[i]!;
    const col = i % columns;
    const row = Math.floor(i / columns);
    const frameCanvas = renderMatrixToCanvas(frame.matrix, {
      cellW: dims.cellW,
      cellH: dims.cellH,
      backgroundColor: options.backgroundColor ?? "#0a120a",
    });
    ctx.drawImage(
      frameCanvas,
      col * (dims.width + gap),
      row * (dims.height + gap),
    );
  }

  return canvasToPngBlob(sheet);
}

export async function downloadAnimationSpriteSheet(
  animation: AsciiAnimation,
  options: SpriteSheetOptions = {},
): Promise<void> {
  const blob = await renderAnimationSpriteSheet(animation, options);
  downloadBlob(blob, `${options.basename ?? "sprite-sheet"}.png`);
}

export async function exportMatrixToClipboard(
  matrix: AsciiMatrix,
  format: ClipboardExportFormat = "txt",
  options: { sourceWidth?: number; sourceHeight?: number } = {},
): Promise<"copied" | "unsupported" | "error"> {
  if (format === "html") {
    const html = matrixToHtml(matrix, options.sourceWidth, options.sourceHeight);
    return writeHtmlToClipboard(html, matrixToAsciiSource(matrix));
  }
  return writeTextToClipboard(matrixToAsciiSource(matrix));
}

export async function exportAnimationToClipboard(
  animation: AsciiAnimation,
  format: ClipboardExportFormat = "txt",
): Promise<"copied" | "unsupported" | "error"> {
  const first = animation.frames[0]?.matrix;
  if (!first) return "error";
  if (format === "html") {
    const html = matrixToHtml(first, animation.width, animation.height);
    return writeHtmlToClipboard(html, matrixToAsciiSource(first));
  }
  // TXT: todos os frames separados
  const text = animation.frames
    .map((f, i) => `--- frame ${i} (${f.delayMs}ms) ---\n${matrixToAsciiSource(f.matrix)}`)
    .join("\n\n");
  return writeTextToClipboard(text);
}

export async function exportMatrix(
  matrix: AsciiMatrix,
  format: ExportFormatId,
  options: { sourceWidth?: number; sourceHeight?: number; basename?: string } = {},
): Promise<void> {
  const basename = options.basename ?? "ascii-art";
  switch (format) {
    case "txt":
    case "json":
    case "html":
    case "svg":
      downloadMatrix(matrix, format, options);
      return;
    case "png":
      await downloadMatrixPng(matrix, options);
      return;
    case "ansi":
      downloadText(matrixToAnsi(matrix), `${basename}.ans`, "text/plain");
      return;
    case "markdown":
      downloadText(matrixToMarkdown(matrix), `${basename}.md`, "text/markdown");
      return;
    case "clipboard": {
      const result = await exportMatrixToClipboard(matrix, "txt", options);
      if (result !== "copied") throw new Error(`Clipboard: ${result}`);
      return;
    }
    case "pdf":
      throw new Error(`Export "${format}" ainda é stub.`);
    default:
      throw new Error(`Formato ${format} não aplicável a matriz estática.`);
  }
}

export async function exportAnimation(
  animation: AsciiAnimation,
  format: ExportFormatId,
  onProgress?: (p: { completed: number; total: number; percent: number }) => void,
  options: SpriteSheetOptions = {},
): Promise<void> {
  switch (format) {
    case "zip":
      await downloadAsciiAnimationZip(animation);
      return;
    case "gif":
      await downloadAsciiAnimationGif(animation, "animation.gif", onProgress);
      return;
    case "txt-sequence":
      await downloadAsciiAnimationTxtSequence(animation);
      return;
    case "json":
      downloadText(JSON.stringify(animation, null, 2), "animation.json", "application/json");
      return;
    case "sprite-sheet":
      await downloadAnimationSpriteSheet(animation, options);
      return;
    case "clipboard": {
      const result = await exportAnimationToClipboard(animation, "txt");
      if (result !== "copied") throw new Error(`Clipboard: ${result}`);
      return;
    }
    case "svg": {
      // Primeiro frame como SVG colorido
      const first = animation.frames[0]?.matrix;
      if (!first) throw new Error("Animação sem frames.");
      downloadText(
        matrixToSvg(first, animation.width, animation.height),
        "animation-frame0.svg",
        "image/svg+xml",
      );
      return;
    }
    case "pdf":
      throw new Error(`Export "${format}" ainda é stub.`);
    default:
      throw new Error(`Formato ${format} não aplicável a animação.`);
  }
}

export { matrixToJson, matrixToHtml, matrixToSvg, matrixToAsciiSource };

/** Alias explícito — ANSI truecolor (24-bit RGB por célula). */
export { matrixToAnsi as matrixToAnsiTruecolor };
