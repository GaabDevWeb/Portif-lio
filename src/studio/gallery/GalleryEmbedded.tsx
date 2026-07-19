"use client";

import { GalleryCard } from "@/studio/gallery/GalleryCard";
import { GalleryFilters } from "@/studio/gallery/GalleryFilters";
import { useGalleryState } from "@/studio/gallery/useGalleryState";

/**
 * Gallery embedded inside the product shell (no duplicate chrome nav).
 * Demonstrates conversion quality — Featured / collections / filters.
 */
export function GalleryEmbedded() {
  const g = useGalleryState();

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--bg-void)] md:flex-row">
      <aside className="w-full shrink-0 overflow-y-auto border-b border-[var(--ui-border)] bg-[var(--bg-panel)] md:w-72 md:border-b-0 md:border-r">
        <div className="border-b border-[var(--ui-border)] px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--amber-led)]">
            Showcase
          </p>
          <h1 className="font-mono text-xs uppercase tracking-widest text-[var(--phosphor-primary)]">
            Gallery
          </h1>
          <p className="mt-1 font-mono text-[9px] text-[var(--ui-text-dim)]">
            Featured conversions — open in Convert to remix.
          </p>
        </div>
        <GalleryFilters
          search={g.search}
          onSearchChange={g.setSearch}
          category={g.category}
          onCategoryChange={g.setCategory}
          categories={g.categories}
          collectionId={g.collectionId}
          onCollectionChange={g.setCollectionId}
          collections={g.collections}
          favoritesOnly={g.favoritesOnly}
          onFavoritesOnlyChange={g.setFavoritesOnly}
        />
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--ui-text-dim)]">
          <span>
            {g.loading ? "Loading…" : `${g.items.length} item${g.items.length === 1 ? "" : "s"}`}
          </span>
          {g.status ? (
            <span className="text-[var(--phosphor-primary)]" role="status">
              {g.status}
            </span>
          ) : null}
        </div>

        {!g.loading && g.items.length === 0 ? (
          <p className="font-mono text-[10px] text-[var(--ui-text-dim)]">No items match filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.items.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                favorited={g.favoriteIds.has(item.id) || Boolean(item.favorite)}
                onToggleFavorite={g.toggleFavorite}
                onFlash={g.flash}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
