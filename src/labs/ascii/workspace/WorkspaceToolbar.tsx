"use client";

import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Scan,
} from "lucide-react";

import type { OriginalViewMode, WorkspaceState, ZoomPreset } from "@/labs/ascii/workspace/types";
import { ZOOM_PRESETS } from "@/labs/ascii/workspace/types";

interface WorkspaceToolbarProps {
  state: WorkspaceState;
  hasOriginal: boolean;
  compact?: boolean;
  onZoom: (zoom: ZoomPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleOriginal: () => void;
  onOriginalModeChange: (mode: OriginalViewMode) => void;
  onToggleFocus: () => void;
  onPeekingChange: (peeking: boolean) => void;
}

export function WorkspaceToolbar({
  state,
  hasOriginal,
  compact = false,
  onZoom,
  onZoomIn,
  onZoomOut,
  onToggleOriginal,
  onOriginalModeChange,
  onToggleFocus,
  onPeekingChange,
}: WorkspaceToolbarProps) {
  const zoomLabel = (z: ZoomPreset) => (z === "fit" ? "Fit" : `${z * 100}%`);

  return (
    <div
      className={`flex flex-wrap items-center gap-1 border-b border-[var(--ui-border)] bg-[var(--bg-panel)]/95 px-2 py-1.5 backdrop-blur-sm ${
        compact ? "justify-center" : ""
      }`}
    >
      <ToolbarButton label="Zoom out" onClick={onZoomOut}>
        <Minus size={12} />
      </ToolbarButton>

      <div className="flex items-center gap-0.5">
        {ZOOM_PRESETS.map((preset) => (
          <button
            key={String(preset)}
            type="button"
            onClick={() => onZoom(preset)}
            className={`cursor-pointer rounded border px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
              state.zoom === preset
                ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10 text-[var(--phosphor-primary)]"
                : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
            }`}
          >
            {zoomLabel(preset)}
          </button>
        ))}
      </div>

      <ToolbarButton label="Zoom in" onClick={onZoomIn}>
        <Plus size={12} />
      </ToolbarButton>

      <span className="mx-1 hidden h-4 w-px bg-[var(--ui-border)] sm:inline" aria-hidden />

      {hasOriginal ? (
        <>
          <ToolbarButton
            label={state.showOriginal ? "Ocultar original" : "Mostrar original"}
            onClick={onToggleOriginal}
            active={state.showOriginal}
          >
            {state.showOriginal ? <Eye size={12} /> : <EyeOff size={12} />}
            <span className="hidden font-mono text-[9px] sm:inline">Original</span>
          </ToolbarButton>

          {state.showOriginal && !compact ? (
            <div className="flex items-center gap-0.5">
              {(["split", "overlay", "peek"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onOriginalModeChange(mode)}
                  className={`cursor-pointer rounded border px-1.5 py-0.5 font-mono text-[9px] capitalize transition-colors ${
                    state.originalMode === mode
                      ? "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
                      : "border-[var(--ui-border)] text-[var(--ui-text-dim)]"
                  }`}
                >
                  {mode === "peek" ? "Space" : mode}
                </button>
              ))}
            </div>
          ) : null}

          {state.showOriginal && state.originalMode === "overlay" ? (
            <button
              type="button"
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[9px] text-[var(--phosphor-primary)] select-none hover:border-[var(--phosphor-dim)]"
              onPointerDown={() => onPeekingChange(true)}
              onPointerUp={() => onPeekingChange(false)}
              onPointerLeave={() => onPeekingChange(false)}
            >
              Segurar Original
            </button>
          ) : null}
        </>
      ) : null}

      <span className="mx-1 hidden h-4 w-px bg-[var(--ui-border)] sm:inline" aria-hidden />

      <ToolbarButton
        label={state.focusMode ? "Sair do Focus Mode" : "Focus Mode"}
        onClick={onToggleFocus}
        active={state.focusMode}
      >
        {state.focusMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        {!compact ? <span className="hidden font-mono text-[9px] md:inline">Focus</span> : null}
      </ToolbarButton>

      {state.showOriginal && state.originalMode === "peek" && !compact ? (
        <span className="ml-auto hidden font-mono text-[8px] text-[var(--ui-text-dim)] lg:inline">
          <Scan size={10} className="mr-1 inline" />
          Espaço = peek
        </span>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1 rounded border px-1.5 py-1 font-mono text-[var(--phosphor-primary)] transition-colors hover:border-[var(--phosphor-dim)] ${
        active
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10"
          : "border-[var(--ui-border)]"
      }`}
    >
      {children}
    </button>
  );
}
