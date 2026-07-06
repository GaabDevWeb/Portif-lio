"use client";

import { useEffect, useRef } from "react";

import { CHROME } from "@/constants/system";
import { APP_TITLES, WINDOW_DEFAULTS } from "@/constants/window-manager";
import { animateWindowOpen } from "@/animations/wm/window-transitions";
import { renderApp } from "@/features/apps/app-registry";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/providers/session-store";
import type { AppId } from "@/types/root-os";

interface WindowFrameProps {
  appId: AppId;
}

export function WindowFrame({ appId }: WindowFrameProps) {
  const windowState = useSessionStore((s) => s.windows[appId]);
  const focusedApp = useSessionStore((s) => s.focusedApp);
  const focusApp = useSessionStore((s) => s.focusApp);
  const closeApp = useSessionStore((s) => s.closeApp);
  const minimizeApp = useSessionStore((s) => s.minimizeApp);
  const maximizeApp = useSessionStore((s) => s.maximizeApp);
  const restoreApp = useSessionStore((s) => s.restoreApp);
  const updateWindow = useSessionStore((s) => s.updateWindow);

  const frameRef = useRef<HTMLDivElement>(null);
  const isFocused = focusedApp === appId;

  useEffect(() => {
    if (!frameRef.current || windowState?.minimized) return;
    animateWindowOpen(frameRef.current);
  }, [appId, windowState?.minimized, windowState]);

  if (!windowState || windowState.minimized) return null;

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (windowState.maximized) return;
    event.preventDefault();
    focusApp(appId);

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = windowState.x;
    const originY = windowState.y;

    const onMove = (moveEvent: PointerEvent) => {
      updateWindow(appId, {
        x: Math.max(0, originX + moveEvent.clientX - startX),
        y: Math.max(0, originY + moveEvent.clientY - startY),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={frameRef}
      data-window-app={appId}
      role="dialog"
      aria-label={APP_TITLES[appId]}
      className={cn(
        "absolute flex flex-col overflow-hidden border bg-[var(--ui-chrome)]",
        isFocused ? "border-[var(--phosphor-primary)]" : "border-[var(--ui-border)]",
      )}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={() => focusApp(appId)}
    >
      <header
        className="wm-titlebar flex cursor-grab items-center justify-between border-b border-[var(--ui-border)] px-3 active:cursor-grabbing"
        style={{ height: CHROME.titlebarHeight }}
        onPointerDown={startDrag}
      >
        <span className="font-mono text-xs text-[var(--ui-text)]">{APP_TITLES[appId]}</span>
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--phosphor-dim)]">
          <button
            type="button"
            aria-label="Minimize"
            className="min-h-11 min-w-11 cursor-pointer px-1 hover:brightness-125"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => minimizeApp(appId)}
          >
            _
          </button>
          <button
            type="button"
            aria-label={windowState.maximized ? "Restore" : "Maximize"}
            className="min-h-11 min-w-11 cursor-pointer px-1 hover:brightness-125"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() =>
              windowState.maximized ? restoreApp(appId) : maximizeApp(appId)
            }
          >
            [ ]
          </button>
          <button
            type="button"
            aria-label="Close"
            className="min-h-11 min-w-11 cursor-pointer px-1 hover:text-[var(--stderr)]"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => closeApp(appId)}
          >
            X
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto bg-[var(--bg-void)]">{renderApp(appId)}</div>
      {!windowState.maximized && (
        <div
          className="absolute right-0 bottom-0 h-3 w-3 cursor-se-resize"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            focusApp(appId);
            const startX = event.clientX;
            const startY = event.clientY;
            const startW = windowState.width;
            const startH = windowState.height;

            const onMove = (moveEvent: PointerEvent) => {
              updateWindow(appId, {
                width: Math.max(WINDOW_DEFAULTS.minWidth, startW + moveEvent.clientX - startX),
                height: Math.max(WINDOW_DEFAULTS.minHeight, startH + moveEvent.clientY - startY),
              });
            };

            const onUp = () => {
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onUp);
            };

            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
