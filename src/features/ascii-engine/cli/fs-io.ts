import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Lê ficheiro como Buffer (Node FS adapter). */
export async function readInputFile(filePath: string): Promise<Buffer> {
  return readFile(filePath);
}

/** Lê ficheiro como texto UTF-8. */
export async function readInputText(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

/** Escreve texto; cria diretórios pai se necessário. */
export async function writeOutputText(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

/** Escreve bytes; cria diretórios pai se necessário. */
export async function writeOutputBuffer(filePath: string, data: Buffer | Uint8Array): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

export function extOf(filePath: string): string {
  const base = path.basename(filePath).toLowerCase();
  if (base.endsWith(".ascii-project.zip") || base.endsWith(".ascii.zip")) {
    return base.slice(base.indexOf("."));
  }
  return path.extname(base);
}
