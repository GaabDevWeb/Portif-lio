"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/providers/session-store";

const MATRIX_DURATION_MS = 8000;
const CHARS = "アイウエオカキクケコ0123456789ABCDEF";

export function MatrixOverlay() {
  const visualEffect = useSessionStore((s) => s.visualEffect);
  const setVisualEffect = useSessionStore((s) => s.setVisualEffect);

  useEffect(() => {
    if (visualEffect !== "matrix") return;

    const timer = window.setTimeout(() => {
      setVisualEffect(null);
    }, MATRIX_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [setVisualEffect, visualEffect]);

  if (visualEffect !== "matrix") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden opacity-80"
      aria-hidden
    >
      <MatrixRain />
    </div>
  );
}

function MatrixRain() {
  const columns = 24;

  return (
    <div className="grid h-full w-full grid-cols-12 gap-1 p-2 font-mono text-xs text-[var(--phosphor-primary)] sm:grid-cols-24">
      {Array.from({ length: columns }).map((_, col) => (
        <MatrixColumn key={col} col={col} />
      ))}
    </div>
  );
}

function MatrixColumn({ col }: { col: number }) {
  useEffect(() => {
    // column animates via CSS only — no JS loop needed
  }, []);

  const chars = Array.from({ length: 18 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)],
  );

  return (
    <div
      className="animate-matrix-fall whitespace-pre leading-tight opacity-70"
      style={{ animationDelay: `${col * 120}ms` }}
    >
      {chars.join("\n")}
    </div>
  );
}
