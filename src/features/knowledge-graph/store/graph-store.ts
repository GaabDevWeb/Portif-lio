import { create } from "zustand";

import type { GraphPhase } from "../types";

interface GraphStoreState {
  phase: GraphPhase;
  hoveredId: string | null;
  selectedId: string | null;
  pinnedHighlight: boolean;
  revealProgress: number;
  linkRevealProgress: number;
  simStable: boolean;
  bootLineIndex: number;
  showFallback: boolean;
  setPhase: (phase: GraphPhase) => void;
  setHoveredId: (id: string | null) => void;
  setSelectedId: (id: string | null) => void;
  setPinnedHighlight: (pinned: boolean) => void;
  setRevealProgress: (p: number) => void;
  setLinkRevealProgress: (p: number) => void;
  setSimStable: (stable: boolean) => void;
  setBootLineIndex: (index: number) => void;
  setShowFallback: (show: boolean) => void;
  resetInteraction: () => void;
}

export const useGraphStore = create<GraphStoreState>((set) => ({
  phase: "idle",
  hoveredId: null,
  selectedId: null,
  pinnedHighlight: false,
  revealProgress: 0,
  linkRevealProgress: 0,
  simStable: false,
  bootLineIndex: -1,
  showFallback: false,
  setPhase: (phase) => set({ phase }),
  setHoveredId: (hoveredId) => set({ hoveredId }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setPinnedHighlight: (pinnedHighlight) => set({ pinnedHighlight }),
  setRevealProgress: (revealProgress) => set({ revealProgress }),
  setLinkRevealProgress: (linkRevealProgress) => set({ linkRevealProgress }),
  setSimStable: (simStable) => set({ simStable }),
  setBootLineIndex: (bootLineIndex) => set({ bootLineIndex }),
  setShowFallback: (showFallback) => set({ showFallback }),
  resetInteraction: () =>
    set({ hoveredId: null, selectedId: null, pinnedHighlight: false }),
}));
