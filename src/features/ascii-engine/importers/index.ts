import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { ProjectDocument } from "@/features/ascii-engine/document";
import { importAsciiAnimationZip } from "@/features/ascii-interaction/animation-pipeline";
import { parseAsciiMatrixFromText } from "@/features/ascii-interaction/animation-pipeline/importer/matrix-parser";
import { importProjectZip } from "@/features/ascii-engine/storage";

export type ImportFormatId =
  | "ascii-zip"
  | "txt"
  | "json"
  | "project"
  | "html"
  | "svg"
  | "gif-ascii";

export interface ImporterDescriptor {
  id: ImportFormatId;
  label: string;
  status: "ready" | "stub";
  extensions: string[];
}

export const IMPORTER_CATALOG: ImporterDescriptor[] = [
  { id: "ascii-zip", label: "ASCII ZIP", status: "ready", extensions: [".ascii.zip", ".zip"] },
  { id: "txt", label: "TXT", status: "ready", extensions: [".txt"] },
  { id: "json", label: "JSON", status: "ready", extensions: [".json"] },
  {
    id: "project",
    label: "Project ZIP",
    status: "ready",
    extensions: [".ascii-project.zip", ".zip"],
  },
  { id: "html", label: "HTML", status: "ready", extensions: [".html", ".htm"] },
  { id: "svg", label: "SVG ASCII", status: "ready", extensions: [".svg"] },
  { id: "gif-ascii", label: "GIF ASCII", status: "stub", extensions: [".gif"] },
];

export async function importAsciiZip(file: File): Promise<AsciiAnimation> {
  return importAsciiAnimationZip(file);
}

export async function importAsciiTxt(file: File, charset = " .:-=+*#%@"): Promise<AsciiMatrix> {
  const text = await file.text();
  return parseAsciiMatrixFromText(text, charset);
}

export async function importAsciiJson(file: File): Promise<AsciiMatrix | AsciiAnimation> {
  const data = JSON.parse(await file.text()) as AsciiMatrix | AsciiAnimation;
  if ("frames" in data && Array.isArray(data.frames)) return data as AsciiAnimation;
  if ("cells" in data) return data as AsciiMatrix;
  throw new Error("JSON não reconhecido como AsciiMatrix ou AsciiAnimation.");
}

export async function importProject(file: File): Promise<ProjectDocument> {
  const result = await importProjectZip(file);
  return result.document;
}

/**
 * Extrai texto ASCII de HTML: prioriza `<pre>` / `<code>`, senão textContent do body.
 * Spans coloridos são ignorados (só caracteres) — cor RGB não round-trip via HTML import.
 */
export function extractAsciiTextFromHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  // Prefer regex extract of pre/code blocks (works in Node + browser)
  const preMatch = trimmed.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/i);
  const codeMatch = !preMatch
    ? trimmed.match(/<code\b[^>]*>([\s\S]*?)<\/code>/i)
    : null;
  const raw = preMatch?.[1] ?? codeMatch?.[1] ?? null;

  if (raw != null) {
    return stripHtmlTags(raw);
  }

  // Fallback: strip all tags from body or full document
  const bodyMatch = trimmed.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return stripHtmlTags(bodyMatch?.[1] ?? trimmed);
}

function stripHtmlTags(fragment: string): string {
  return fragment
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");
}

export async function importAsciiHtml(
  file: File,
  charset = " .:-=+*#%@",
): Promise<AsciiMatrix> {
  const html = await file.text();
  const text = extractAsciiTextFromHtml(html);
  if (!text.trim()) {
    throw new Error("HTML sem texto ASCII em <pre>/<code> ou body.");
  }
  return parseAsciiMatrixFromText(text, charset);
}

/**
 * SVG-as-text ASCII: concatena conteúdo de elementos `<text>` (export SVG da engine).
 * Não rasteriza — só texto. Para raster→ASCII usar SvgAdapter no converters.
 */
export function extractAsciiTextFromSvg(svg: string): string {
  const texts: string[] = [];
  const re = /<text\b[^>]*>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    const content = match[1]!
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
    texts.push(content);
  }

  if (texts.length === 0) {
    // Fallback: se for markup SVG sem text, falha explícita
    throw new Error("SVG sem elementos <text> — use o converter SVG (raster) em vez do importer.");
  }

  // Heurística: agrupar por linhas aproximadas se o SVG veio do nosso exporter
  // (um <text> por célula). Sem y coords fiáveis via regex simples → join por linha
  // detectando mudança de padrão ou simplesmente reconstruir por ordem de documento.
  // O exporter emite um text por célula em row-major — reconstruir grid via atributos x/y.
  return reconstructSvgTextGrid(svg, texts);
}

function reconstructSvgTextGrid(svg: string, fallbackTexts: string[]): string {
  type Cell = { x: number; y: number; char: string };
  const cells: Cell[] = [];
  const re =
    /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    const attrs = match[1] ?? "";
    const x = Number(/[^\w]x\s*=\s*"([^"]+)"/i.exec(attrs)?.[1] ?? NaN);
    const y = Number(/[^\w]y\s*=\s*"([^"]+)"/i.exec(attrs)?.[1] ?? NaN);
    const char = (match[2] ?? "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
    if (Number.isFinite(x) && Number.isFinite(y) && char.length > 0) {
      cells.push({ x, y, char: char[0]! });
    }
  }

  if (cells.length === 0) {
    return fallbackTexts.join("");
  }

  // Agrupar por y (tolerância) → linhas; ordenar x dentro da linha
  const ys = [...new Set(cells.map((c) => c.y))].sort((a, b) => a - b);
  const yTol = ys.length > 1 ? Math.min(...ys.slice(1).map((y, i) => y - ys[i]!)) / 2 : 1;

  const rows: Cell[][] = [];
  for (const cell of cells) {
    let row = rows.find((r) => Math.abs(r[0]!.y - cell.y) <= yTol);
    if (!row) {
      row = [];
      rows.push(row);
    }
    row.push(cell);
  }
  rows.sort((a, b) => a[0]!.y - b[0]!.y);

  const lines = rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    if (row.length === 1) return row[0]!.char;
    const xs = row.map((c) => c.x);
    const gaps = xs.slice(1).map((x, i) => x - xs[i]!);
    const cellW = gaps.length > 0 ? median(gaps) : 7;
    let line = "";
    let prevX = row[0]!.x;
    line += row[0]!.char;
    for (let i = 1; i < row.length; i++) {
      const dx = row[i]!.x - prevX;
      const spaces = Math.max(0, Math.round(dx / cellW) - 1);
      line += " ".repeat(spaces) + row[i]!.char;
      prevX = row[i]!.x;
    }
    return line;
  });

  return lines.join("\n");
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export async function importAsciiSvg(
  file: File,
  charset = " .:-=+*#%@",
): Promise<AsciiMatrix> {
  const svg = await file.text();
  const text = extractAsciiTextFromSvg(svg);
  if (!text.trim()) {
    throw new Error("SVG sem texto ASCII extraível.");
  }
  return parseAsciiMatrixFromText(text, charset);
}

export async function importByFormat(
  file: File,
  format: ImportFormatId,
): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation; project?: ProjectDocument }> {
  switch (format) {
    case "ascii-zip":
      return { animation: await importAsciiZip(file) };
    case "txt":
      return { matrix: await importAsciiTxt(file) };
    case "json": {
      const parsed = await importAsciiJson(file);
      if ("frames" in parsed) return { animation: parsed };
      return { matrix: parsed };
    }
    case "project":
      return { project: await importProject(file) };
    case "html":
      return { matrix: await importAsciiHtml(file) };
    case "svg":
      return { matrix: await importAsciiSvg(file) };
    case "gif-ascii":
      throw new Error(
        'Import "gif-ascii" ainda é stub — use o converter GIF (animation-pipeline) para GIF raster.',
      );
    default:
      throw new Error(`Formato desconhecido: ${format}`);
  }
}
