import type { AsciiMatrix, AsciiMatrixCell } from "@/features/ascii-interaction/image-pipeline/types";

/** Reuse previous matrix cells where motion mask is static. */
export function reuseStaticRegions(
  nextCells: AsciiMatrixCell[],
  prev: AsciiMatrix | null,
  motionMask: Float32Array,
  cols: number,
): { cells: AsciiMatrixCell[]; reused: number } {
  if (!prev) return { cells: nextCells, reused: 0 };
  const prevMap = new Map<string, AsciiMatrixCell>();
  for (const c of prev.cells) {
    prevMap.set(`${c.col},${c.row}`, c);
  }
  let reused = 0;
  const out: AsciiMatrixCell[] = [];
  const seen = new Set<string>();

  for (const cell of nextCells) {
    const i = cell.row * cols + cell.col;
    const key = `${cell.col},${cell.row}`;
    seen.add(key);
    if (motionMask[i]! < 0.5) {
      const old = prevMap.get(key);
      if (old) {
        out.push({ ...old });
        reused += 1;
        continue;
      }
    }
    out.push(cell);
  }

  // Keep previous static cells that next skipped (e.g. near-black spaces)
  for (const [key, old] of prevMap) {
    if (seen.has(key)) continue;
    const i = old.row * cols + old.col;
    if (motionMask[i]! < 0.5) {
      out.push({ ...old });
      reused += 1;
    }
  }

  return { cells: out, reused };
}
