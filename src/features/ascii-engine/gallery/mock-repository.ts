import {
  MOCK_GALLERY_COLLECTIONS,
  MOCK_GALLERY_ITEMS,
} from "@/features/ascii-engine/gallery/mock-data";
import type { GalleryRepository } from "@/features/ascii-engine/gallery/repository";
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  type GalleryCollection,
  type GalleryItem,
  type GalleryQuery,
} from "@/features/ascii-engine/gallery/types";

function toFavoriteSet(ids: GalleryQuery["favoriteIds"]): Set<string> | null {
  if (!ids) return null;
  return ids instanceof Set ? ids : new Set(ids);
}

function matchesQuery(item: GalleryItem, query: GalleryQuery | undefined): boolean {
  if (!query) return true;

  const favSet = toFavoriteSet(query.favoriteIds);
  const isFav = Boolean(item.favorite) || (favSet?.has(item.id) ?? false);

  if (query.favoritesOnly && !isFav) return false;

  if (query.category && query.category !== "all" && item.category !== query.category) {
    return false;
  }

  if (query.collectionId && !item.collectionIds?.includes(query.collectionId)) {
    return false;
  }

  if (query.tags?.length) {
    const lower = item.tags.map((t) => t.toLowerCase());
    const ok = query.tags.every((t) => lower.includes(t.toLowerCase()));
    if (!ok) return false;
  }

  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    const hay = [item.title, item.author, item.category, ...item.tags].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }

  return true;
}

function withFavoriteFlag(item: GalleryItem, favSet: Set<string> | null): GalleryItem {
  if (!favSet) return { ...item };
  return { ...item, favorite: favSet.has(item.id) || Boolean(item.favorite) };
}

/**
 * Implementação in-memory da Gallery — sem rede.
 * Substituição futura: `HttpGalleryRepository` com o mesmo contrato.
 */
export class MockGalleryRepository implements GalleryRepository {
  constructor(
    private readonly items: readonly GalleryItem[] = MOCK_GALLERY_ITEMS,
    private readonly collections: readonly GalleryCollection[] = MOCK_GALLERY_COLLECTIONS,
  ) {}

  async list(query?: GalleryQuery): Promise<GalleryItem[]> {
    const favSet = toFavoriteSet(query?.favoriteIds);
    return this.items
      .filter((item) => matchesQuery(item, query))
      .map((item) => withFavoriteFlag(item, favSet));
  }

  async getById(id: string): Promise<GalleryItem | null> {
    const found = this.items.find((item) => item.id === id);
    return found ? { ...found } : null;
  }

  async listCategories(): Promise<GalleryCategory[]> {
    const present = new Set(this.items.map((i) => i.category));
    return GALLERY_CATEGORIES.filter((c) => present.has(c));
  }

  async listCollections(): Promise<GalleryCollection[]> {
    return this.collections.map((c) => ({ ...c, itemIds: [...c.itemIds] }));
  }

  async getCollection(id: string): Promise<GalleryCollection | null> {
    const found = this.collections.find((c) => c.id === id);
    return found ? { ...found, itemIds: [...found.itemIds] } : null;
  }
}

/** Singleton default para a app (mock). */
export const defaultGalleryRepository: GalleryRepository = new MockGalleryRepository();
