import {
  defaultGalleryRepository,
  previewToAscii,
  type GalleryItem,
} from "@/features/ascii-engine/gallery";
import { downloadBlob, downloadText, writeTextToClipboard } from "@/features/ascii-engine/browser";
import { renderAsciiToPng } from "@/studio/library/ascii-art-export";

export type GalleryStudioAction = "convert" | "remix" | "edit" | "animate";

function itemSlug(item: GalleryItem): string {
  return (
    item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || item.id
  );
}

/** Query params consumidos pelo AsciiLab. */
export function studioHrefForItem(item: GalleryItem, action: GalleryStudioAction = "convert"): string {
  const tab = action === "animate" ? "animate" : "convert";
  const params = new URLSearchParams({
    tab,
    gallery: item.id,
    action: action === "edit" ? "convert" : action,
  });
  return `/?${params.toString()}`;
}

export async function copyGalleryItem(item: GalleryItem): Promise<"copied" | "unsupported" | "error"> {
  return writeTextToClipboard(previewToAscii(item.preview));
}

export function exportGalleryItemTxt(item: GalleryItem): void {
  downloadText(previewToAscii(item.preview), `${itemSlug(item)}.txt`);
}

export async function exportGalleryItemPng(item: GalleryItem): Promise<void> {
  const blob = await renderAsciiToPng(previewToAscii(item.preview));
  downloadBlob(blob, `${itemSlug(item)}.png`);
}

export async function resolveGalleryItem(id: string): Promise<GalleryItem | null> {
  return defaultGalleryRepository.getById(id);
}
