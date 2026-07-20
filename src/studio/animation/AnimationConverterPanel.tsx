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
  TEMPORAL_FEATURE_META,
  ANIMATION_QUALITY_TIERS,
  applyAnimationQualityTier,
  downloadAsciiAnimationGif,
  downloadAsciiAnimationTxtSequence,
  downloadAsciiAnimationZip,
  type AnimationQualityTier,
  type TemporalMetrics,
} from "@/features/ascii-interaction/animation-pipeline";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline";
import { IMAGE_CHARSETS } from "@/features/ascii-interaction/image-pipeline";
import {
  downloadAnimationSpriteSheet,
  exportAnimationToClipboard,
} from "@/features/ascii-engine/exporters";
import { GifUploadZone } from "@/studio/animation/GifUploadZone";

interface AnimationConverterPanelProps {
  decoded: DecodedGif | null;
  animation: AsciiAnimation | null;
  options: AnimationPipelineOptions;
  progress: ConversionProgress | null;
  isConverting: boolean;
  charsetId: string;
  temporalMetrics?: TemporalMetrics | null;
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
  temporalMetrics = null,
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
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [exportProgress, setExportProgress] = useState<ConversionProgress | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
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

  const handleExportSpriteSheet = useCallback(async () => {
    if (!animation || isExportingSheet) return;
    setIsExportingSheet(true);
    try {
      await downloadAnimationSpriteSheet(animation);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingSheet(false);
    }
  }, [animation, isExportingSheet]);

  const handleCopyFrames = useCallback(async () => {
    if (!animation) return;
    const result = await exportAnimationToClipboard(animation, "txt");
    setCopyState(result === "copied" ? "copied" : "error");
    setTimeout(() => setCopyState("idle"), 2000);
  }, [animation]);

  return (
    <div className="space-y-4">
      <Section title="Upload">
        <GifUploadZone onFile={onLoadGif} disabled={isConverting} />
      </Section>

      {decoded ? (
        <Section title="Source Info">
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

      <Section title="Quality">
        <div className="space-y-1">
          {ANIMATION_QUALITY_TIERS.map((tier) => (
            <label
              key={tier.id}
              className="flex cursor-pointer flex-col gap-0.5 border-b border-[var(--ui-border)]/30 py-1.5 last:border-0"
            >
              <span className="flex items-center justify-between text-[10px] text-[var(--ui-text-dim)]">
                <span>{tier.label}</span>
                <input
                  type="radio"
                  name="quality-tier"
                  checked={(options.qualityTier ?? "balanced") === tier.id}
                  onChange={() => {
                    const next = applyAnimationQualityTier(
                      tier.id as AnimationQualityTier,
                      options,
                    );
                    onAnimationOptionsChange({
                      ...next,
                      qualityTier: tier.id,
                    });
                  }}
                  className="accent-[var(--phosphor-primary)]"
                />
              </span>
              <span className="font-mono text-[8px] leading-snug text-[var(--ui-text-dim)]/80">
                {tier.description}
              </span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Playback">
        <Toggle
          label="Usar timing nativo"
          checked={options.targetFps <= 0}
          onChange={(v) =>
            onAnimationOptionsChange({ targetFps: v ? 0 : 15 })
          }
        />
        <Slider
          label="FPS (0 = nativo)"
          value={options.targetFps}
          min={0}
          max={60}
          step={1}
          onChange={(v) => onAnimationOptionsChange({ targetFps: v })}
        />
        <Toggle
          label="Loop"
          checked={options.loop}
          onChange={(v) => onAnimationOptionsChange({ loop: v })}
        />
        <Slider
          label="Workers"
          value={options.workerCount}
          min={1}
          max={8}
          step={1}
          onChange={(v) => onAnimationOptionsChange({ workerCount: v })}
        />
        {options.temporal?.enabled ? (
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
            Temporal ON → conversão sequencial (workers ignorados).
          </p>
        ) : null}
      </Section>

      <Section title="Temporal">
        <Toggle
          label="Temporal Pipeline"
          checked={options.temporal?.enabled ?? true}
          onChange={(v) =>
            onAnimationOptionsChange({
              temporal: { ...options.temporal, enabled: v },
            })
          }
        />
        <p className="mb-2 font-mono text-[9px] leading-relaxed text-[var(--ui-text-dim)]">
          Trata o GIF como sequência coerente — reduz flickering, chuvisco de dither e troca
          aleatória de caracteres em áreas estáticas.
        </p>
        {TEMPORAL_FEATURE_META.map((feat) => (
          <label
            key={feat.id}
            className="flex cursor-pointer flex-col gap-0.5 border-b border-[var(--ui-border)]/30 py-1.5 last:border-0"
            title={feat.description}
          >
            <span className="flex items-center justify-between text-[10px] text-[var(--ui-text-dim)]">
              <span>{feat.label}</span>
              <input
                type="checkbox"
                disabled={!options.temporal?.enabled}
                checked={Boolean(options.temporal?.[feat.id])}
                onChange={(e) =>
                  onAnimationOptionsChange({
                    temporal: {
                      ...options.temporal,
                      [feat.id]: e.target.checked,
                    },
                  })
                }
                className="accent-[var(--phosphor-primary)]"
              />
            </span>
            <span className="font-mono text-[8px] leading-snug text-[var(--ui-text-dim)]/80">
              {feat.description}
            </span>
          </label>
        ))}
        {temporalMetrics && options.temporal?.enabled ? (
          <div className="mt-2 space-y-1 rounded border border-[var(--ui-border)]/60 p-2">
            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--amber-led)]">
              Métricas
            </p>
            <Metric label="Frames" value={String(temporalMetrics.frames)} />
            <Metric label="Motion %" value={`${temporalMetrics.motionPercent.toFixed(1)}%`} />
            <Metric label="Blocks reused" value={String(temporalMetrics.blocksReused)} />
            <Metric label="Chars updated" value={String(temporalMetrics.charactersUpdated)} />
            <Metric label="Frames skipped" value={String(temporalMetrics.framesSkipped)} />
            <Metric
              label="Stability"
              value={`${(temporalMetrics.temporalStability * 100).toFixed(1)}%`}
            />
            <Metric
              label="Time"
              value={`${(temporalMetrics.processingTimeMs / 1000).toFixed(2)}s`}
            />
            {temporalMetrics.peakHeapMb != null ? (
              <Metric label="Heap" value={`${temporalMetrics.peakHeapMb} MB`} />
            ) : null}
          </div>
        ) : null}
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
              disabled={isExportingGif || isExportingSheet}
              onClick={() => void downloadAsciiAnimationZip(animation)}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              ASCII ZIP
            </button>
            <button
              type="button"
              disabled={isExportingGif || isExportingSheet}
              onClick={() => void handleExportGif()}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              {isExportingGif ? "Exportando GIF…" : "GIF"}
            </button>
            <button
              type="button"
              disabled={isExportingGif || isExportingSheet}
              onClick={() => void downloadAsciiAnimationTxtSequence(animation)}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              TXT Sequence
            </button>
            <button
              type="button"
              disabled={isExportingGif || isExportingSheet}
              onClick={() => void handleExportSpriteSheet()}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              {isExportingSheet ? "Sprite sheet…" : "Sprite Sheet PNG"}
            </button>
            <button
              type="button"
              disabled={isExportingGif || isExportingSheet}
              onClick={() => void handleCopyFrames()}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
            >
              {copyState === "copied" ? "✓ Copied!" : "Copy frames TXT"}
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
