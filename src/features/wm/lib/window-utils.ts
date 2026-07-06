import { WINDOW_DEFAULTS } from "@/constants/window-manager";
import type { AppId, WindowState } from "@/types/root-os";

export function createDefaultWindow(
  appId: AppId,
  zIndex: number,
  index: number,
): WindowState {
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
