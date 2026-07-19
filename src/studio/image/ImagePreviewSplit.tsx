"use client";

import { LabViewport, type LabViewportProps } from "@/legacy/LabViewport";
import type { AsciiGridSource } from "@/features/ascii-interaction";

/** Legado side-by-side — preferir ImageResultView + Workspace. */
interface ImagePreviewSplitProps {
  previewUrl: string | null;
  source: AsciiGridSource;
  config: LabViewportProps["config"];
  debugEnabled?: boolean;
  onStats?: LabViewportProps["onStats"];
}

export function ImagePreviewSplit({
  previewUrl,
  source,
  config,
  debugEnabled = false,
  onStats,
}: ImagePreviewSplitProps) {
  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-px bg-[var(--ui-border)]">
      <div className="relative flex min-h-0 items-center justify-center bg-[var(--bg-void)] p-2">
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--phosphor-dim)]">
          Original
        </span>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Imagem original"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <p className="font-mono text-[10px] text-[var(--ui-text-dim)]">Sem imagem</p>
        )}
      </div>
      <div className="relative min-h-0 bg-[var(--bg-void)]">
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--phosphor-dim)]">
          ASCII Interativo
        </span>
        <LabViewport
          source={source}
          config={config}
          debugEnabled={debugEnabled}
          onStats={onStats}
        />
      </div>
    </div>
  );
}
