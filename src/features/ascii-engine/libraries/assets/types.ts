export type AssetCategory =
  | "frames"
  | "boxes"
  | "terminals"
  | "arrows"
  | "hud"
  | "decorations";

export interface LibraryAsset {
  id: string;
  name: string;
  category: AssetCategory;
  /** ASCII multilinha (snippet). */
  ascii: string;
  tags?: string[];
}

export interface AssetLibrary {
  id: string;
  name: string;
  list(category?: AssetCategory): LibraryAsset[];
  get(id: string): LibraryAsset | undefined;
  categories(): AssetCategory[];
}
