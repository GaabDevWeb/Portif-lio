export type AsciiIconId =
  | "cpu"
  | "ram"
  | "disk"
  | "folder"
  | "project"
  | "git"
  | "branch"
  | "window"
  | "music"
  | "network"
  | "download"
  | "upload"
  | "terminal"
  | "warning"
  | "success"
  | "error";

const ICONS: Record<AsciiIconId, string> = {
  cpu: "[CPU]",
  ram: "[RAM]",
  disk: "[DSK]",
  folder: "[DIR]",
  project: "[APP]",
  git: "[GIT]",
  branch: "[BR]",
  window: "[WM]",
  music: "[MUS]",
  network: "[NET]",
  download: "[DL]",
  upload: "[UL]",
  terminal: "[TTY]",
  warning: "[!]",
  success: "[ok]",
  error: "[xx]",
};

export function icon(id: AsciiIconId): string {
  return ICONS[id];
}

