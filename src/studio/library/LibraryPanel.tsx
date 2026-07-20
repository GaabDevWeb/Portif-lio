"use client";

import { useState } from "react";

import { GalleryEmbedded } from "@/studio/gallery/GalleryEmbedded";
import { IconsPanel } from "@/studio/icons/IconsPanel";

type LibrarySubTab = "icons" | "gallery";

/**
 * Library hub — Icons + Gallery (no upload required to explore the engine).
 */
export function LibraryPanel() {
  const [sub, setSub] = useState<LibrarySubTab>("icons");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg-void)]">
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--ui-border)] bg-[var(--bg-panel)] px-3 py-2">
        <p className="mr-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--amber-led)]">
          Library
        </p>
        {(
          [
            ["icons", "Icons"],
            ["gallery", "Gallery"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSub(id)}
            className={`cursor-pointer rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${
              sub === id
                ? "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
                : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {sub === "icons" ? <IconsPanel /> : <GalleryEmbedded />}
      </div>
    </div>
  );
}
