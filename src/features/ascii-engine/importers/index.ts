import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import { importAsciiAnimationZip } from "@/features/ascii-interaction/animation-pipeline";
import { parseAsciiMatrixFromText } from "@/features/ascii-interaction/animation-pipeline/importer/matrix-parser";

export type ImportFormatId = "ascii-zip" | "txt" | "json" | "html" | "svg" | "gif-ascii";

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
  { id: "html", label: "HTML", status: "stub", extensions: [".html"] },
  { id: "svg", label: "SVG", status: "stub", extensions: [".svg"] },
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

export async function importByFormat(
  file: File,
  format: ImportFormatId,
): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }> {
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
    case "html":
    case "svg":
    case "gif-ascii":
      throw new Error(`Import "${format}" ainda é stub.`);
    default:
      throw new Error(`Formato desconhecido: ${format}`);
  }
}
