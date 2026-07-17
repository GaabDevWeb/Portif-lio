"use client";

import { useEffect, useRef, useState } from "react";

import { FrameCache } from "@/features/ascii-interaction/animation-pipeline/cache/frame-cache";
import {
  loadAsciiAnimationFrame,
  loadAsciiAnimationPackageMeta,
  type AsciiAnimationPackageMeta,
} from "@/features/ascii-interaction/animation-pipeline/importer/animation-package-loader";
import { PlaybackController } from "@/features/ascii-interaction/animation-pipeline/playback/playback-controller";
import { renderMatrixToCanvas } from "@/features/ascii-interaction/image-pipeline/render-utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AsciiAnimationHeroProps {
  /** Base path público, ex.: /animations/root-os-home */
  basePath: string;
  className?: string;
}

export function AsciiAnimationHero({ basePath, className }: AsciiAnimationHeroProps) {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<PlaybackController | null>(null);
  const cacheRef = useRef(new FrameCache(48));
  const metaRef = useRef<AsciiAnimationPackageMeta | null>(null);
  const [meta, setMeta] = useState<AsciiAnimationPackageMeta | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadAsciiAnimationPackageMeta(basePath)
      .then((loaded) => {
        if (cancelled) return;
        metaRef.current = loaded;
        setMeta(loaded);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [basePath]);

  useEffect(() => {
    if (!meta || reducedMotion) return;

    const playback = new PlaybackController();
    playbackRef.current = playback;
    playback.setFrameDelays(meta.metadata.frameDelays);
    playback.setFps(meta.manifest.fps);
    playback.setLoop(meta.manifest.loop);

    const hash = JSON.stringify(meta.manifest.pipelineOptions);

    const cache = cacheRef.current;

    const prefetchFrames = (frameIndex: number) => {
      const pkg = metaRef.current;
      if (!pkg) return;
      for (let i = 1; i <= 4; i += 1) {
        const next = frameIndex + i;
        if (next >= pkg.manifest.frameCount || cache.has(next, hash)) continue;
        void loadAsciiAnimationFrame(pkg, next).then((f) => {
          cache.set(next, hash, f);
        });
      }
    };

    let latestFrameRequest = -1;

    const drawFrame = async (frameIndex: number) => {
      latestFrameRequest = frameIndex;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || !metaRef.current) return;

      let frame = cache.get(frameIndex, hash);
      if (!frame) {
        frame = await loadAsciiAnimationFrame(metaRef.current, frameIndex);
        if (latestFrameRequest !== frameIndex) return;
        cache.set(frameIndex, hash, frame);
      }

      prefetchFrames(frameIndex);
      cache.pruneAround(frameIndex, 24, hash);

      const displayW = container.clientWidth;
      const aspect = meta.metadata.gifWidth / Math.max(1, meta.metadata.gifHeight);
      const displayH = displayW / aspect;

      const rendered = renderMatrixToCanvas(frame.matrix, {
        targetWidth: displayW,
        targetHeight: displayH,
        backgroundColor: "#050805",
      });

      canvas.width = rendered.width;
      canvas.height = rendered.height;
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx || latestFrameRequest !== frameIndex) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(rendered, 0, 0);
    };

    const unsub = playback.subscribe((state) => {
      void drawFrame(state.currentFrame);
    });

    playback.play();

    const ro = new ResizeObserver(() => {
      void drawFrame(playback.getState().currentFrame);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      unsub();
      ro.disconnect();
      playback.destroy();
      playbackRef.current = null;
      cache.clear();
    };
  }, [meta, reducedMotion]);

  if (error) {
    return null;
  }

  if (reducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${basePath.replace(/\/$/, "")}/preview.png`}
        alt=""
        className={className ?? "block h-auto w-full max-w-none opacity-90"}
        aria-hidden
      />
    );
  }

  if (!meta) {
    return (
      <div
        className="relative w-full"
        style={{ aspectRatio: "16 / 9", background: "#050805" }}
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        aspectRatio: `${meta.metadata.gifWidth} / ${meta.metadata.gifHeight}`,
      }}
    >
      <canvas
        ref={canvasRef}
        className={className ?? "block h-auto w-full max-w-none opacity-90"}
        aria-hidden
      />
    </div>
  );
}
