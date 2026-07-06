export const SYSTEM = {
  name: "ROOT OS",
  version: "0.2.0",
  tagline: "personal kernel space",
  hostname: "devbox.local",
  defaultUser: "guest",
  homeDir: "/home/guest",
  promptChar: "$",
  rootPromptChar: "#",
} as const;

export const STORAGE_KEYS = {
  history: "rootos:history",
  fastboot: "rootos:fastboot",
  user: "rootos:user",
  easterEggs: "rootos:easter-eggs",
  chaptersComplete: "rootos:chapters",
} as const;

export const TERMINAL = {
  maxHistory: 500,
  fontSize: 14,
  fontSizeMobile: 16,
  cursorBlinkMs: 530,
  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
} as const;

export const EXIT_CODES = {
  success: 0,
  general: 1,
  misuse: 2,
  notFound: 127,
  interrupted: 130,
} as const;

export const CHROME = {
  titlebarHeight: 28,
  taskbarHeight: 36,
  hudHeight: 48,
} as const;
