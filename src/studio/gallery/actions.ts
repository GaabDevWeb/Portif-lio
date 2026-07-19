import {
  defaultGalleryRepository,
  previewToAscii,
  type GalleryItem,
} from "@/features/ascii-engine/gallery";
import { downloadText, writeTextToClipboard } from "@/features/ascii-engine/browser";

export type GalleryStudioAction = "convert" | "remix" | "edit";

/** Query params consumidos pelo AsciiLab. */
export function studioHrefForItem(item: GalleryItem, action: GalleryStudioAction = "convert"): string {
  const params = new URLSearchParams({
    tab: "convert",
    gallery: item.id,
    action: action === "edit" ? "convert" : action,
  });
  return `/?${params.toString()}`;
}

export async function copyGalleryItem(item: GalleryItem): Promise<"copied" | "unsupported" | "error"> {
  return writeTextToClipboard(previewToAscii(item.preview));
}

export function exportGalleryItemTxt(item: GalleryItem): void {
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  downloadText(previewToAscii(item.preview), `${slug || item.id}.txt`);
}

export async function resolveGalleryItem(id: string): Promise<GalleryItem | null> {
  return defaultGalleryRepository.getById(id);
}
