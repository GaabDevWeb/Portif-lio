"use client";

import type { LuminanceHistogram } from "@/features/ascii-interaction/image-pipeline";

export function HistogramBars({
  histogram,
  tone = "before",
}: {
  histogram: LuminanceHistogram;
  tone?: "before" | "after";
}) {
  const max = Math.max(1, ...histogram.bins);
  const color =
    tone === "after" ? "var(--phosphor-primary)" : "var(--phosphor-dim)";

  return (
    <div
      className="flex h-12 items-end gap-px rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-1 py-1"
      title={`min ${histogram.min.toFixed(2)} · mean ${histogram.mean.toFixed(2)} · max ${histogram.max.toFixed(2)}`}
    >
      {[...histogram.bins].map((count, i) => (
        <div
          key={i}
          className="min-w-0 flex-1 rounded-sm"
          style={{
            height: `${Math.max(2, (count / max) * 100)}%`,
            background: color,
            opacity: 0.35 + (count / max) * 0.65,
          }}
        />
      ))}
    </div>
  );
}
