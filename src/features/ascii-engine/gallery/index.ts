export type {
  GalleryCategory,
  GalleryCollection,
  GalleryItem,
  GalleryPreview,
  GalleryQuery,
} from "@/features/ascii-engine/gallery/types";
export { GALLERY_CATEGORIES } from "@/features/ascii-engine/gallery/types";
export type { GalleryRepository } from "@/features/ascii-engine/gallery/repository";
export {
  MockGalleryRepository,
  defaultGalleryRepository,
} from "@/features/ascii-engine/gallery/mock-repository";
export { MOCK_GALLERY_ITEMS, MOCK_GALLERY_COLLECTIONS } from "@/features/ascii-engine/gallery/mock-data";
export {
  loadFavoriteIds,
  saveFavoriteIds,
  toggleFavoriteId,
  isFavoriteId,
} from "@/features/ascii-engine/gallery/favorites";
export { previewToAscii, measurePreview } from "@/features/ascii-engine/gallery/preview";
