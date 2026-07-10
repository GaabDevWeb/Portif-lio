import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

/** Frequência absoluta e relativa de cada carácter na matriz. */
export interface CharacterFrequencyEntry {
  char: string;
  count: number;
  /** Fração 0..1 sobre células contadas (não sobre grid vazio). */
  ratio: number;
}

export interface CharacterFrequency {
  totalCells: number;
  uniqueChars: number;
  entries: CharacterFrequencyEntry[];
  /** Carácter mais frequente (empate: primeiro por ordem de contagem). */
  mode: string | null;
  entropyBits: number;
}

/**
 * Análise de frequência de caracteres (histograma completo + entropia Shannon).
 * `topN` limita `entries` (default: todos).
 */
export function buildCharacterFrequency(
  matrix: AsciiMatrix | null | undefined,
  topN?: number,
): CharacterFrequency {
  if (!matrix) {
    return {
      totalCells: 0,
      uniqueChars: 0,
      entries: [],
      mode: null,
      entropyBits: 0,
    };
  }

  const map = new Map<string, number>();
  for (const cell of matrix.cells) {
    map.set(cell.char, (map.get(cell.char) ?? 0) + 1);
  }

  const totalCells = matrix.cells.length;
  const entries = [...map.entries()]
    .map(([char, count]) => ({
      char,
      count,
      ratio: totalCells > 0 ? count / totalCells : 0,
    }))
    .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char));

  let entropyBits = 0;
  if (totalCells > 0) {
    for (const e of entries) {
      if (e.ratio <= 0) continue;
      entropyBits -= e.ratio * Math.log2(e.ratio);
    }
  }

  return {
    totalCells,
    uniqueChars: entries.length,
    entries: topN != null ? entries.slice(0, topN) : entries,
    mode: entries[0]?.char ?? null,
    entropyBits,
  };
}

/** Serializa matriz para TXT denso (row-major, newline entre linhas). */
export function matrixToPlainText(matrix: AsciiMatrix): string {
  const grid: string[][] = Array.from({ length: matrix.rows }, () =>
    Array.from({ length: matrix.cols }, () => " "),
  );
  for (const cell of matrix.cells) {
    if (cell.col < 0 || cell.row < 0 || cell.col >= matrix.cols || cell.row >= matrix.rows) {
      continue;
    }
    grid[cell.row]![cell.col] = cell.char;
  }
  return grid.map((row) => row.join("")).join("\n");
}

export interface CompressionRatioResult {
  /** Bytes do TXT denso (UTF-8). */
  plainBytes: number;
  /** Bytes estimados comprimidos (deflate-like heuristic ou zipBytes se dado). */
  compressedBytes: number;
  /** plain / compressed (≥1 quando há compressão). */
  ratio: number;
  method: "estimate" | "provided";
}

/**
 * Compression ratio helper: TXT vs ZIP/deflate.
 * Se `compressedBytes` for fornecido (ex.: ZIP real), usa-o; senão estima via
 * repetição de caracteres (RLE-ish) — útil sem dependência de zlib no browser.
 */
export function estimateCompressionRatio(
  matrix: AsciiMatrix | null | undefined,
  compressedBytes?: number,
): CompressionRatioResult | null {
  if (!matrix || matrix.cols <= 0 || matrix.rows <= 0) return null;

  const plain = matrixToPlainText(matrix);
  const plainBytes = typeof TextEncoder !== "undefined"
    ? new TextEncoder().encode(plain).length
    : plain.length;

  if (compressedBytes != null && compressedBytes > 0) {
    return {
      plainBytes,
      compressedBytes,
      ratio: plainBytes / compressedBytes,
      method: "provided",
    };
  }

  // Heurística: RLE por linha + overhead mínimo
  let estimated = 0;
  const lines = plain.split("\n");
  for (const line of lines) {
    let i = 0;
    while (i < line.length) {
      const ch = line[i]!;
      let run = 1;
      while (i + run < line.length && line[i + run] === ch) run++;
      // token ~ 1 byte char + 1 byte length (simplificado)
      estimated += 2;
      i += run;
    }
    estimated += 1; // newline
  }
  estimated = Math.max(1, estimated);

  return {
    plainBytes,
    compressedBytes: estimated,
    ratio: plainBytes / estimated,
    method: "estimate",
  };
}

export interface CharsetAnalysis {
  charset: string;
  charsetLength: number;
  /** Caracteres do charset presentes na matriz. */
  usedInMatrix: string[];
  usedCount: number;
  /** Caracteres do charset ausentes na matriz. */
  unusedInMatrix: string[];
  /** Caracteres na matriz que não estão no charset declarado. */
  outsideCharset: string[];
  coverage: number;
}

/**
 * Analisa cobertura do charset vs caracteres efectivamente usados na matriz.
 */
export function analyzeCharset(
  matrix: AsciiMatrix | null | undefined,
  charsetOverride?: string,
): CharsetAnalysis | null {
  if (!matrix) return null;
  const charset = charsetOverride ?? matrix.charset ?? "";
  const charsetSet = new Set([...charset]);
  const usedSet = new Set<string>();
  for (const cell of matrix.cells) {
    usedSet.add(cell.char);
  }

  const usedInMatrix = [...charsetSet].filter((c) => usedSet.has(c));
  const unusedInMatrix = [...charsetSet].filter((c) => !usedSet.has(c));
  const outsideCharset = [...usedSet].filter((c) => !charsetSet.has(c)).sort();

  return {
    charset,
    charsetLength: charset.length,
    usedInMatrix,
    usedCount: usedInMatrix.length,
    unusedInMatrix,
    outsideCharset,
    coverage: charset.length > 0 ? usedInMatrix.length / charset.length : 0,
  };
}

/** Contagem de frames (animação ou valor explícito). */
export function resolveFrameCount(input: {
  frameCount?: number;
  animationFrameCount?: number;
}): number | undefined {
  if (input.frameCount != null && Number.isFinite(input.frameCount)) {
    return Math.max(0, Math.floor(input.frameCount));
  }
  if (input.animationFrameCount != null && Number.isFinite(input.animationFrameCount)) {
    return Math.max(0, Math.floor(input.animationFrameCount));
  }
  return undefined;
}
