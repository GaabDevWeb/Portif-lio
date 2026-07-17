/** Preview: string ASCII multilinha ou matriz de caracteres [row][col]. */
export type GalleryPreview = string | string[][];

export type GalleryCategory =
  | "logos"
  | "portraits"
  | "landscapes"
  | "patterns"
  | "typography"
  | "abstract"
  | "animals"
  | "ui";

export const GALLERY_CATEGORIES: readonly GalleryCategory[] = [
  "logos",
  "portraits",
  "landscapes",
  "patterns",
  "typography",
  "abstract",
  "animals",
  "ui",
] as const;

export interface GalleryItem {
  id: string;
  title: string;
  preview: GalleryPreview;
  author: string;
  charset: string;
  cols: number;
  rows: number;
  tags: string[];
  category: GalleryCategory;
  /** Preferência do utilizador (overlay localStorage); mock pode pré-marcar. */
  favorite?: boolean;
  /** Recipe id (`getRecipe` / W2 builtins) para remix no Studio. */
  recipeId?: string;
  collectionIds?: string[];
}

export interface GalleryCollection {
  id: string;
  title: string;
  description: string;
  itemIds: string[];
}

export interface GalleryQuery {
  search?: string;
  category?: GalleryCategory | "all";
  tags?: string[];
  favoritesOnly?: boolean;
  collectionId?: string;
  /** IDs marcados como favoritos (localStorage) — aplicado pelo repo ou pelo caller. */
  favoriteIds?: ReadonlySet<string> | string[];
}
