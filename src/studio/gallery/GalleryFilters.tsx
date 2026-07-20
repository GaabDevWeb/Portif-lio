"use client";

import type { GalleryCategory, GalleryCollection } from "@/features/ascii-engine/gallery";
import type { CategoryFilter } from "@/studio/gallery/useGalleryState";
import { PanelToggle } from "@/studio/ui/controls";

interface GalleryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  categories: GalleryCategory[];
  collectionId: string | "all";
  onCollectionChange: (value: string | "all") => void;
  collections: GalleryCollection[];
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
}

export function GalleryFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  collectionId,
  onCollectionChange,
  collections,
  favoritesOnly,
  onFavoritesOnlyChange,
}: GalleryFiltersProps) {
  return (
    <div className="space-y-3 border-b border-[var(--ui-border)] px-4 py-3">
      <label className="block font-mono text-[10px] text-[var(--ui-text-dim)]">
        Search
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="title, author, tags…"
          className="mt-1 w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5 font-mono text-[11px] text-[var(--phosphor-primary)] placeholder:text-[var(--ui-text-dim)]"
        />
      </label>

      <div className="flex flex-wrap gap-1">
        <FilterChip
          label="All"
          active={category === "all"}
          onClick={() => onCategoryChange("all")}
        />
        {categories.map((c) => (
          <FilterChip
            key={c}
            label={c}
            active={category === c}
            onClick={() => onCategoryChange(c)}
          />
        ))}
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10px] text-[var(--ui-text-dim)]">Collections</p>
        <div className="flex flex-wrap gap-1">
          <FilterChip
            label="All"
            active={collectionId === "all"}
            onClick={() => onCollectionChange("all")}
          />
          {collections
            .filter((col) =>
              ["col-featured", "col-trending", "col-recent"].includes(col.id),
            )
            .map((col) => (
              <FilterChip
                key={col.id}
                label={col.title}
                active={collectionId === col.id}
                onClick={() => onCollectionChange(col.id)}
              />
            ))}
        </div>
        <select
          value={collectionId}
          onChange={(e) => onCollectionChange(e.target.value as string | "all")}
          className="mt-2 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5 font-mono text-[11px] text-[var(--phosphor-primary)]"
          aria-label="All collections"
        >
          <option value="all">All collections</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.title} ({col.itemIds.length})
            </option>
          ))}
        </select>
      </div>

      <PanelToggle
        label="Favorites only"
        checked={favoritesOnly}
        onChange={onFavoritesOnlyChange}
      />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
        active
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10 text-[var(--phosphor-primary)]"
          : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
      }`}
    >
      {label}
    </button>
  );
}
