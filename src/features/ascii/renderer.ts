import { ansi, hasAnsi } from "@/features/ascii/ansi";
import type { AsciiLine, RenderedLines } from "@/features/ascii/types";

export function splitMultiline(text: string): string[] {
  if (!text) return [""];
  return text.split("\n");
}

export function renderAsciiLines(lines: AsciiLine[]): RenderedLines {
  const out: string[] = [];
  for (const line of lines) {
    if (line.kind === "raw") {
      out.push(...splitMultiline(line.text));
      continue;
    }

    const chunks = splitMultiline(line.text);
    const color = line.style?.color;
    if (!color) {
      out.push(...chunks);
      continue;
    }

    for (const chunk of chunks) {
      // If the line already contains ANSI, do not wrap again.
      if (hasAnsi(chunk)) {
        out.push(chunk);
      } else {
        out.push(`${ansi(color)}${chunk}${ansi("reset")}`);
      }
    }
  }
  return out;
}

