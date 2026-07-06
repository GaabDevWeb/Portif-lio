import type { Track, LoopMode } from "@/features/media/types";
import { useMediaStore } from "@/features/media/engine/media-store";

type EngineState = {
  tracks: Track[];
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export class AudioEngine {
  private audio: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private state: EngineState = { tracks: [] };
  private rafId: number | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = "metadata";
    this.audio.crossOrigin = "anonymous";

    this.audio.addEventListener("timeupdate", () => {
      useMediaStore.getState().setTimes(this.audio.currentTime || 0, this.audio.duration || 0);
    });
    this.audio.addEventListener("durationchange", () => {
      useMediaStore.getState().setTimes(this.audio.currentTime || 0, this.audio.duration || 0);
    });
    this.audio.addEventListener("play", () => useMediaStore.getState().setPlaying(true));
    this.audio.addEventListener("pause", () => useMediaStore.getState().setPlaying(false));
    this.audio.addEventListener("ended", () => {
      void this.handleEnded();
    });
  }

  setTracks(tracks: Track[]): void {
    this.state.tracks = tracks;
  }

  getTracks(): Track[] {
    return this.state.tracks;
  }

  getCurrentTrack(): Track | null {
    const { trackIndex, trackId } = useMediaStore.getState();
    const tracks = this.state.tracks;
    if (!tracks.length) return null;
    if (trackId) {
      const byId = tracks.find((t) => t.id === trackId);
      if (byId) return byId;
    }
    return tracks[Math.max(0, Math.min(tracks.length - 1, trackIndex))] ?? null;
  }

  getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private ensureAudioGraph(): void {
    if (this.ctx && this.analyser && this.source) return;

    // Must be called in response to a user gesture.
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.86;

    this.source = this.ctx.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  private applyVolume(): void {
    const { volume, muted } = useMediaStore.getState();
    this.audio.volume = clamp01(volume);
    this.audio.muted = muted;
  }

  private async ensureTrackLoaded(): Promise<void> {
    const track = this.getCurrentTrack();
    if (!track) return;
    if (this.audio.src !== track.url) {
      this.audio.src = track.url;
      await this.audio.load();
    }
  }

  async play(): Promise<void> {
    const store = useMediaStore.getState();
    store.setStarted(true);
    this.ensureAudioGraph();
    await this.ctx?.resume();
    await this.ensureTrackLoaded();
    this.applyVolume();
    await this.audio.play();
    this.startRaf();
  }

  pause(): void {
    this.audio.pause();
    this.stopRafIfIdle();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    useMediaStore.getState().setTimes(0, this.audio.duration || 0);
    this.stopRafIfIdle();
  }

  seek(seconds: number): void {
    if (!Number.isFinite(seconds)) return;
    this.audio.currentTime = Math.max(0, seconds);
  }

  setVolume(volume01: number): void {
    useMediaStore.getState().setVolume(volume01);
    this.applyVolume();
  }

  toggleMute(): void {
    const next = !useMediaStore.getState().muted;
    useMediaStore.getState().setMuted(next);
    this.applyVolume();
  }

  setShuffle(on: boolean): void {
    useMediaStore.getState().setShuffle(on);
  }

  setLoopMode(mode: LoopMode): void {
    useMediaStore.getState().setLoopMode(mode);
  }

  next(): void {
    const tracks = this.state.tracks;
    if (!tracks.length) return;

    const store = useMediaStore.getState();
    const { shuffle, trackIndex } = store;
    const nextIndex = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (trackIndex + 1) % tracks.length;

    store.setTrack(tracks[nextIndex]?.id ?? null, nextIndex);
    store.setTimes(0, 0);
    void this.play().catch(() => {});
  }

  prev(): void {
    const tracks = this.state.tracks;
    if (!tracks.length) return;

    const store = useMediaStore.getState();
    const { shuffle, trackIndex } = store;
    const prevIndex = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (trackIndex - 1 + tracks.length) % tracks.length;

    store.setTrack(tracks[prevIndex]?.id ?? null, prevIndex);
    store.setTimes(0, 0);
    void this.play().catch(() => {});
  }

  private async handleEnded(): Promise<void> {
    const store = useMediaStore.getState();
    const mode = store.loopMode;
    if (mode === "one") {
      this.seek(0);
      await this.play();
      return;
    }
    if (mode === "all") {
      this.next();
      return;
    }
    // off: stop
    store.setPlaying(false);
    this.stopRafIfIdle();
  }

  private startRaf(): void {
    if (this.rafId !== null) return;
    const tick = () => {
      this.rafId = window.requestAnimationFrame(tick);
    };
    this.rafId = window.requestAnimationFrame(tick);
  }

  private stopRafIfIdle(): void {
    if (!this.audio.paused) return;
    if (this.rafId === null) return;
    window.cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}

let engine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  return engine;
}

