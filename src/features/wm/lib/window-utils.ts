import { WINDOW_DEFAULTS } from "@/constants/window-manager";
import type { AppId, WindowState } from "@/types/root-os";

export { WINDOW_DEFAULTS };

export const TERMINAL_WINDOW = {
  defaultHeight: 240,
  minHeight: 180,
  maxHeightRatio: 0.8,
} as const;

export function createInitialWindow(
  appId: AppId,
  zIndex: number,
  index: number,
): WindowState {
  if (appId === "terminal" && typeof window !== "undefined") {
    const margin = 16;
    const taskbar = 36;
    const height = TERMINAL_WINDOW.defaultHeight;
    return {
      appId,
      x: margin,
      y: window.innerHeight - taskbar - height - margin,
      width: window.innerWidth - margin * 2,
      height,
      minimized: false,
      maximized: false,
      zIndex,
    };
  }

  if (appId === "media" && typeof window !== "undefined") {
    const margin = 16;
    const hud = 48;
    const width = 360;
    const height = 520;
    return {
      appId,
      x: Math.max(margin, window.innerWidth - width - margin),
      y: hud + margin,
      width,
      height: Math.min(height, window.innerHeight - hud - 36 - margin * 2),
      minimized: false,
      maximized: false,
      zIndex,
    };
  }

  if (typeof appId === "string" && appId.startsWith("project-")) {
    const offset = index * WINDOW_DEFAULTS.cascadeOffset;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      appId,
      x: Math.min(64 + offset, vw - WINDOW_DEFAULTS.width - 24),
      y: Math.min(48 + offset, vh - WINDOW_DEFAULTS.height - 80),
      width: Math.min(820, vw - 48),
      height: Math.min(560, vh - 120),
      minimized: false,
      maximized: false,
      zIndex,
    };
  }

  const offset = index * WINDOW_DEFAULTS.cascadeOffset;
  return {
    appId,
    x: 48 + offset,
    y: 48 + offset,
    width: WINDOW_DEFAULTS.width,
    height: WINDOW_DEFAULTS.height,
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
  const index = openApps.indexOf(current);
  const next = (index + 1) % openApps.length;
  return openApps[next];
}
