import type {
  GalleryCategory,
  GalleryCollection,
  GalleryItem,
  GalleryQuery,
} from "@/features/ascii-engine/gallery/types";

/**
 * Contrato backend-ready para a Gallery.
 * Implementações futuras: HTTP/API, IDB, etc. — a UI só depende desta interface.
 */
export interface GalleryRepository {
  list(query?: GalleryQuery): Promise<GalleryItem[]>;
  getById(id: string): Promise<GalleryItem | null>;
  listCategories(): Promise<GalleryCategory[]>;
  listCollections(): Promise<GalleryCollection[]>;
  getCollection(id: string): Promise<GalleryCollection | null>;
}
