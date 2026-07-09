import { downloadBlob } from "@/features/ascii-engine/browser";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ProjectDocument } from "@/features/ascii-engine/document";
import { downloadProjectZip } from "@/features/ascii-engine/storage";
import {
  downloadMatrix,
  downloadMatrixPng,
  matrixToAsciiSource,
  matrixToJson,
} from "@/features/ascii-interaction/image-pipeline/exporter";
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
  | "sprite-sheet";

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
  { id: "zip", label: "ASCII ZIP", status: "ready", target: "animation" },
  { id: "gif", label: "GIF", status: "ready", target: "animation" },
  { id: "txt-sequence", label: "TXT Sequence", status: "ready", target: "animation" },
  { id: "project", label: "Project ZIP", status: "ready", target: "project" },
  { id: "pdf", label: "PDF", status: "stub", target: "both" },
  { id: "sprite-sheet", label: "Sprite Sheet", status: "stub", target: "animation" },
];

export async function exportProject(doc: ProjectDocument): Promise<void> {
  await downloadProjectZip(doc);
}

function matrixToAnsi(matrix: AsciiMatrix): string {
  return matrixToAsciiSource(matrix);
}

function matrixToMarkdown(matrix: AsciiMatrix): string {
  return ["```text", matrixToAsciiSource(matrix), "```", ""].join("\n");
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
    case "pdf":
    case "sprite-sheet":
      throw new Error(`Export "${format}" ainda é stub.`);
    default:
      throw new Error(`Formato ${format} não aplicável a matriz estática.`);
  }
}

export async function exportAnimation(
  animation: AsciiAnimation,
  format: ExportFormatId,
  onProgress?: (p: { completed: number; total: number; percent: number }) => void,
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
    case "pdf":
    case "sprite-sheet":
      throw new Error(`Export "${format}" ainda é stub.`);
    default:
      throw new Error(`Formato ${format} não aplicável a animação.`);
  }
}

export { matrixToJson };
