import type { AsciiIcon } from "@/features/ascii-engine/icons";

/** Deep-link into Convert with the icon rasterized as source image. */
export function studioHrefForIcon(icon: AsciiIcon): string {
  const params = new URLSearchParams({
    tab: "convert",
    icon: icon.id,
  });
  return `/?${params.toString()}`;
}
