"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

import { ModulePanel } from "@/features/landing/components/module-panel";
import { loadTracks } from "@/features/media/engine/music-library";
import { getAudioEngine } from "@/features/media/engine/audio-engine";
import { useMediaStore } from "@/features/media/engine/media-store";
import { CavaAnalyser } from "@/features/media/engine/cava-analyser";
import { cn } from "@/lib/utils";
import type { Track } from "@/features/media/types";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60).toString();
  return `${m}:${s}`;
}

export function MediaApp() {
  const started = useMediaStore((s) => s.started);
  const playing = useMediaStore((s) => s.playing);
  const volume = useMediaStore((s) => s.volume);
  const muted = useMediaStore((s) => s.muted);
  const currentTime = useMediaStore((s) => s.currentTime);
  const duration = useMediaStore((s) => s.duration);
  const trackIndex = useMediaStore((s) => s.trackIndex);
  const trackId = useMediaStore((s) => s.trackId);

  const [tracks, setTracks] = useState<Track[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const engine = useMemo(() => getAudioEngine(), []);
  const currentTrack = useMemo(() => {
    if (!tracks.length) return null;
    if (trackId) {
      const byId = tracks.find((t) => t.id === trackId);
      if (byId) return byId;
    }
    return tracks[Math.max(0, Math.min(tracks.length - 1, trackIndex))] ?? null;
  }, [trackId, trackIndex, tracks]);

  useEffect(() => {
    let active = true;
    void loadTracks()
      .then((t) => {
        if (!active) return;
        setTracks(t);
        engine.setTracks(t);
      })
      .catch(() => {
        if (!active) return;
        setTracks([]);
        engine.setTracks([]);
      });
    return () => {
      active = false;
    };
  }, [engine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const drawIdle = (message: string) => {
      const { width, height } = canvas;
      ctx2d.clearRect(0, 0, width, height);
      ctx2d.fillStyle = "rgba(255,255,255,0.18)";
      ctx2d.font = "12px var(--font-mono)";
      ctx2d.fillText(message, 10, Math.floor(height / 2));
    };

    const analyserNode = engine.getAnalyser();
    if (!analyserNode) {
      drawIdle(started ? "AudioContext locked until user gesture." : "No active audio source.");
      return;
    }

    const cava = new CavaAnalyser(analyserNode);
    const barCount = 48;
    const render = () => {
      rafRef.current = window.requestAnimationFrame(render);
      const { bins } = cava.read();
      const { width, height } = canvas;
      ctx2d.clearRect(0, 0, width, height);
      ctx2d.fillStyle = "rgba(0,0,0,0.25)";
      ctx2d.fillRect(0, 0, width, height);

      const step = Math.max(1, Math.floor(bins.length / barCount));
      const barW = width / barCount;

      for (let i = 0; i < barCount; i += 1) {
        const idx = i * step;
        const v = bins[idx] ?? 0;
        const h = (v / 255) * (height - 8);
        ctx2d.fillStyle = "rgba(120, 255, 120, 0.85)";
        ctx2d.fillRect(i * barW + 1, height - h - 4, Math.max(1, barW - 2), h);
      }
    };

    render();
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [engine, started, playing]);

  const canPlay = tracks.length > 0;

  const doPlayPause = async () => {
    if (!canPlay) return;
    if (engine.getAudioElement().paused) await engine.play();
    else engine.pause();
  };

  const doSeek = (pct: number) => {
    if (!duration) return;
    engine.seek(duration * Math.max(0, Math.min(1, pct)));
  };

  return (
    <div className="h-full w-full p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
        <ModulePanel id="media-now" code="APP-MEDIA" title="root-media — now playing">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-[var(--phosphor-dim)]">NOW PLAYING</p>
              <p className="truncate font-mono text-sm text-[var(--ui-text)]">
                {currentTrack?.title ?? (canPlay ? "Select a track" : "No tracks found")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => engine.prev()}
                className="inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]"
                aria-label="Previous"
              >
                <SkipBack className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void doPlayPause()}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--ui-text)]",
                  playing && "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]",
                )}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              </button>
              <button
                type="button"
                onClick={() => engine.next()}
                className="inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]"
                aria-label="Next"
              >
                <SkipForward className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-[var(--phosphor-dim)]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="mt-1 h-2 w-full cursor-pointer rounded-sm border border-[var(--ui-border)] bg-black/30"
              role="presentation"
              onMouseDown={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                doSeek((e.clientX - rect.left) / rect.width);
              }}
            >
              <div
                className="h-full rounded-sm bg-[var(--phosphor-primary)]"
                style={{ width: duration ? `${Math.min(100, (currentTime / duration) * 100)}%` : "0%" }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => engine.toggleMute()}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)]",
                muted ? "text-[var(--stderr)]" : "text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
              )}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => engine.setVolume(Number(e.target.value) / 100)}
              className="h-2 w-full cursor-pointer accent-[var(--phosphor-primary)]"
              aria-label="Volume"
            />
          </div>

          <div className="mt-3">
            <p className="font-mono text-[10px] text-[var(--phosphor-dim)]">VISUALIZER (cava)</p>
            <canvas
              ref={canvasRef}
              width={900}
              height={180}
              className="mt-1 h-[180px] w-full rounded-sm border border-[var(--ui-border)] bg-black/30"
            />
          </div>
        </ModulePanel>

        <ModulePanel id="media-playlist" code="LIST" title="playlist">
          <div className="max-h-[520px] overflow-auto">
            {tracks.length === 0 ? (
              <p className="font-mono text-sm text-[var(--phosphor-dim)]">No tracks in /public/music.</p>
            ) : (
              <ul className="space-y-1">
                {tracks.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          useMediaStore.getState().setTrack(t.id, idx);
                          void engine.play();
                        }}
                        className={cn(
                          "w-full truncate text-left font-mono text-[11px] transition-colors",
                          active
                            ? "text-[var(--phosphor-primary)]"
                            : "text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
                        )}
                      >
                        {t.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ModulePanel>
      </div>
    </div>
  );
}

