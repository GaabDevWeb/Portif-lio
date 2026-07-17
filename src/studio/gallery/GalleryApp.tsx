"use client";

import { GalleryCard } from "@/studio/gallery/GalleryCard";
import { GalleryFilters } from "@/studio/gallery/GalleryFilters";
import { StudioChromeNav } from "@/studio/gallery/StudioChromeNav";
import { useGalleryState } from "@/studio/gallery/useGalleryState";

/** Shell da Gallery — mesma linguagem visual do Studio (phosphor / mono). */
export function GalleryApp() {
  const g = useGalleryState();

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[var(--bg-void)] text-[var(--phosphor-primary)]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--ui-border)] bg-[var(--bg-panel)] px-4 py-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--amber-led)]">
            ASCII Engine
          </p>
          <h1 className="font-mono text-xs uppercase tracking-widest text-[var(--phosphor-primary)]">
            Gallery
          </h1>
        </div>
        <StudioChromeNav active="gallery" />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-[var(--ui-border)] bg-[var(--bg-panel)] md:w-72 md:border-b-0 md:border-r">
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

          {g.activeCollection ? (
            <div className="px-4 py-3 font-mono text-[10px] text-[var(--ui-text-dim)]">
              <p className="uppercase tracking-wider text-[var(--amber-led)]">Collection</p>
              <p className="mt-1 text-[var(--phosphor-primary)]">{g.activeCollection.title}</p>
              <p className="mt-1">{g.activeCollection.description}</p>
            </div>
          ) : (
            <div className="px-4 py-3 font-mono text-[10px] text-[var(--ui-text-dim)]">
              <p className="uppercase tracking-wider text-[var(--amber-led)]">Collections</p>
              <ul className="mt-2 space-y-1">
                {g.collections.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => g.setCollectionId(c.id)}
                      className="cursor-pointer text-left hover:text-[var(--phosphor-dim)]"
                    >
                      {c.title}{" "}
                      <span className="text-[var(--ui-text-dim)]">({c.itemIds.length})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4">
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
            <p className="py-16 text-center font-mono text-[11px] text-[var(--ui-text-dim)]">
              No arts match the current filters.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </main>
      </div>
    </div>
  );
}
