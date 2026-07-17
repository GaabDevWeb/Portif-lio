import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

/** Reconstrói AsciiMatrix a partir de texto exportado. */
export function parseAsciiMatrixFromText(text: string, charset: string): AsciiMatrix {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const rows = lines.length;
  const cols = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const cells = [];

  for (let row = 0; row < rows; row += 1) {
    const line = lines[row] ?? "";
    for (let col = 0; col < cols; col += 1) {
      const ch = line[col] ?? " ";
      if (ch === " ") continue;
      cells.push({
        char: ch,
        col,
        row,
        luminance: charset.indexOf(ch) / Math.max(1, charset.length - 1),
        r: 157,
        g: 255,
        b: 157,
      });
    }
  }

  return { cols, rows, cells, charset };
}
