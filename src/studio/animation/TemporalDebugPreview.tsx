"use client";

import { useEffect, useRef } from "react";

/** Renders a packed motion mask (0|255) as green-on-black technical preview. */
export function MotionMapPreview({
  cols,
  rows,
  motion,
  className,
}: {
  cols: number;
  rows: number;
  motion: Uint8Array;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || cols < 1 || rows < 1) return;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(cols, rows);
    for (let i = 0; i < cols * rows; i += 1) {
      const m = motion[i] ?? 0;
      const o = i * 4;
      img.data[o] = 0;
      img.data[o + 1] = m;
      img.data[o + 2] = m > 0 ? 40 : 0;
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [cols, rows, motion]);

  return (
    <canvas
      ref={ref}
      className={className ?? "h-full w-full object-contain"}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/** Greyscale buffer from packed 0–255 luminance. */
export function PackedBufferPreview({
  cols,
  rows,
  buffer,
  className,
}: {
  cols: number;
  rows: number;
  buffer: Uint8Array;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || cols < 1 || rows < 1) return;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(cols, rows);
    for (let i = 0; i < cols * rows; i += 1) {
      const v = buffer[i] ?? 0;
      const o = i * 4;
      img.data[o] = v;
      img.data[o + 1] = v;
      img.data[o + 2] = v;
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [cols, rows, buffer]);

  return (
    <canvas
      ref={ref}
      className={className ?? "h-full w-full object-contain"}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
