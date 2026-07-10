"use client";

import { useCallback, useRef, useState } from "react";

import type {
  AnimationPipelineOptions,
  AsciiAnimation,
  ConversionProgress,
  DecodedGif,
} from "@/features/ascii-interaction/animation-pipeline";
import {
  DEFAULT_ANIMATION_PIPELINE_OPTIONS,
  downloadAsciiAnimationGif,
  downloadAsciiAnimationTxtSequence,
  downloadAsciiAnimationZip,
} from "@/features/ascii-interaction/animation-pipeline";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline";
import { IMAGE_CHARSETS } from "@/features/ascii-interaction/image-pipeline";
import { GifUploadZone } from "@/studio/animation/GifUploadZone";

interface AnimationConverterPanelProps {
  decoded: DecodedGif | null;
  animation: AsciiAnimation | null;
  options: AnimationPipelineOptions;
  progress: ConversionProgress | null;
  isConverting: boolean;
  charsetId: string;
  onLoadGif: (file: File) => void;
  onCancel: () => void;
  onPipelineChange: (patch: Partial<ImagePipelineOptions>) => void;
  onAnimationOptionsChange: (patch: Partial<AnimationPipelineOptions>) => void;
  onCharsetChange: (id: string) => void;
  onImportZip: (file: File) => void;
  onDuplicateFrame?: () => void;
  onInsertFrame?: () => void;
  onRemoveFrame?: () => void;
  onMergeFrame?: () => void;
}

export function AnimationConverterPanel({
  decoded,
  animation,
  options,
  progress,
  isConverting,
  charsetId,
  onLoadGif,
  onCancel,
  onPipelineChange,
  onAnimationOptionsChange,
  onCharsetChange,
  onImportZip,
  onDuplicateFrame,
  onInsertFrame,
  onRemoveFrame,
  onMergeFrame,
}: AnimationConverterPanelProps) {
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [exportProgress, setExportProgress] = useState<ConversionProgress | null>(null);
  const exportSignalRef = useRef({ cancelled: false });

  const handleExportGif = useCallback(async () => {
    if (!animation || isExportingGif) return;
    setIsExportingGif(true);
    setExportProgress(null);
    exportSignalRef.current.cancelled = false;
    try {
      await downloadAsciiAnimationGif(
        animation,
        "animation.gif",
        setExportProgress,
        exportSignalRef.current,
      );
    } catch (err) {
      if (err instanceof Error && err.message !== "Exportação cancelada.") {
        console.error(err);
      }
    } finally {
      setIsExportingGif(false);
      setExportProgress(null);
    }
  }, [animation, exportSignalRef, isExportingGif]);

  return (
    <div className="space-y-4">
      <Section title="Upload GIF">
        <GifUploadZone onFile={onLoadGif} disabled={isConverting} />
      </Section>

      {decoded ? (
        <Section title="GIF Info">
          <Metric label="Dimensões" value={`${decoded.width}×${decoded.height}`} />
          <Metric label="Frames" value={String(decoded.frameCount)} />
          <Metric label="Duração" value={`${(decoded.totalDurationMs / 1000).toFixed(2)}s`} />
        </Section>
      ) : null}

      {isConverting || progress ? (
        <Section title="Conversão">
          <div className="h-1.5 w-full overflow-hidden rounded bg-[var(--ui-border)]">
            <div
              className="h-full bg-[var(--phosphor-primary)] transition-[width]"
              style={{ width: `${progress?.percent ?? 0}%` }}
            />
          </div>
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
            {progress?.completed ?? 0} / {progress?.total ?? 0} frames
          </p>
          {isConverting ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full cursor-pointer rounded border border-[var(--stderr)] px-2 py-1 font-mono text-[10px] text-[var(--stderr)]"
            >
              Cancelar conversão
            </button>
          ) : null}
        </Section>
      ) : null}

      <Section title="Playback">
        <Slider
          label="FPS"
          value={options.targetFps}
          min={1}
          max={60}
          step={1}
          onChange={(v) => onAnimationOptionsChange({ targetFps: v })}
        />
        <Toggle
          label="Loop"
          checked={options.loop}
          onChange={(v) => onAnimationOptionsChange({ loop: v })}
        />
      </Section>

      <Section title="Dimensões ASCII">
        <Slider
          label="Largura"
          value={options.pipeline.width}
          min={20}
          max={200}
          step={2}
          onChange={(v) => onPipelineChange({ width: v })}
        />
      </Section>

      <Section title="Pré-processamento">
        <Slider label="Brightness" value={options.pipeline.brightness} min={-1} max={1} step={0.05} onChange={(v) => onPipelineChange({ brightness: v })} />
        <Slider label="Contrast" value={options.pipeline.contrast} min={0.2} max={2.5} step={0.05} onChange={(v) => onPipelineChange({ contrast: v })} />
        <Slider label="Gamma" value={options.pipeline.gamma} min={0.2} max={3} step={0.05} onChange={(v) => onPipelineChange({ gamma: v })} />
      </Section>

      <Section title="Charset">
        <select
          value={charsetId}
          onChange={(e) => onCharsetChange(e.target.value)}
          className="mb-2 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5 font-mono text-[10px]"
        >
          {Object.keys(IMAGE_CHARSETS).map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </Section>

      {animation ? (
        <Section title="Timeline Edit">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={onDuplicateFrame}
              disabled={!onDuplicateFrame}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={onInsertFrame}
              disabled={!onInsertFrame}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={onRemoveFrame}
              disabled={!onRemoveFrame}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={onMergeFrame}
              disabled={!onMergeFrame}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              Merge next
            </button>
          </div>
        </Section>
      ) : null}

      {animation ? (
        <Section title="Exportar">
          <div className="grid grid-cols-1 gap-1">
            <button
              type="button"
              disabled={isExportingGif}
              onClick={() => void downloadAsciiAnimationZip(animation)}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              ASCII ZIP
            </button>
            <button
              type="button"
              disabled={isExportingGif}
              onClick={() => void handleExportGif()}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              {isExportingGif ? "Exportando GIF…" : "GIF"}
            </button>
            <button
              type="button"
              disabled={isExportingGif}
              onClick={() => void downloadAsciiAnimationTxtSequence(animation)}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              TXT Sequence
            </button>
          </div>
          {isExportingGif && exportProgress ? (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full overflow-hidden rounded bg-[var(--ui-border)]">
                <div
                  className="h-full bg-[var(--phosphor-primary)] transition-[width]"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>
              <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
                GIF {exportProgress.completed} / {exportProgress.total}
              </p>
            </div>
          ) : null}
        </Section>
      ) : null}

      <Section title="Importar">
        <label className="block w-full cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 text-center font-mono text-[10px] text-[var(--phosphor-primary)]">
          .ascii.zip
          <input
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportZip(f);
              e.target.value = "";
            }}
          />
        </label>
      </Section>

      <button
        type="button"
        onClick={() => onAnimationOptionsChange(DEFAULT_ANIMATION_PIPELINE_OPTIONS)}
        className="w-full cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--ui-text-dim)]"
      >
        Reset pipeline
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--ui-border)]/50 pb-4">
      <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--amber-led)]">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-[10px] text-[var(--ui-text-dim)]">
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="text-[var(--ui-text)]">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[var(--phosphor-primary)]"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-[10px] text-[var(--ui-text-dim)]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--phosphor-primary)]" />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-mono text-[10px]">
      <span className="text-[var(--ui-text-dim)]">{label}</span>
      <span className="text-[var(--ui-text)]">{value}</span>
    </div>
  );
}
