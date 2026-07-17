import type { PlaybackStatus, TimelineState } from "@/features/ascii-interaction/animation-pipeline/types";
import {
  frameIndexAtTime,
  timeAtFrame,
  totalDuration,
} from "@/features/ascii-interaction/animation-pipeline/utilities/timing";

export class Timeline {
  private frameDelays: number[] = [];
  private _currentFrame = 0;
  private _currentTimeMs = 0;
  private _fps = 15;
  private _loop = true;

  setFrameDelays(delays: number[]): void {
    this.frameDelays = [...delays];
    this.clamp();
  }

  setFps(fps: number): void {
    this._fps = Math.max(1, fps);
  }

  setLoop(loop: boolean): void {
    this._loop = loop;
  }

  get frameCount(): number {
    return this.frameDelays.length;
  }

  get totalTimeMs(): number {
    return totalDuration(this.frameDelays);
  }

  get currentFrame(): number {
    return this._currentFrame;
  }

  get currentTimeMs(): number {
    return this._currentTimeMs;
  }

  seekFrame(frame: number): void {
    this._currentFrame = Math.max(0, Math.min(this.frameDelays.length - 1, frame));
    this._currentTimeMs = timeAtFrame(this.frameDelays, this._currentFrame);
  }

  seekTime(ms: number): void {
    this._currentTimeMs = Math.max(0, ms);
    this._currentFrame = frameIndexAtTime(this.frameDelays, this._currentTimeMs, this._loop);
    this._currentTimeMs = timeAtFrame(this.frameDelays, this._currentFrame);
  }

  stepFrame(delta: number): void {
    this.seekFrame(this._currentFrame + delta);
  }

  advance(dtMs: number): boolean {
    if (this.frameDelays.length === 0) return false;
    const next = this._currentTimeMs + dtMs;
    const total = this.totalTimeMs;

    if (!this._loop && next >= total) {
      this._currentTimeMs = total;
      this._currentFrame = this.frameDelays.length - 1;
      return true;
    }

    this._currentTimeMs = next;
    this._currentFrame = frameIndexAtTime(this.frameDelays, this._currentTimeMs, this._loop);
    return false;
  }

  getState(status: PlaybackStatus): TimelineState {
    return {
      currentFrame: this._currentFrame,
      currentTimeMs: this._currentTimeMs,
      totalTimeMs: this.totalTimeMs,
      status,
      fps: this._fps,
      loop: this._loop,
    };
  }

  reset(): void {
    this._currentFrame = 0;
    this._currentTimeMs = 0;
  }

  private clamp(): void {
    if (this.frameDelays.length === 0) {
      this._currentFrame = 0;
      this._currentTimeMs = 0;
      return;
    }
    this.seekFrame(this._currentFrame);
  }
}
