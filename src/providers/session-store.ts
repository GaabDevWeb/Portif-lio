import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CHROME, SYSTEM } from "@/constants/system";
import { WINDOW_DEFAULTS } from "@/constants/window-manager";
import { dispatchSyncEvent, handleSyncSideEffects } from "@/features/sync/sync-bus";
import {
  createInitialWindow,
  cycleFocusApp,
  TERMINAL_WINDOW,
} from "@/features/wm/lib/window-utils";
import { projectAppId, getProjectSlugFromAppId } from "@/lib/app-id";
import { getProjectBySlug } from "@/lib/content/projects";
import { trackAppOpen, trackEasterEgg } from "@/lib/analytics/track";
import type { AppId, SectionId, SessionPhase, SyncEvent, SyncOrigin } from "@/types/root-os";
import type { WindowState } from "@/types/root-os";

interface SessionFlags {
  easterEggs: string[];
  chaptersComplete: number[];
  cinemaSeen: boolean;
}

interface SessionState {
  phase: SessionPhase;
  user: string;
  isRoot: boolean;
  cwd: string;
  history: string[];
  openApps: AppId[];
  focusStack: AppId[];
  focusedApp: AppId | null;
  windows: Record<string, WindowState>;
  maxZIndex: number;
  selectedProjectSlug: string | null;
  editorFile: string | null;
  fastboot: boolean;
  activeSection: SectionId;
  flags: SessionFlags;
  lastExitCode: number | null;
  visualEffect: import("@/types/root-os").VisualEffect;
  setPhase: (phase: SessionPhase) => void;
  setUser: (user: string) => void;
  setIsRoot: (value: boolean) => void;
  setCwd: (cwd: string) => void;
  setFastboot: (value: boolean) => void;
  setActiveSection: (section: SectionId) => void;
  openApp: (appId: AppId, origin?: SyncOrigin) => void;
  openProject: (slug: string, origin?: SyncOrigin) => void;
  closeApp: (appId: AppId, origin?: SyncOrigin) => void;
  focusApp: (appId: AppId) => void;
  minimizeApp: (appId: AppId) => void;
  maximizeApp: (appId: AppId) => void;
  restoreApp: (appId: AppId) => void;
  updateWindow: (appId: AppId, patch: Partial<WindowState>) => void;
  cycleFocus: () => void;
  toggleTerminal: (origin?: SyncOrigin) => void;
  setSelectedProject: (slug: string | null) => void;
  setEditorFile: (path: string | null) => void;
  markChapterComplete: (chapter: number) => void;
  markEasterEgg: (id: string) => void;
  markCinemaSeen: () => void;
  setVisualEffect: (effect: import("@/types/root-os").VisualEffect) => void;
  addHistoryEntry: (entry: string) => void;
  clearHistory: () => void;
  setLastExitCode: (code: number | null) => void;
  initiateShutdown: () => void;
  rebootFromShutdown: () => void;
  resetSession: () => void;
  emitSync: (event: SyncEvent) => void;
}

const initialFlags: SessionFlags = {
  easterEggs: [],
  chaptersComplete: [],
  cinemaSeen: false,
};

function bumpZIndex(state: SessionState, appId: AppId) {
  const nextZ = state.maxZIndex + 1;
  const existing = state.windows[appId];
  return {
    maxZIndex: nextZ,
    windows: {
      ...state.windows,
      [appId]: existing
        ? { ...existing, zIndex: nextZ, minimized: false }
        : createInitialWindow(appId, nextZ, state.openApps.length),
    },
  };
}

function isTerminalOpen(state: SessionState): boolean {
  return state.openApps.includes("terminal");
}

function landingPhase(openApps: AppId[]): SessionPhase {
  return openApps.length === 0 ? "LANDING" : "APP_OPEN";
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      phase: "LANDING",
      user: "guest",
      isRoot: false,
      cwd: "/home/guest",
      history: [],
      openApps: [],
      focusStack: [],
      focusedApp: null,
      windows: {},
      maxZIndex: 10,
      selectedProjectSlug: null,
      editorFile: null,
      fastboot: false,
      activeSection: "hero",
      flags: initialFlags,
      lastExitCode: null,
      visualEffect: null,

      setPhase: (phase) => set({ phase }),
      setUser: (user) => set({ user }),
      setIsRoot: (isRoot) => set({ isRoot }),
      setCwd: (cwd) => set({ cwd }),
      setFastboot: (fastboot) => set({ fastboot }),

      setActiveSection: (section) =>
        set((state) => {
          if (state.activeSection === section) return state;
          return { activeSection: section };
        }),

      emitSync: (event) => {
        const state = get();
        handleSyncSideEffects(event, {
          terminalOpen: isTerminalOpen(state),
          activeSection: state.activeSection,
        });
        dispatchSyncEvent(event);
      },

      openApp: (appId, origin = "system") =>
        set((state) => {
          trackAppOpen(appId);
          const zPatch = bumpZIndex(state, appId);
          const openApps = state.openApps.includes(appId)
            ? state.openApps
            : [...state.openApps, appId];
          const focusStack = [...state.focusStack.filter((id) => id !== appId), appId];
          const next = {
            ...zPatch,
            openApps,
            focusStack,
            focusedApp: appId,
            phase: landingPhase(openApps) as SessionPhase,
          };
          queueMicrotask(() => {
            get().emitSync({ type: "terminal.toggle", origin, visible: appId === "terminal" });
          });
          return next;
        }),

      openProject: (slug, origin = "landing") => {
        const project = getProjectBySlug(slug);
        if (!project) return;
        const appId = projectAppId(slug);
        get().setSelectedProject(slug);
        get().openApp(appId, origin);
        get().emitSync({
          type: "project.open",
          origin,
          slug,
          title: project.title,
        });
      },

      closeApp: (appId, origin = "system") =>
        set((state) => {
          const openApps = state.openApps.filter((id) => id !== appId);
          const focusStack = state.focusStack.filter((id) => id !== appId);
          const focusedApp = focusStack.at(-1) ?? null;
          const windows = { ...state.windows };
          delete windows[appId];

          const slug = getProjectSlugFromAppId(appId);
          if (slug && origin === "wm") {
            const project = getProjectBySlug(slug);
            queueMicrotask(() => {
              get().emitSync({
                type: "project.close",
                origin: "wm",
                slug,
                title: project?.title ?? slug,
              });
            });
          }

          return {
            openApps,
            focusStack,
            focusedApp,
            windows,
            phase: landingPhase(openApps),
          };
        }),

      focusApp: (appId) =>
        set((state) => {
          if (!state.openApps.includes(appId)) return state;
          const zPatch = bumpZIndex(state, appId);
          return {
            ...zPatch,
            focusedApp: appId,
            focusStack: [...state.focusStack.filter((id) => id !== appId), appId],
          };
        }),

      minimizeApp: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;
          return {
            windows: {
              ...state.windows,
              [appId]: { ...win, minimized: true },
            },
          };
        }),

      maximizeApp: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win || win.maximized) return state;
          const margin = 16;
          const taskbar = CHROME.taskbarHeight;
          const viewportH = typeof window !== "undefined" ? window.innerHeight : win.height;
          const viewportW = typeof window !== "undefined" ? window.innerWidth : win.width;
          const maxHeight =
            appId === "terminal"
              ? Math.floor(viewportH * TERMINAL_WINDOW.maxHeightRatio)
              : viewportH - taskbar - margin * 2;

          return {
            windows: {
              ...state.windows,
              [appId]: {
                ...win,
                maximized: true,
                preMaximize: { x: win.x, y: win.y, width: win.width, height: win.height },
                x: margin,
                y: margin,
                width: viewportW - margin * 2,
                height: maxHeight,
              },
            },
          };
        }),

      restoreApp: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;
          if (win.maximized && win.preMaximize) {
            return {
              windows: {
                ...state.windows,
                [appId]: {
                  ...win,
                  ...win.preMaximize,
                  maximized: false,
                  minimized: false,
                  preMaximize: undefined,
                },
              },
            };
          }
          return {
            windows: {
              ...state.windows,
              [appId]: { ...win, minimized: false },
            },
          };
        }),

      updateWindow: (appId, patch) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;
          return {
            windows: {
              ...state.windows,
              [appId]: { ...win, ...patch, maximized: false, preMaximize: undefined },
            },
          };
        }),

      cycleFocus: () =>
        set((state) => {
          const visibleApps = state.openApps.filter(
            (id) => !state.windows[id]?.minimized,
          );
          const next = cycleFocusApp(visibleApps, state.focusedApp);
          if (!next) return state;
          const zPatch = bumpZIndex(state, next);
          return {
            ...zPatch,
            focusedApp: next,
            focusStack: [...state.focusStack.filter((id) => id !== next), next],
          };
        }),

      toggleTerminal: (origin = "landing") => {
        const state = get();
        if (isTerminalOpen(state)) {
          get().closeApp("terminal", origin);
        } else {
          get().openApp("terminal", origin);
        }
      },

      setSelectedProject: (slug) => set({ selectedProjectSlug: slug }),
      setEditorFile: (path) => set({ editorFile: path }),

      markChapterComplete: (chapter) =>
        set((state) => {
          if (state.flags.chaptersComplete.includes(chapter)) return state;
          return {
            flags: {
              ...state.flags,
              chaptersComplete: [...state.flags.chaptersComplete, chapter],
            },
          };
        }),

      markEasterEgg: (id) =>
        set((state) => {
          if (state.flags.easterEggs.includes(id)) return state;
          trackEasterEgg(id);
          return {
            flags: {
              ...state.flags,
              easterEggs: [...state.flags.easterEggs, id],
            },
          };
        }),

      markCinemaSeen: () =>
        set((state) => ({
          flags: { ...state.flags, cinemaSeen: true },
        })),

      setVisualEffect: (visualEffect) => set({ visualEffect }),

      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [...state.history, entry].slice(-500),
        })),

      clearHistory: () => set({ history: [] }),

      setLastExitCode: (code) => set({ lastExitCode: code }),

      initiateShutdown: () => set({ phase: "SHUTDOWN" }),

      rebootFromShutdown: () =>
        set((state) => ({
          phase: "LANDING",
          openApps: [],
          focusStack: [],
          focusedApp: null,
          windows: {},
          maxZIndex: 10,
          selectedProjectSlug: null,
          editorFile: null,
          lastExitCode: null,
          flags: state.flags,
          history: state.history,
          fastboot: state.fastboot,
          activeSection: "hero",
        })),

      resetSession: () =>
        set({
          phase: "LANDING",
          user: "guest",
          isRoot: false,
          cwd: "/home/guest",
          openApps: [],
          focusStack: [],
          focusedApp: null,
          windows: {},
          maxZIndex: 10,
          selectedProjectSlug: null,
          editorFile: null,
          lastExitCode: null,
          activeSection: "hero",
          flags: initialFlags,
        }),
    }),
    {
      name: "rootos:user",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        fastboot: state.fastboot,
        history: state.history,
        flags: state.flags,
      }),
    },
  ),
);

export function buildCommandContext(): import("@/types/root-os").CommandContext {
  const state = useSessionStore.getState();
  return {
    cwd: state.cwd,
    user: state.user,
    isRoot: state.isRoot,
    hostname: SYSTEM.hostname,
    homeDir: SYSTEM.homeDir,
    history: state.history,
    openApps: state.openApps,
    focusedApp: state.focusedApp,
    chaptersComplete: state.flags.chaptersComplete,
    easterEggs: state.flags.easterEggs,
    activeSection: state.activeSection,
  };
}

export function applyCommandResult(
  result: import("@/types/root-os").CommandResult,
): void {
  const store = useSessionStore.getState();

  if (result.cwd) store.setCwd(result.cwd);
  if (result.openApp) store.openApp(result.openApp, "terminal");
  if (result.openProject) store.openProject(result.openProject, "terminal");
  if (result.closeApp) store.closeApp(result.closeApp, "terminal");
  if (result.chapterComplete) store.markChapterComplete(result.chapterComplete);
  if (result.selectedProject !== undefined) {
    store.setSelectedProject(result.selectedProject);
  }
  if (result.editorFile !== undefined) {
    store.setEditorFile(result.editorFile);
  }
  if (result.clearHistory) store.clearHistory();
  if (result.shutdown) store.initiateShutdown();
  if (result.easterEgg) store.markEasterEgg(result.easterEgg);
  if (result.visualEffect !== undefined) store.setVisualEffect(result.visualEffect);
  if (result.setUser) store.setUser(result.setUser);
  if (result.isRoot !== undefined) store.setIsRoot(result.isRoot);
  if (result.gotoSection) {
    store.setActiveSection(result.gotoSection);
    store.emitSync({
      type: "section.goto",
      origin: "terminal",
      section: result.gotoSection,
    });
    if (result.gotoSection === "contact") {
      store.emitSync({ type: "contact.compose", origin: "terminal" });
    }
  }
  if (result.toggleTerminal) store.toggleTerminal("terminal");
  store.setLastExitCode(result.exitCode);
}

export { WINDOW_DEFAULTS };
