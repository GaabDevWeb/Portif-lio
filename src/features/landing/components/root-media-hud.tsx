"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Disc3, Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { loadTracks } from "@/features/media/engine/music-library";
import { getAudioEngine } from "@/features/media/engine/audio-engine";
import { useMediaStore } from "@/features/media/engine/media-store";
import type { LoopMode, Track } from "@/features/media/types";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60).toString();
  return `${m}:${s}`;
}

function nextLoop(mode: LoopMode): LoopMode {
  if (mode === "off") return "all";
  if (mode === "all") return "one";
  return "off";
}

export function RootMediaHud() {
  const reducedMotion = useReducedMotion();
  const started = useMediaStore((s) => s.started);
  const playing = useMediaStore((s) => s.playing);
  const volume = useMediaStore((s) => s.volume);
  const muted = useMediaStore((s) => s.muted);
  const shuffle = useMediaStore((s) => s.shuffle);
  const loopMode = useMediaStore((s) => s.loopMode);
  const currentTime = useMediaStore((s) => s.currentTime);
  const duration = useMediaStore((s) => s.duration);
  const trackIndex = useMediaStore((s) => s.trackIndex);
  const trackId = useMediaStore((s) => s.trackId);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [open, setOpen] = useState(false);

  const vinylRef = useRef<HTMLDivElement>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const speedRef = useRef(0);

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
        getAudioEngine().setTracks(t);
      })
      .catch(() => {
        if (!active) return;
        setTracks([]);
        getAudioEngine().setTracks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = vinylRef.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { rotate: 0 });
      spinTweenRef.current?.kill();
      spinTweenRef.current = null;
      speedRef.current = 0;
      return;
    }

    if (!spinTweenRef.current) {
      spinTweenRef.current = gsap.to(el, {
        rotate: "+=360",
        duration: 2.4,
        ease: "none",
        repeat: -1,
        paused: true,
      });
    }

    const tween = spinTweenRef.current;
    const target = playing ? 1 : 0;
    gsap.to(speedRef, {
      current: target,
      duration: playing ? 0.35 : 0.9,
      ease: playing ? "power2.out" : "power3.out",
      onUpdate() {
        const s = (speedRef as unknown as { current: number }).current ?? 0;
        tween.timeScale(s);
        if (s > 0.001) tween.play();
        if (s <= 0.001) tween.pause();
      },
    });
  }, [playing, reducedMotion]);

  const engine = useMemo(() => getAudioEngine(), []);

  const canPlay = tracks.length > 0;

  const doPlayPause = async () => {
    if (!canPlay) return;
    try {
      if (engine.getAudioElement().paused) {
        await engine.play();
      } else {
        engine.pause();
      }
    } catch {
      // leave silent; output will be available via terminal commands later
    }
  };

  const doNext = () => canPlay && engine.next();
  const doPrev = () => canPlay && engine.prev();

  const doSeek = (pct: number) => {
    if (!canPlay || !duration) return;
    engine.seek(Math.max(0, Math.min(duration, duration * pct)));
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group inline-flex min-h-11 items-center gap-2 rounded-sm border border-[var(--ui-border)] bg-[var(--ui-chrome)]/60 px-2 py-1 font-mono text-[11px] text-[var(--phosphor-dim)] backdrop-blur-[2px] transition-colors hover:text-[var(--ui-text)]",
          open && "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]",
        )}
        aria-label={open ? "Close ROOT Media" : "Open ROOT Media"}
      >
        <div
          ref={vinylRef}
          className="grid h-7 w-7 place-items-center rounded-full border border-[var(--ui-border)] bg-black/40"
        >
          <Disc3 className="h-4 w-4 text-[var(--phosphor-primary)]" aria-hidden />
        </div>
        <span className="hidden max-w-[160px] truncate sm:inline">
          {currentTrack?.title ?? (canPlay ? "ROOT Media" : "No tracks")}
        </span>
        <span className="text-[10px] text-[var(--phosphor-dim)]">
          {playing ? "PLAY" : started ? "PAUSE" : "IDLE"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-40 mt-2 w-[320px] rounded-sm border border-[var(--ui-border)] bg-[var(--bg-panel)] p-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-[var(--phosphor-dim)]">NOW PLAYING</p>
              <p className="truncate font-mono text-xs text-[var(--ui-text)]">
                {currentTrack?.title ?? "No track selected"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const next = !shuffle;
                  useMediaStore.getState().setShuffle(next);
                }}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
                  shuffle && "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]",
                )}
                aria-label="Toggle shuffle"
              >
                <Shuffle className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = nextLoop(loopMode);
                  useMediaStore.getState().setLoopMode(next);
                }}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
                  loopMode !== "off" && "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]",
                )}
                aria-label="Cycle loop mode"
              >
                <Repeat className="h-4 w-4" aria-hidden />
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

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={doPrev}
                className="inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]"
                aria-label="Previous track"
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
                onClick={doNext}
                className="inline-flex h-9 w-9 items-center justify-center border border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]"
                aria-label="Next track"
              >
                <SkipForward className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex min-w-[132px] items-center gap-2">
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
          </div>

          <div className="mt-3 border-t border-[var(--ui-border)] pt-2">
            <p className="font-mono text-[10px] text-[var(--phosphor-dim)]">PLAYLIST</p>
            <div className="mt-1 max-h-32 overflow-auto">
              {tracks.length === 0 ? (
                <p className="font-mono text-xs text-[var(--phosphor-dim)]">No tracks found in /public/music.</p>
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
          </div>
        </div>
      )}
    </div>
  );
}

