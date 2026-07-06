import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { trackAppOpen, trackEasterEgg } from "@/lib/analytics/track";
import { SYSTEM, STORAGE_KEYS, CHROME } from "@/constants/system";
import { WINDOW_DEFAULTS } from "@/constants/window-manager";
import {
  createDefaultWindow,
  cycleFocusApp,
} from "@/features/wm/lib/window-utils";
import type { AppId, SessionPhase, WindowState } from "@/types/root-os";

interface SessionFlags {
  easterEggs: string[];
  chaptersComplete: number[];
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
  windows: Partial<Record<AppId, WindowState>>;
  maxZIndex: number;
  selectedProjectSlug: string | null;
  editorFile: string | null;
  fastboot: boolean;
  flags: SessionFlags;
  lastExitCode: number | null;
  visualEffect: import("@/types/root-os").VisualEffect;
  setPhase: (phase: SessionPhase) => void;
  setUser: (user: string) => void;
  setIsRoot: (value: boolean) => void;
  setCwd: (cwd: string) => void;
  setFastboot: (value: boolean) => void;
  openApp: (appId: AppId) => void;
  closeApp: (appId: AppId) => void;
  focusApp: (appId: AppId) => void;
  minimizeApp: (appId: AppId) => void;
  maximizeApp: (appId: AppId) => void;
  restoreApp: (appId: AppId) => void;
  updateWindow: (appId: AppId, patch: Partial<WindowState>) => void;
  cycleFocus: () => void;
  setSelectedProject: (slug: string | null) => void;
  setEditorFile: (path: string | null) => void;
  markChapterComplete: (chapter: number) => void;
  markEasterEgg: (id: string) => void;
  setVisualEffect: (effect: import("@/types/root-os").VisualEffect) => void;
  addHistoryEntry: (entry: string) => void;
  clearHistory: () => void;
  setLastExitCode: (code: number | null) => void;
  initiateShutdown: () => void;
  rebootFromShutdown: () => void;
  resetSession: () => void;
}

const initialFlags: SessionFlags = {
  easterEggs: [],
  chaptersComplete: [],
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
        : createDefaultWindow(appId, nextZ, state.openApps.length),
    },
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      phase: "BLACKOUT",
      user: SYSTEM.defaultUser,
      isRoot: false,
      cwd: SYSTEM.homeDir,
      history: [],
      openApps: [],
      focusStack: [],
      focusedApp: null,
      windows: {},
      maxZIndex: 10,
      selectedProjectSlug: null,
      editorFile: null,
      fastboot: false,
      flags: initialFlags,
      lastExitCode: null,
      visualEffect: null,

      setPhase: (phase) => set({ phase }),
      setUser: (user) => set({ user }),
      setIsRoot: (isRoot) => set({ isRoot }),
      setCwd: (cwd) => set({ cwd }),
      setFastboot: (fastboot) => set({ fastboot }),

      openApp: (appId) =>
        set((state) => {
          trackAppOpen(appId);
          const zPatch = bumpZIndex(state, appId);
          const openApps = state.openApps.includes(appId)
            ? state.openApps
            : [...state.openApps, appId];
          const focusStack = [...state.focusStack.filter((id) => id !== appId), appId];
          return {
            ...zPatch,
            openApps,
            focusStack,
            focusedApp: appId,
            phase: "APP_OPEN",
          };
        }),

      closeApp: (appId) =>
        set((state) => {
          const openApps = state.openApps.filter((id) => id !== appId);
          const focusStack = state.focusStack.filter((id) => id !== appId);
          const focusedApp = focusStack.at(-1) ?? null;
          const windows = { ...state.windows };
          delete windows[appId];
          return {
            openApps,
            focusStack,
            focusedApp,
            windows,
            phase: openApps.length === 0 ? "SHELL" : "APP_OPEN",
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
          return {
            windows: {
              ...state.windows,
              [appId]: {
                ...win,
                maximized: true,
                preMaximize: { x: win.x, y: win.y, width: win.width, height: win.height },
                x: margin,
                y: margin,
                width: typeof window !== "undefined"
                  ? window.innerWidth - margin * 2
                  : win.width,
                height: typeof window !== "undefined"
                  ? window.innerHeight - taskbar - margin * 2
                  : win.height,
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
          phase: "BLACKOUT",
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
        })),

      resetSession: () =>
        set({
          phase: "BLACKOUT",
          user: SYSTEM.defaultUser,
          isRoot: false,
          cwd: SYSTEM.homeDir,
          openApps: [],
          focusStack: [],
          focusedApp: null,
          windows: {},
          maxZIndex: 10,
          selectedProjectSlug: null,
          editorFile: null,
          lastExitCode: null,
          flags: initialFlags,
        }),
    }),
    {
      name: STORAGE_KEYS.user,
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
  };
}

export function applyCommandResult(
  result: import("@/types/root-os").CommandResult,
): void {
  const store = useSessionStore.getState();

  if (result.cwd) store.setCwd(result.cwd);
  if (result.openApp) store.openApp(result.openApp);
  if (result.closeApp) store.closeApp(result.closeApp);
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
  store.setLastExitCode(result.exitCode);
}

export { WINDOW_DEFAULTS };
