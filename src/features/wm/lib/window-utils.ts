import { WINDOW_DEFAULTS } from "@/constants/window-manager";
import type { AppId, WindowState } from "@/types/root-os";

import { getLastPointerPosition, type PointerPosition } from "./pointer-tracker";

export { WINDOW_DEFAULTS };

export const TERMINAL_WINDOW = {
  width: 640,
  height: 420,
  minWidth: 480,
  minHeight: 320,
  maxWidth: 720,
  maxHeight: 520,
} as const;

const HUD_HEIGHT = 48;
const TASKBAR_HEIGHT = 36;
const VIEWPORT_MARGIN = 8;

export interface ViewportBounds {
  width: number;
  height: number;
}

function getViewport(): ViewportBounds {
  if (typeof window === "undefined") {
    return { width: 1200, height: 800 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

export function clampWindowPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: ViewportBounds = getViewport(),
): { x: number; y: number } {
  const minX = VIEWPORT_MARGIN;
  const minY = HUD_HEIGHT;
  const maxX = Math.max(minX, viewport.width - width - VIEWPORT_MARGIN);
  const maxY = Math.max(minY, viewport.height - TASKBAR_HEIGHT - height - VIEWPORT_MARGIN);

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

export function placeWindowAtPointer(
  width: number,
  height: number,
  pointer: PointerPosition,
  cascadeIndex = 0,
  viewport: ViewportBounds = getViewport(),
): { x: number; y: number } {
  const offset = cascadeIndex * WINDOW_DEFAULTS.cascadeOffset;
  const centeredX = pointer.x - width / 2 + offset;
  const centeredY = pointer.y - height / 2 + offset;
  return clampWindowPosition(centeredX, centeredY, width, height, viewport);
}

function resolvePointer(pointer?: PointerPosition): PointerPosition {
  return pointer ?? getLastPointerPosition();
}

function terminalDimensions(viewport: ViewportBounds) {
  const width = Math.min(
    TERMINAL_WINDOW.maxWidth,
    Math.max(TERMINAL_WINDOW.minWidth, TERMINAL_WINDOW.width),
    viewport.width - VIEWPORT_MARGIN * 2,
  );
  const height = Math.min(
    TERMINAL_WINDOW.maxHeight,
    Math.max(TERMINAL_WINDOW.minHeight, TERMINAL_WINDOW.height),
    viewport.height - HUD_HEIGHT - TASKBAR_HEIGHT - VIEWPORT_MARGIN * 2,
  );
  return { width, height };
}

export function createInitialWindow(
  appId: AppId,
  zIndex: number,
  index: number,
  pointer?: PointerPosition,
): WindowState {
  const viewport = getViewport();
  const pt = resolvePointer(pointer);

  if (appId === "terminal") {
    const { width, height } = terminalDimensions(viewport);
    const { x, y } = placeWindowAtPointer(width, height, pt, index, viewport);
    return {
      appId,
      x,
      y,
      width,
      height,
      minimized: false,
      maximized: false,
      zIndex,
    };
  }

  if (appId === "media") {
    const width = 360;
    const height = Math.min(520, viewport.height - HUD_HEIGHT - TASKBAR_HEIGHT - VIEWPORT_MARGIN * 2);
    const { x, y } = placeWindowAtPointer(width, height, pt, index, viewport);
    return {
      appId,
      x,
      y,
      width,
      height,
      minimized: false,
      maximized: false,
      zIndex,
    };
  }

  if (typeof appId === "string" && appId.startsWith("project-")) {
    const width = Math.min(820, viewport.width - VIEWPORT_MARGIN * 2);
    const height = Math.min(560, viewport.height - HUD_HEIGHT - TASKBAR_HEIGHT - VIEWPORT_MARGIN * 2);
    const { x, y } = placeWindowAtPointer(width, height, pt, index, viewport);
    return {
      appId,
      x,
      y,
      width,
      height,
      minimized: false,
      maximized: false,
      zIndex,
    };
  }

  const width = Math.min(WINDOW_DEFAULTS.width, viewport.width - VIEWPORT_MARGIN * 2);
  const height = Math.min(
    WINDOW_DEFAULTS.height,
    viewport.height - HUD_HEIGHT - TASKBAR_HEIGHT - VIEWPORT_MARGIN * 2,
  );
  const { x, y } = placeWindowAtPointer(width, height, pt, index, viewport);

  return {
    appId,
    x,
    y,
    width,
    height,
    minimized: false,
    maximized: false,
    zIndex,
  };
}

/** @deprecated use createInitialWindow */
export const createDefaultWindow = createInitialWindow;

export function getNextFocusedApp(
  focusStack: AppId[],
  closedApp: AppId,
): AppId | null {
  const remaining = focusStack.filter((id) => id !== closedApp);
  return remaining[remaining.length - 1] ?? null;
}

export function cycleFocusApp(
  openApps: AppId[],
  current: AppId | null,
): AppId | null {
  if (openApps.length === 0) return null;
  if (!current) return openApps[0];
  const idx = openApps.indexOf(current);
  const next = (idx + 1) % openApps.length;
  return openApps[next];
}
