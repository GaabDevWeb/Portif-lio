import type { AppId } from "@/types/root-os";

export const WINDOW_DEFAULTS = {
  width: 700,
  height: 520,
  minWidth: 420,
  minHeight: 320,
  cascadeOffset: 28,
} as const;

/** @deprecated use getAppTitle from @/lib/app-id */
export const APP_TITLES = {} as Record<AppId, string>;

export const WINDOW_OPEN_DURATION = 0.4;
export const TERMINAL_DOCK_DURATION = 0.35;
