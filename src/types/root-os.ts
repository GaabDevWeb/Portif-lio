export type SessionPhase =
  | "LANDING"
  | "CINEMA"
  | "APP_OPEN"
  | "SHUTDOWN"
  /** @deprecated alias — use LANDING */
  | "SHELL"
  | "BLACKOUT"
  | "BOOT"
  | "LOGIN";

export type SectionId =
  | "hero"
  | "manifesto"
  | "projects"
  | "process"
  | "knowledge"
  | "timeline"
  | "contact"
  | "footer";

export type SyncOrigin = "landing" | "terminal" | "wm" | "system";

export type CoreAppId =
  | "terminal"
  | "media"
  | "profile"
  | "projects"
  | "editor"
  | "timeline"
  | "monitor"
  | "mail"
  | "finder"
  | "resume"
  | "architecture"
  | "help";

export type AppId = CoreAppId | `project-${string}`;

export type CommandCategory =
  | "navigation"
  | "system"
  | "portfolio"
  | "easter";

export type VfsNodeType = "file" | "directory";

export interface VfsFileNode {
  type: "file";
  name: string;
  content: string;
  contentRef?: string;
}

export interface VfsDirectoryNode {
  type: "directory";
  name: string;
  children: Record<string, VfsNode>;
}

export type VfsNode = VfsFileNode | VfsDirectoryNode;

export interface ParsedPipeline {
  argv: string[];
  redirects: Redirect[];
}

export interface Redirect {
  type: "stdout" | "stderr" | "append";
  target: string;
}

export type VisualEffect = "matrix" | "konami" | null;

export interface CommandContext {
  cwd: string;
  user: string;
  isRoot: boolean;
  hostname: string;
  homeDir: string;
  history: string[];
  openApps: AppId[];
  focusedApp: AppId | null;
  chaptersComplete: number[];
  easterEggs: string[];
  activeSection: SectionId;
}

export interface CommandOutputLine {
  stream: "stdout" | "stderr";
  text: string;
}

export interface CommandResult {
  exitCode: number;
  lines: CommandOutputLine[];
  cwd?: string;
  openApp?: AppId;
  closeApp?: AppId;
  openProject?: string;
  clearScreen?: boolean;
  clearHistory?: boolean;
  chapterComplete?: number;
  selectedProject?: string | null;
  editorFile?: string | null;
  shutdown?: boolean;
  easterEgg?: string;
  visualEffect?: VisualEffect;
  isRoot?: boolean;
  setUser?: string;
  gotoSection?: SectionId;
  toggleTerminal?: boolean;
}

export interface CommandDefinition {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  category: CommandCategory;
  chapter?: number;
  opensApp?: AppId;
  execute: (
    ctx: CommandContext,
    argv: string[],
  ) => CommandResult | Promise<CommandResult>;
  autocomplete?: (ctx: CommandContext, partial: string) => string[];
}

export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export interface ProfileContent {
  name: string;
  role: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string;
  location: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  year: number;
  role: string;
  stack: string[];
  summary: string;
  featured: boolean;
  links?: {
    demo?: string;
    repo?: string;
  };
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
}

export interface WindowState {
  appId: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  preMaximize?: Pick<WindowState, "x" | "y" | "width" | "height">;
}

export type SyncEvent =
  | { type: "section.enter"; origin: SyncOrigin; section: SectionId }
  | { type: "section.goto"; origin: SyncOrigin; section: SectionId }
  | { type: "project.open"; origin: SyncOrigin; slug: string; title: string }
  | { type: "project.close"; origin: SyncOrigin; slug: string; title: string }
  | { type: "terminal.toggle"; origin: SyncOrigin; visible: boolean }
  | { type: "terminal.writeln"; origin: SyncOrigin; lines: string[] }
  | { type: "contact.compose"; origin: SyncOrigin }
  | { type: "resume.download"; origin: SyncOrigin };
