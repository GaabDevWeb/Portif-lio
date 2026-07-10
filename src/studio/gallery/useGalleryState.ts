"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  defaultGalleryRepository,
  loadFavoriteIds,
  toggleFavoriteId,
  type GalleryCategory,
  type GalleryCollection,
  type GalleryItem,
} from "@/features/ascii-engine/gallery";

export type CategoryFilter = GalleryCategory | "all";

export function useGalleryState(repository = defaultGalleryRepository) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [collectionId, setCollectionId] = useState<string | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteIds(loadFavoriteIds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const [list, cols, cats] = await Promise.all([
        repository.list({
          search,
          category,
          collectionId: collectionId === "all" ? undefined : collectionId,
          favoritesOnly,
          favoriteIds,
        }),
        repository.listCollections(),
        repository.listCategories(),
      ]);
      if (cancelled) return;
      setItems(list);
      setCollections(cols);
      setCategories(cats);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [repository, search, category, collectionId, favoritesOnly, favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => toggleFavoriteId(id, prev));
  }, []);

  const flash = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 2200);
  }, []);

  const activeCollection = useMemo(
    () => collections.find((c) => c.id === collectionId) ?? null,
    [collections, collectionId],
  );

  return {
    items,
    collections,
    categories,
    loading,
    search,
    setSearch,
    category,
    setCategory,
    collectionId,
    setCollectionId,
    favoritesOnly,
    setFavoritesOnly,
    favoriteIds,
    toggleFavorite,
    status,
    flash,
    activeCollection,
  };
}
