import type { GalleryPreview } from "@/features/ascii-engine/gallery/types";

/** Normaliza preview (string ou matriz) para texto ASCII multilinha. */
export function previewToAscii(preview: GalleryPreview): string {
  if (typeof preview === "string") return preview.replace(/\r\n/g, "\n");
  return preview.map((row) => row.join("")).join("\n");
}

/** Dimensões a partir do preview (útil para validar mock data). */
export function measurePreview(preview: GalleryPreview): { cols: number; rows: number } {
  if (typeof preview === "string") {
    const lines = preview.replace(/\r\n/g, "\n").split("\n");
    return {
      rows: lines.length,
      cols: lines.reduce((max, line) => Math.max(max, line.length), 0),
    };
  }
  return {
    rows: preview.length,
    cols: preview.reduce((max, row) => Math.max(max, row.length), 0),
  };
}
