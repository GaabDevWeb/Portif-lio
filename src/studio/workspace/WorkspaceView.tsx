"use client";

import { useCallback, useEffect, useRef } from "react";

import { WorkspaceCanvas } from "@/studio/workspace/WorkspaceCanvas";
import { WorkspaceToolbar } from "@/studio/workspace/WorkspaceToolbar";
import type { WorkspaceViewportApi } from "@/studio/workspace/useWorkspaceViewport";
import type { ZoomPreset } from "@/studio/workspace/types";

interface WorkspaceViewProps {
  workspace: WorkspaceViewportApi;
  hasOriginal?: boolean;
  originalUrl?: string | null;
  originalAlt?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkspaceView({
  workspace,
  hasOriginal = false,
  originalUrl,
  originalAlt = "Original",
  footer,
  children,
}: WorkspaceViewProps) {
  const { state, setZoom, zoomIn, zoomOut, setPan, setShowOriginal, setOriginalMode, toggleFocusMode, setPeeking } =
    workspace;
  const rootRef = useRef<HTMLDivElement>(null);

  const showOriginalLayer =
    hasOriginal &&
    state.showOriginal &&
    originalUrl &&
    (state.originalMode === "split" ||
      (state.originalMode === "overlay" && state.peeking) ||
      (state.originalMode === "peek" && state.peeking));

  const isSplit = hasOriginal && state.showOriginal && state.originalMode === "split" && originalUrl;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const order: ZoomPreset[] = ["fit", 1, 2, 4, 8];
      const idx = order.indexOf(state.zoom);
      if (e.deltaY < 0) {
        setZoom(order[Math.min(order.length - 1, idx + 1)] ?? 8);
      } else {
        setZoom(order[Math.max(0, idx - 1)] ?? "fit");
      }
    },
    [setZoom, state.zoom],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <div ref={rootRef} className="relative flex h-full min-h-0 flex-col">
      {state.focusMode ? (
        <div className="pointer-events-none absolute right-2 top-2 z-30">
          <div className="pointer-events-auto rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/95 shadow-lg backdrop-blur-sm">
            <WorkspaceToolbar
              state={state}
              hasOriginal={hasOriginal}
              compact
              onZoom={setZoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onToggleOriginal={() => setShowOriginal(!state.showOriginal)}
              onOriginalModeChange={setOriginalMode}
              onToggleFocus={toggleFocusMode}
              onPeekingChange={setPeeking}
            />
          </div>
        </div>
      ) : (
        <WorkspaceToolbar
          state={state}
          hasOriginal={hasOriginal}
          onZoom={setZoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onToggleOriginal={() => setShowOriginal(!state.showOriginal)}
          onOriginalModeChange={setOriginalMode}
          onToggleFocus={toggleFocusMode}
          onPeekingChange={setPeeking}
        />
      )}

      <div className={`relative flex min-h-0 flex-1 ${isSplit ? "grid grid-cols-2 gap-px bg-[var(--ui-border)]" : ""}`}>
        {isSplit ? (
          <div className="relative flex min-h-0 items-center justify-center bg-[var(--bg-void)] p-1">
            <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--phosphor-dim)]">
              Original
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={originalUrl} alt={originalAlt} className="max-h-full max-w-full object-contain" />
          </div>
        ) : null}

        <div className="relative min-h-0 min-w-0 flex-1">
          {showOriginalLayer && !isSplit ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-void)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalUrl} alt={originalAlt} className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}

          <WorkspaceCanvas
            zoom={state.zoom}
            pan={state.pan}
            onPanChange={setPan}
            enablePan={!showOriginalLayer || state.originalMode === "split"}
          >
            {children}
          </WorkspaceCanvas>
        </div>
      </div>

      {footer ? (
        <div
          className={`border-t border-[var(--ui-border)] ${
            state.focusMode ? "bg-[var(--bg-panel)]/90" : "bg-[var(--bg-panel)]"
          }`}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
