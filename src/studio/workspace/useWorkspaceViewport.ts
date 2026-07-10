"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_WORKSPACE_STATE,
  ZOOM_PRESETS,
  type OriginalViewMode,
  type WorkspacePan,
  type WorkspaceState,
  type ZoomPreset,
} from "@/studio/workspace/types";

const FIT_MODES: ZoomPreset[] = ["fit", "fit-width", "fit-height"];

export function useWorkspaceViewport() {
  const [state, setState] = useState<WorkspaceState>(DEFAULT_WORKSPACE_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setZoom = useCallback((zoom: ZoomPreset) => {
    setState((prev) => ({
      ...prev,
      zoom,
      pan: FIT_MODES.includes(zoom) ? { x: 0, y: 0 } : prev.pan,
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => {
      const order = [...ZOOM_PRESETS];
      const idx = order.indexOf(prev.zoom);
      const next = order[Math.min(order.length - 1, Math.max(0, idx) + 1)] ?? 8;
      return { ...prev, zoom: next };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => {
      const order = [...ZOOM_PRESETS];
      const idx = order.indexOf(prev.zoom);
      const next = order[Math.max(0, (idx < 0 ? 0 : idx) - 1)] ?? "fit";
      return {
        ...prev,
        zoom: next,
        pan: FIT_MODES.includes(next) ? { x: 0, y: 0 } : prev.pan,
      };
    });
  }, []);

  const setPan = useCallback((pan: WorkspacePan) => {
    setState((prev) => ({ ...prev, pan }));
  }, []);

  const resetPan = useCallback(() => {
    setState((prev) => ({ ...prev, pan: { x: 0, y: 0 } }));
  }, []);

  const setShowOriginal = useCallback((showOriginal: boolean) => {
    setState((prev) => ({
      ...prev,
      showOriginal,
      peeking: false,
      pan: showOriginal ? prev.pan : { x: 0, y: 0 },
    }));
  }, []);

  const setOriginalMode = useCallback((originalMode: OriginalViewMode) => {
    setState((prev) => ({ ...prev, originalMode, peeking: false }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      focusMode: !prev.focusMode,
      sidebarOpen: false,
    }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, fullscreen: !prev.fullscreen }));
  }, []);

  const setPeeking = useCallback((peeking: boolean) => {
    setState((prev) => ({ ...prev, peeking }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const closeSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: false }));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.showOriginal || s.originalMode !== "peek") return;
      if (e.code !== "Space" || e.repeat) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      setPeeking(true);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      setPeeking(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [setPeeking]);

  useEffect(() => {
    if (!state.fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setState((prev) => ({ ...prev, fullscreen: false }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.fullscreen]);

  return {
    state,
    setZoom,
    zoomIn,
    zoomOut,
    setPan,
    resetPan,
    setShowOriginal,
    setOriginalMode,
    toggleFocusMode,
    toggleFullscreen,
    setPeeking,
    toggleSidebar,
    closeSidebar,
  };
}

export type WorkspaceViewportApi = ReturnType<typeof useWorkspaceViewport>;
