import { Timeline } from "@/features/ascii-interaction/animation-pipeline/timeline/timeline";
import type { PlaybackStatus, TimelineState } from "@/features/ascii-interaction/animation-pipeline/types";

export type PlaybackListener = (state: TimelineState) => void;

/** Controlador de playback com rAF e FPS configurável. */
export class PlaybackController {
  private readonly timeline = new Timeline();
  private status: PlaybackStatus = "stopped";
  private rafId = 0;
  private lastTs = 0;
  private listeners = new Set<PlaybackListener>();

  setFrameDelays(delays: number[]): void {
    this.timeline.setFrameDelays(delays);
    this.emit();
  }

  setFps(fps: number): void {
    this.timeline.setFps(fps);
    this.emit();
  }

  setLoop(loop: boolean): void {
    this.timeline.setLoop(loop);
    this.emit();
  }

  get timelineRef(): Timeline {
    return this.timeline;
  }

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  play(): void {
    if (this.status === "playing") return;
    this.status = "playing";
    this.lastTs = performance.now();
    this.tick();
    this.emit();
  }

  pause(): void {
    if (this.status !== "playing") return;
    this.status = "paused";
    cancelAnimationFrame(this.rafId);
    this.emit();
  }

  stop(): void {
    this.status = "stopped";
    cancelAnimationFrame(this.rafId);
    this.timeline.reset();
    this.emit();
  }

  restart(): void {
    this.timeline.reset();
    this.play();
  }

  seekFrame(frame: number): void {
    this.timeline.seekFrame(frame);
    this.emit();
  }

  seekTime(ms: number): void {
    this.timeline.seekTime(ms);
    this.emit();
  }

  stepFrame(delta: number): void {
    this.timeline.stepFrame(delta);
    this.emit();
  }

  getState(): TimelineState {
    return this.timeline.getState(this.status);
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    this.listeners.clear();
  }

  private tick = (): void => {
    if (this.status !== "playing") return;
    const now = performance.now();
    const dt = now - this.lastTs;
    this.lastTs = now;
    if (dt <= 0) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const prevFrame = this.timeline.currentFrame;
    const ended = this.timeline.advance(dt);
    if (this.timeline.currentFrame !== prevFrame || ended) {
      this.emit();
    }

    if (ended) {
      this.status = "stopped";
      cancelAnimationFrame(this.rafId);
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private emit(): void {
    const state = this.getState();
    for (const l of this.listeners) l(state);
  }
}
