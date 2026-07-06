"use client";

import { Focus, List, Maximize2, Minus, Plus } from "lucide-react";

import { getGraphStats } from "@/lib/content/knowledge-graph";
import { cn } from "@/lib/utils";

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFocusSelected: () => void;
  onToggleFallback: () => void;
  fallbackOpen: boolean;
  hasSelection: boolean;
  className?: string;
}

export function GraphControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFocusSelected,
  onToggleFallback,
  fallbackOpen,
  hasSelection,
  className,
}: GraphControlsProps) {
  const stats = getGraphStats();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ui-border)] px-3 py-2",
        className,
      )}
    >
      <p className="font-mono text-[10px] text-[var(--phosphor-dim)]">
        {stats.nodes} nodes · {stats.edges} edges · v{stats.version}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={onToggleFallback}
          aria-pressed={fallbackOpen}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1 border border-[var(--ui-border)] px-2 font-mono text-[10px] text-[var(--ui-text-dim)] hover:text-[var(--ui-text)]"
        >
          <List className="h-3.5 w-3.5" aria-hidden />
          Index
        </button>
        {hasSelection && (
          <button
            type="button"
            onClick={onFocusSelected}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 border border-[var(--ui-border)] px-2 font-mono text-[10px] text-[var(--ui-text-dim)] hover:text-[var(--ui-text)]"
          >
            <Focus className="h-3.5 w-3.5" aria-hidden />
            Focus
          </button>
        )}
        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:text-[var(--ui-text)]"
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:text-[var(--ui-text)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset view"
          className="inline-flex min-h-11 cursor-pointer items-center gap-1 border border-[var(--ui-border)] px-2 font-mono text-[10px] text-[var(--ui-text-dim)] hover:text-[var(--ui-text)]"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>
    </div>
  );
}
