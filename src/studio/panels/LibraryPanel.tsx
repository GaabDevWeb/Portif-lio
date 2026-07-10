"use client";

/**
 * LibraryPanel stub (Scene W6) — lista assets/shapes e callback de insert.
 * Não ligado ao AsciiLab Edit tab (outro agent); feature-layer ready.
 */

import { useMemo, useState } from "react";
import {
  createMockAssetLibrary,
  listProceduralShapeKinds,
  type AssetCategory,
  type LibraryAsset,
  type ProceduralShapeKind,
} from "@/features/ascii-engine/libraries";

export interface LibraryPanelProps {
  onInsertAsset?: (asset: LibraryAsset) => void;
  onInsertShape?: (kind: ProceduralShapeKind) => void;
}

type Tab = "assets" | "shapes";

export function LibraryPanel({ onInsertAsset, onInsertShape }: LibraryPanelProps) {
  const library = useMemo(() => createMockAssetLibrary(), []);
  const [tab, setTab] = useState<Tab>("assets");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const assets =
    category === "all" ? library.list() : library.list(category);
  const shapes = listProceduralShapeKinds();

  return (
    <div className="flex flex-col gap-2 p-2 text-xs" data-testid="scene-library-panel">
      <div className="flex gap-1">
        <button type="button" onClick={() => setTab("assets")} aria-pressed={tab === "assets"}>
          Assets
        </button>
        <button type="button" onClick={() => setTab("shapes")} aria-pressed={tab === "shapes"}>
          Shapes
        </button>
      </div>
      {tab === "assets" ? (
        <>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AssetCategory | "all")}
            aria-label="Asset category"
          >
            <option value="all">all</option>
            {library.categories().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ul className="flex flex-col gap-1">
            {assets.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onInsertAsset?.(a)}>
                  {a.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="flex flex-col gap-1">
          {shapes.map((kind) => (
            <li key={kind}>
              <button type="button" onClick={() => onInsertShape?.(kind)}>
                {kind}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
