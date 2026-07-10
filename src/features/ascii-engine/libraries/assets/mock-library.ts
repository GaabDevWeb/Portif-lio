import type {
  AssetCategory,
  AssetLibrary,
  LibraryAsset,
} from "@/features/ascii-engine/libraries/assets/types";

const MOCK_ASSETS: LibraryAsset[] = [
  {
    id: "frame-simple",
    name: "Simple Frame",
    category: "frames",
    ascii: ["+----+", "|    |", "+----+"].join("\n"),
    tags: ["border"],
  },
  {
    id: "frame-double",
    name: "Double Frame",
    category: "frames",
    ascii: ["╔════╗", "║    ║", "╚════╝"].join("\n"),
  },
  {
    id: "box-filled",
    name: "Filled Box",
    category: "boxes",
    ascii: ["####", "#  #", "####"].join("\n"),
  },
  {
    id: "box-shadow",
    name: "Box Shadow",
    category: "boxes",
    ascii: ["+---+.", "|   |:", "+---+*"].join("\n"),
  },
  {
    id: "term-prompt",
    name: "Terminal Prompt",
    category: "terminals",
    ascii: ["┌─ bash ──┐", "│ $ _     │", "└─────────┘"].join("\n"),
  },
  {
    id: "term-block",
    name: "Terminal Block",
    category: "terminals",
    ascii: ["> ready", "> _"].join("\n"),
  },
  {
    id: "arrow-right",
    name: "Arrow Right",
    category: "arrows",
    ascii: "---->",
  },
  {
    id: "arrow-bidir",
    name: "Arrow Bidirectional",
    category: "arrows",
    ascii: "<---->",
  },
  {
    id: "hud-hp",
    name: "HUD HP Bar",
    category: "hud",
    ascii: ["HP [████░░] 80%", "MP [██░░░░] 40%"].join("\n"),
  },
  {
    id: "hud-crosshair",
    name: "Crosshair",
    category: "hud",
    ascii: ["  |  ", "--+--", "  |  "].join("\n"),
  },
  {
    id: "deco-star",
    name: "Star",
    category: "decorations",
    ascii: " * \n***\n * ",
  },
  {
    id: "deco-divider",
    name: "Divider",
    category: "decorations",
    ascii: "· · · · · · · ·",
  },
];

const CATEGORIES: AssetCategory[] = [
  "frames",
  "boxes",
  "terminals",
  "arrows",
  "hud",
  "decorations",
];

/** Mock AssetLibrary — snippets ASCII por categoria (Scene W6). */
export class MockAssetLibrary implements AssetLibrary {
  readonly id: string;
  readonly name: string;
  private readonly assets: LibraryAsset[];

  constructor(id = "mock-assets", name = "ASCII Assets") {
    this.id = id;
    this.name = name;
    this.assets = structuredClone(MOCK_ASSETS);
  }

  categories(): AssetCategory[] {
    return [...CATEGORIES];
  }

  list(category?: AssetCategory): LibraryAsset[] {
    const list = category
      ? this.assets.filter((a) => a.category === category)
      : this.assets;
    return structuredClone(list);
  }

  get(id: string): LibraryAsset | undefined {
    const a = this.assets.find((x) => x.id === id);
    return a ? structuredClone(a) : undefined;
  }
}

export function createMockAssetLibrary(): MockAssetLibrary {
  return new MockAssetLibrary();
}
