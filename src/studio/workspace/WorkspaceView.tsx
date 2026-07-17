"use client";

import { useCallback, useEffect, useRef } from "react";

import { WorkspaceCanvas } from "@/studio/workspace/WorkspaceCanvas";
import { WorkspaceToolbar } from "@/studio/workspace/WorkspaceToolbar";
import type { WorkspaceViewportApi } from "@/studio/workspace/useWorkspaceViewport";
import { ZOOM_PRESETS } from "@/studio/workspace/types";

interface WorkspaceViewProps {
  workspace: WorkspaceViewportApi;
  hasOriginal?: boolean;
  originalUrl?: string | null;
  originalAlt?: string;
  footer?: React.ReactNode;
  /** Optional minimap when content is large */
  showNavigator?: boolean;
  children: React.ReactNode;
}

export function WorkspaceView({
  workspace,
  hasOriginal = false,
  originalUrl,
  originalAlt = "Original",
  footer,
  showNavigator = true,
  children,
}: WorkspaceViewProps) {
  const {
    state,
    setZoom,
    zoomIn,
    zoomOut,
    setPan,
    setShowOriginal,
    setOriginalMode,
    setWipePosition,
    toggleFocusMode,
    toggleFullscreen,
    setPeeking,
  } = workspace;
  const rootRef = useRef<HTMLDivElement>(null);

  const showOriginalLayer =
    hasOriginal &&
    state.showOriginal &&
    originalUrl &&
    (state.originalMode === "split" ||
      state.originalMode === "wipe" ||
      (state.originalMode === "overlay" && state.peeking) ||
      (state.originalMode === "peek" && state.peeking));

  const isSplit = hasOriginal && state.showOriginal && state.originalMode === "split" && originalUrl;
  const isWipe = hasOriginal && state.showOriginal && state.originalMode === "wipe" && originalUrl;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const order = [...ZOOM_PRESETS];
      const idx = order.indexOf(state.zoom);
      if (e.deltaY < 0) {
        setZoom(order[Math.min(order.length - 1, Math.max(0, idx) + 1)] ?? 8);
      } else {
        setZoom(order[Math.max(0, (idx < 0 ? 0 : idx) - 1)] ?? "fit");
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
    <div
      ref={rootRef}
      className={`relative flex min-h-0 flex-col ${
        state.fullscreen ? "fixed inset-0 z-50 bg-[var(--bg-void)]" : "h-full"
      }`}
    >
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
              onToggleFullscreen={toggleFullscreen}
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
          onToggleFullscreen={toggleFullscreen}
          onPeekingChange={setPeeking}
        />
      )}

      <div className={`relative flex min-h-0 flex-1 ${isSplit ? "grid grid-cols-2 gap-px bg-[var(--ui-border)]" : ""}`}>
        {isSplit ? (
          <div className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[var(--bg-void)] p-1">
            <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--phosphor-dim)]">
              Original
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt={originalAlt}
              className="max-h-full max-w-full object-contain"
              style={{
                transform: `translate(${state.pan.x}px, ${state.pan.y}px)`,
              }}
            />
          </div>
        ) : null}

        <div className="relative min-h-0 min-w-0 flex-1">
          {showOriginalLayer && !isSplit && !isWipe ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-void)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalUrl} alt={originalAlt} className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}

          <WorkspaceCanvas
            zoom={state.zoom}
            pan={state.pan}
            onPanChange={setPan}
            enablePan={!showOriginalLayer || state.originalMode === "split" || state.originalMode === "wipe"}
          >
            <div className="relative inline-block">
              {children}
              {isWipe ? (
                <div
                  className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - state.wipePosition * 100}% 0 0)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl!}
                    alt={originalAlt}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          </WorkspaceCanvas>

          {isWipe ? (
            <div className="absolute bottom-3 left-1/2 z-30 flex w-[min(280px,70%)] -translate-x-1/2 items-center gap-2 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/95 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-[9px] text-[var(--ui-text-dim)]">ASCII</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={state.wipePosition}
                onChange={(e) => setWipePosition(Number(e.target.value))}
                className="w-full accent-[var(--phosphor-primary)]"
                aria-label="Before / after wipe"
              />
              <span className="font-mono text-[9px] text-[var(--ui-text-dim)]">Original</span>
            </div>
          ) : null}

          {showNavigator && typeof state.zoom === "number" && state.zoom >= 2 ? (
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 h-20 w-28 overflow-hidden rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90">
              <div className="relative h-full w-full">
                {originalUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={originalUrl} alt="" className="h-full w-full object-contain opacity-40" />
                ) : (
                  <div className="h-full w-full bg-[var(--bg-void)]" />
                )}
                <div
                  className="absolute border border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10"
                  style={{
                    left: `${50 + state.pan.x * 0.05}%`,
                    top: `${50 + state.pan.y * 0.05}%`,
                    width: `${Math.max(12, 40 / state.zoom)}%`,
                    height: `${Math.max(12, 40 / state.zoom)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <span className="absolute left-1 top-0.5 font-mono text-[8px] uppercase text-[var(--phosphor-dim)]">
                Nav
              </span>
            </div>
          ) : null}
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
