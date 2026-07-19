"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Copy, Download, Pencil, Shuffle, Star } from "lucide-react";

import { previewToAscii, type GalleryItem } from "@/features/ascii-engine/gallery";
import {
  copyGalleryItem,
  exportGalleryItemTxt,
  studioHrefForItem,
} from "@/studio/gallery/actions";

interface GalleryCardProps {
  item: GalleryItem;
  favorited: boolean;
  onToggleFavorite: (id: string) => void;
  onFlash: (message: string) => void;
}

export function GalleryCard({ item, favorited, onToggleFavorite, onFlash }: GalleryCardProps) {
  const ascii = previewToAscii(item.preview);
  const previewLines = ascii.split("\n").slice(0, 8);

  return (
    <article className="flex flex-col border border-[var(--ui-border)] bg-[var(--bg-panel)]">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--ui-border)]/60 px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate font-mono text-[11px] text-[var(--phosphor-primary)]">
            {item.title}
          </h2>
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
            {item.author} · {item.category} · {item.cols}×{item.rows}
          </p>
        </div>
        <button
          type="button"
          aria-label={favorited ? "Remove favorite" : "Add favorite"}
          onClick={() => onToggleFavorite(item.id)}
          className={`shrink-0 cursor-pointer rounded border p-1.5 ${
            favorited
              ? "border-[var(--amber-led)] text-[var(--amber-led)]"
              : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
          }`}
        >
          <Star size={12} fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <pre
        className="max-h-40 overflow-auto bg-[var(--bg-void)] px-3 py-2 font-mono text-[8px] leading-tight text-[var(--phosphor-primary)]"
        aria-hidden
      >
        {previewLines.join("\n")}
      </pre>

      <div className="mt-auto flex flex-wrap gap-1 border-t border-[var(--ui-border)]/60 px-2 py-2">
        {item.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded border border-[var(--ui-border)] px-1.5 py-0.5 font-mono text-[8px] uppercase text-[var(--ui-text-dim)]"
          >
            {tag}
          </span>
        ))}
        {item.recipeId ? (
          <span className="rounded border border-[var(--phosphor-dim)]/40 px-1.5 py-0.5 font-mono text-[8px] uppercase text-[var(--phosphor-dim)]">
            recipe:{item.recipeId}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-1 border-t border-[var(--ui-border)] px-2 py-2">
        <ActionBtn
          label="Copy"
          icon={<Copy size={11} />}
          onClick={() => {
            void copyGalleryItem(item).then((r) => {
              onFlash(r === "copied" ? `Copied · ${item.title}` : "Copy failed");
            });
          }}
        />
        <Link
          href={studioHrefForItem(item, "convert")}
          className="flex cursor-pointer items-center justify-center gap-1 rounded border border-[var(--ui-border)] px-1 py-1.5 font-mono text-[8px] uppercase text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
        >
          <Pencil size={11} />
          Convert
        </Link>
        <Link
          href={studioHrefForItem(item, "remix")}
          className={`flex items-center justify-center gap-1 rounded border px-1 py-1.5 font-mono text-[8px] uppercase ${
            item.recipeId
              ? "cursor-pointer border-[var(--ui-border)] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
              : "pointer-events-none border-[var(--ui-border)]/40 text-[var(--ui-text-dim)] opacity-50"
          }`}
          aria-disabled={!item.recipeId}
          title={item.recipeId ? `Remix with ${item.recipeId}` : "No recipe on this item"}
        >
          <Shuffle size={11} />
          Remix
        </Link>
        <ActionBtn
          label="Export"
          icon={<Download size={11} />}
          onClick={() => {
            exportGalleryItemTxt(item);
            onFlash(`Exported · ${item.title}.txt`);
          }}
        />
      </div>
    </article>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center gap-1 rounded border border-[var(--ui-border)] px-1 py-1.5 font-mono text-[8px] uppercase text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
    >
      {icon}
      {label}
    </button>
  );
}
