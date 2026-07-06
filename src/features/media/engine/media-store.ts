import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LoopMode } from "@/features/media/types";

type MediaState = {
  started: boolean;
  playing: boolean;
  trackId: string | null;
  trackIndex: number;
  currentTime: number;
  duration: number;
  volume: number; // 0..1
  muted: boolean;
  shuffle: boolean;
  loopMode: LoopMode;
  setStarted: (value: boolean) => void;
  setPlaying: (value: boolean) => void;
  setTrack: (trackId: string | null, trackIndex: number) => void;
  setTimes: (currentTime: number, duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
  setLoopMode: (mode: LoopMode) => void;
};

export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      started: false,
      playing: false,
      trackId: null,
      trackIndex: 0,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      muted: false,
      shuffle: false,
      loopMode: "off",

      setStarted: (started) => set({ started }),
      setPlaying: (playing) => set({ playing }),
      setTrack: (trackId, trackIndex) => set({ trackId, trackIndex }),
      setTimes: (currentTime, duration) => set({ currentTime, duration }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setMuted: (muted) => set({ muted }),
      setShuffle: (shuffle) => set({ shuffle }),
      setLoopMode: (loopMode) => set({ loopMode }),
    }),
    {
      name: "rootos:media",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        started: state.started,
        trackId: state.trackId,
        trackIndex: state.trackIndex,
        currentTime: state.currentTime,
        volume: state.volume,
        muted: state.muted,
        shuffle: state.shuffle,
        loopMode: state.loopMode,
      }),
    },
  ),
);

