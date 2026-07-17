"use client";

import { useMemo, useState } from "react";

import type {
  ColorMode,
  DitheringMode,
  ImagePipelineOptions,
  LuminanceHistogram,
  MappingMode,
  PipelineBenchmark,
} from "@/features/ascii-interaction/image-pipeline";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  IMAGE_CHARSETS,
  REFINEMENT_PRESETS,
  exportPipelineSettingsJson,
  parsePipelineSettingsJson,
} from "@/features/ascii-interaction/image-pipeline";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline";
import {
  downloadMatrix,
  downloadMatrixPng,
} from "@/features/ascii-interaction/image-pipeline";
import { exportMatrixToClipboard } from "@/features/ascii-engine/exporters";
import { BatchConvertStub } from "@/studio/image/BatchConvertStub";
import { ClipboardPasteButton } from "@/studio/image/ClipboardPasteButton";
import { ImageUploadZone } from "@/studio/image/ImageUploadZone";
import { HistogramBars } from "@/studio/image/HistogramBars";

const DITHERING_MODES: DitheringMode[] = [
  "none",
  "floyd-steinberg",
  "atkinson",
  "bayer-2x2",
  "bayer-4x4",
  "ordered",
  "jarvis",
  "burkes",
  "sierra",
  "stucki",
];

const MAPPING_MODES: MappingMode[] = ["brightness", "density", "edge", "hybrid"];
const COLOR_MODES: ColorMode[] = [
  "mono",
  "color",
  "ansi16",
  "ansi256",
  "truecolor",
  "gradient",
  "root-os",
];

interface RefinementPanelProps {
  options: ImagePipelineOptions;
  charsetId: string;
  benchmark: PipelineBenchmark | null;
  matrix: AsciiMatrix | null;
  sourceWidth: number;
  sourceHeight: number;
  histogramBefore?: LuminanceHistogram | null;
  histogramAfter?: LuminanceHistogram | null;
  isProcessing?: boolean;
  comparePresetId?: string | null;
  onOptionsChange: (patch: Partial<ImagePipelineOptions>) => void;
  onReplaceOptions: (next: Partial<ImagePipelineOptions>) => void;
  onCharsetIdChange: (id: string) => void;
  onImageLoaded: (image: HTMLImageElement, previewUrl: string) => void;
  onAutoOptimize: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onComparePreset?: (id: string | null) => void;
}

export function RefinementPanel({
  options,
  charsetId,
  benchmark,
  matrix,
  sourceWidth,
  sourceHeight,
  histogramBefore,
  histogramAfter,
  isProcessing = false,
  comparePresetId = null,
  onOptionsChange,
  onReplaceOptions,
  onCharsetIdChange,
  onImageLoaded,
  onAutoOptimize,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onComparePreset,
}: RefinementPanelProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    image: true,
    basic: true,
    details: false,
    ascii: true,
    presets: true,
    export: false,
  });
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const brightnessUi = Math.round(options.brightness * 100);
  const contrastUi = Math.round(options.contrast * 100);

  const settingsJson = useMemo(() => exportPipelineSettingsJson(options), [options]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <button type="button" disabled={!canUndo} onClick={onUndo} className={btnClass(!canUndo)}>
          Undo
        </button>
        <button type="button" disabled={!canRedo} onClick={onRedo} className={btnClass(!canRedo)}>
          Redo
        </button>
        <button type="button" onClick={onAutoOptimize} className={btnClass(false)}>
          Auto Optimize
        </button>
        {isProcessing ? (
          <span className="px-2 py-1 font-mono text-[9px] text-[var(--amber-led)]">processing…</span>
        ) : null}
      </div>

      <Accordion title="Image" open={!!open.image} onToggle={() => toggle("image")}>
        <ImageUploadZone onImageLoaded={onImageLoaded} />
        <ClipboardPasteButton onImageLoaded={onImageLoaded} />
        <BatchConvertStub />
        {sourceWidth > 0 ? (
          <p className="font-mono text-[9px] text-[var(--phosphor-dim)]">
            Fonte {sourceWidth}×{sourceHeight}px · grelha {options.width}
            {options.height > 0 ? `×${options.height}` : "×auto"}
          </p>
        ) : null}
        <Slider
          label="Largura ASCII"
          value={options.width}
          min={20}
          max={240}
          step={2}
          onChange={(v) => onOptionsChange({ width: v })}
        />
        <Toggle
          label="Lock aspect"
          checked={options.lockAspectRatio}
          onChange={(v) => onOptionsChange({ lockAspectRatio: v })}
        />
      </Accordion>

      <Accordion title="Basic" open={!!open.basic} onToggle={() => toggle("basic")}>
        <Slider
          label={`Brightness ${brightnessUi}`}
          value={brightnessUi}
          min={-100}
          max={100}
          step={1}
          onChange={(v) => onOptionsChange({ brightness: v / 100 })}
        />
        <Slider
          label={`Contrast ${contrastUi}%`}
          value={contrastUi}
          min={0}
          max={300}
          step={5}
          onChange={(v) => onOptionsChange({ contrast: v / 100 })}
        />
        <Slider
          label="Gamma"
          value={options.gamma}
          min={0.2}
          max={3}
          step={0.05}
          onChange={(v) => onOptionsChange({ gamma: v })}
        />
        <p className="font-mono text-[9px] uppercase text-[var(--amber-led)]">Levels</p>
        <Slider
          label="Black point"
          value={options.blackPoint}
          min={0}
          max={0.9}
          step={0.01}
          onChange={(v) => onOptionsChange({ blackPoint: Math.min(v, options.whitePoint - 0.02) })}
        />
        <Slider
          label="Mid point"
          value={options.midPoint}
          min={0.05}
          max={0.95}
          step={0.01}
          onChange={(v) => onOptionsChange({ midPoint: v })}
        />
        <Slider
          label="White point"
          value={options.whitePoint}
          min={0.1}
          max={1}
          step={0.01}
          onChange={(v) => onOptionsChange({ whitePoint: Math.max(v, options.blackPoint + 0.02) })}
        />
        <Toggle
          label="Invert luminance"
          checked={options.invertLuminance}
          onChange={(v) => onOptionsChange({ invertLuminance: v, invert: v && options.invertColors })}
        />
        <Toggle
          label="Invert colors"
          checked={options.invertColors}
          onChange={(v) => onOptionsChange({ invertColors: v, invert: v && options.invertLuminance })}
        />
      </Accordion>

      <Accordion title="Details" open={!!open.details} onToggle={() => toggle("details")}>
        <Slider
          label={`Sharpen ${Math.round(options.sharpness * 100)}`}
          value={Math.round(options.sharpness * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(v) => onOptionsChange({ sharpness: v / 100 })}
        />
        <Slider
          label="Edge enhance"
          value={options.edgeEnhance}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onOptionsChange({ edgeEnhance: v })}
        />
        <Slider
          label="Blur / noise soften"
          value={options.blur}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => onOptionsChange({ blur: v })}
        />
        <Slider
          label="Exposure"
          value={options.exposure}
          min={-2}
          max={2}
          step={0.1}
          onChange={(v) => onOptionsChange({ exposure: v })}
        />
      </Accordion>

      <Accordion title="ASCII" open={!!open.ascii} onToggle={() => toggle("ascii")}>
        <select
          value={charsetId}
          onChange={(e) => onCharsetIdChange(e.target.value)}
          className="mb-2 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5 font-mono text-[10px]"
        >
          {Object.keys(IMAGE_CHARSETS).map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <Slider
          label="Character density"
          value={options.characterDensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onOptionsChange({ characterDensity: v })}
        />
        <Slider
          label="Character bias (light ← → solid)"
          value={options.characterBias}
          min={-1}
          max={1}
          step={0.05}
          onChange={(v) => onOptionsChange({ characterBias: v })}
        />
        <Toggle
          label="Adaptive character mapping"
          checked={options.adaptiveMapping}
          onChange={(v) => onOptionsChange({ adaptiveMapping: v })}
        />
        <label className="block font-mono text-[10px] text-[var(--ui-text-dim)]">
          Dithering
          <select
            value={options.dithering}
            onChange={(e) => onOptionsChange({ dithering: e.target.value as DitheringMode })}
            className="mt-1 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5"
          >
            {DITHERING_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-mono text-[10px] text-[var(--ui-text-dim)]">
          Mapping
          <select
            value={options.mappingMode}
            onChange={(e) => onOptionsChange({ mappingMode: e.target.value as MappingMode })}
            className="mt-1 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5"
          >
            {MAPPING_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-mono text-[10px] text-[var(--ui-text-dim)]">
          Color
          <select
            value={options.colorMode}
            onChange={(e) => onOptionsChange({ colorMode: e.target.value as ColorMode })}
            className="mt-1 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5"
          >
            {COLOR_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </Accordion>

      <Accordion title="Presets" open={!!open.presets} onToggle={() => toggle("presets")}>
        <div className="flex flex-wrap gap-1">
          {REFINEMENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onOptionsChange(preset.options)}
              className={`cursor-pointer rounded border px-2 py-1 font-mono text-[10px] ${
                comparePresetId === preset.id
                  ? "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
                  : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {onComparePreset ? (
          <label className="mt-2 block font-mono text-[10px] text-[var(--ui-text-dim)]">
            Comparar com preset
            <select
              value={comparePresetId ?? ""}
              onChange={(e) => onComparePreset(e.target.value || null)}
              className="mt-1 w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5"
            >
              <option value="">— nenhum —</option>
              {REFINEMENT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            className={btnClass(false)}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(settingsJson);
                setCopyState("copied");
                setTimeout(() => setCopyState("idle"), 1500);
              } catch {
                setCopyState("error");
              }
            }}
          >
            {copyState === "copied" ? "Copied" : "Copy Settings"}
          </button>
          <button
            type="button"
            className={btnClass(false)}
            onClick={() => {
              const blob = new Blob([settingsJson], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "ascii-pipeline-preset.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Save preset.json
          </button>
          <label className={`${btnClass(false)} inline-block cursor-pointer`}>
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  onReplaceOptions(parsePipelineSettingsJson(text));
                } catch {
                  setCopyState("error");
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => onReplaceOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS)}
          className="mt-2 w-full cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--ui-text-dim)]"
        >
          Reset pipeline
        </button>
      </Accordion>

      {(histogramBefore || histogramAfter) && (
        <Accordion title="Histogram" open onToggle={() => undefined}>
          {histogramBefore ? (
            <div>
              <p className="mb-1 font-mono text-[9px] text-[var(--ui-text-dim)]">Before</p>
              <HistogramBars histogram={histogramBefore} />
            </div>
          ) : null}
          {histogramAfter ? (
            <div className="mt-2">
              <p className="mb-1 font-mono text-[9px] text-[var(--ui-text-dim)]">After</p>
              <HistogramBars histogram={histogramAfter} tone="after" />
            </div>
          ) : null}
        </Accordion>
      )}

      <Accordion title="Export" open={!!open.export} onToggle={() => toggle("export")}>
        {benchmark ? (
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
            {benchmark.cols}×{benchmark.rows} · {benchmark.characterCount} chars ·{" "}
            {benchmark.conversionMs.toFixed(1)} ms
          </p>
        ) : null}
        {matrix ? (
          <div className="grid grid-cols-2 gap-1">
            {(["txt", "json", "html", "svg"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => downloadMatrix(matrix, fmt)}
                className={btnClass(false)}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              className={`col-span-2 ${btnClass(false)}`}
              onClick={() => void downloadMatrixPng(matrix)}
            >
              PNG
            </button>
            <button
              type="button"
              className={`col-span-2 ${btnClass(false)}`}
              onClick={() => void exportMatrixToClipboard(matrix, "txt")}
            >
              Copy TXT
            </button>
          </div>
        ) : (
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">Converta uma imagem para exportar.</p>
        )}
      </Accordion>
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--ui-border)]/50 pb-2">
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex w-full cursor-pointer items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--amber-led)]"
      >
        <span>{title}</span>
        <span className="text-[var(--ui-text-dim)]">{open ? "▼" : "▶"}</span>
      </button>
      {open ? <div className="space-y-2">{children}</div> : null}
    </section>
  );
}

function btnClass(disabled: boolean): string {
  return `rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] ${
    disabled
      ? "cursor-not-allowed opacity-40"
      : "cursor-pointer text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
  }`;
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
    <label className="block font-mono text-[10px] text-[var(--ui-text-dim)]">
      {label}
      <input
        type="range"
        className="mt-1 w-full accent-[var(--phosphor-primary)]"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
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
    <label className="flex cursor-pointer items-center justify-between gap-2 font-mono text-[10px] text-[var(--ui-text-dim)]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
