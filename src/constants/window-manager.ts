import type { AppId } from "@/types/root-os";

export const WINDOW_DEFAULTS = {
  width: 700,
  height: 520,
  minWidth: 420,
  minHeight: 320,
  cascadeOffset: 28,
} as const;

export const APP_TITLES: Record<AppId, string> = {
  profile: "Profile.app",
  projects: "Projects.app",
  editor: "Editor.app",
  timeline: "Timeline.app",
  monitor: "Monitor.app",
  mail: "Mail.app",
  finder: "Finder.app",
  resume: "Resume.app",
  architecture: "Arch.app",
  help: "Man.app",
};

export const WINDOW_OPEN_DURATION = 0.4;
export const TERMINAL_DOCK_DURATION = 0.35;
