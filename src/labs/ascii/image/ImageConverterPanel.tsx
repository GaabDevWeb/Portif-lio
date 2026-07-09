"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  ColorMode,
  DitheringMode,
  ImagePipelineOptions,
  MappingMode,
  PipelineBenchmark,
} from "@/features/ascii-interaction/image-pipeline";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  copyAsciiToClipboard,
  downloadMatrix,
  downloadMatrixPng,
  IMAGE_CHARSETS,
  IMAGE_PIPELINE_PRESETS,
  matrixToAsciiSource,
} from "@/features/ascii-interaction/image-pipeline";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline";
import { ImageUploadZone } from "@/labs/ascii/image/ImageUploadZone";

const MAPPING_MODES: MappingMode[] = ["brightness", "density", "edge", "hybrid"];
const DITHERING_MODES: DitheringMode[] = [
  "none",
  "floyd-steinberg",
  "ordered",
  "bayer",
  "atkinson",
  "jarvis",
  "burkes",
  "sierra",
  "stucki",
];
const COLOR_MODES: ColorMode[] = [
  "mono",
  "color",
  "ansi16",
  "ansi256",
  "truecolor",
  "gradient",
  "root-os",
];

interface ImageConverterPanelProps {
  options: ImagePipelineOptions;
  charsetId: string;
  benchmark: PipelineBenchmark | null;
  matrix: AsciiMatrix | null;
  sourceWidth: number;
  sourceHeight: number;
  onOptionsChange: (patch: Partial<ImagePipelineOptions>) => void;
  onCharsetIdChange: (id: string) => void;
  onImageLoaded: (image: HTMLImageElement, previewUrl: string) => void;
}

export function ImageConverterPanel({
  options,
  charsetId,
  benchmark,
  matrix,
  sourceWidth,
  sourceHeight,
  onOptionsChange,
  onCharsetIdChange,
  onImageLoaded,
}: ImageConverterPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "unsupported" | "error">("idle");

  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  const exportOptions = {
    sourceWidth: sourceWidth > 0 ? sourceWidth : undefined,
    sourceHeight: sourceHeight > 0 ? sourceHeight : undefined,
  };

  const handleCopyAscii = useCallback(async () => {
    if (!matrix) return;
    const result = await copyAsciiToClipboard(matrixToAsciiSource(matrix));
    setCopyState(result === "copied" ? "copied" : result);
  }, [matrix]);

  return (
    <div className="space-y-4">
      <Section title="Upload">
        <ImageUploadZone onImageLoaded={onImageLoaded} />
      </Section>

      <Section title="Presets Imagem">
        <div className="flex flex-wrap gap-1">
          {IMAGE_PIPELINE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onOptionsChange(preset.options)}
              className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Dimensões">
        <Slider label="Largura ASCII" value={options.width} min={20} max={240} step={2} onChange={(v) => onOptionsChange({ width: v })} />
        <Slider label="Altura ASCII" value={options.height || 0} min={0} max={240} step={2} onChange={(v) => onOptionsChange({ height: v })} />
        <p className="text-[9px] text-[var(--ui-text-dim)]">Altura 0 = automática (aspect ratio)</p>
        {sourceWidth > 0 ? (
          <p className="text-[9px] text-[var(--phosphor-dim)]">
            Fonte: {sourceWidth}×{sourceHeight}px — exportação preserva resolução original
          </p>
        ) : null}
        <Toggle label="Lock aspect ratio" checked={options.lockAspectRatio} onChange={(v) => onOptionsChange({ lockAspectRatio: v })} />
        <Slider label="Pixel aspect" value={options.pixelAspect} min={0.5} max={2} step={0.05} onChange={(v) => onOptionsChange({ pixelAspect: v })} />
        <Slider label="Font compensation" value={options.fontCompensation} min={0.3} max={1.2} step={0.05} onChange={(v) => onOptionsChange({ fontCompensation: v })} />
      </Section>

      <Section title="Pré-processamento">
        <Slider label="Brightness" value={options.brightness} min={-1} max={1} step={0.05} onChange={(v) => onOptionsChange({ brightness: v })} />
        <Slider label="Contrast" value={options.contrast} min={0.2} max={2.5} step={0.05} onChange={(v) => onOptionsChange({ contrast: v })} />
        <Slider label="Gamma" value={options.gamma} min={0.2} max={3} step={0.05} onChange={(v) => onOptionsChange({ gamma: v })} />
        <Slider label="Exposure" value={options.exposure} min={-2} max={2} step={0.1} onChange={(v) => onOptionsChange({ exposure: v })} />
        <Slider label="Sharpness" value={options.sharpness} min={0} max={1} step={0.05} onChange={(v) => onOptionsChange({ sharpness: v })} />
        <Slider label="Blur" value={options.blur} min={0} max={2} step={0.1} onChange={(v) => onOptionsChange({ blur: v })} />
        <Slider label="Edge enhance" value={options.edgeEnhance} min={0} max={1} step={0.05} onChange={(v) => onOptionsChange({ edgeEnhance: v })} />
        <Slider label="Threshold" value={options.threshold} min={0} max={1} step={0.05} onChange={(v) => onOptionsChange({ threshold: v })} />
        <Toggle label="Invert" checked={options.invert} onChange={(v) => onOptionsChange({ invert: v })} />
      </Section>

      <Section title="Charset">
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
        <input
          type="text"
          value={options.charset}
          onChange={(e) => onOptionsChange({ charset: e.target.value })}
          className="w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1 font-mono text-[10px]"
        />
      </Section>

      <Section title="Algoritmo">
        <SelectField
          label="Mapping"
          value={options.mappingMode}
          options={MAPPING_MODES}
          onChange={(v) => onOptionsChange({ mappingMode: v as MappingMode })}
        />
        <SelectField
          label="Dithering"
          value={options.dithering}
          options={DITHERING_MODES}
          onChange={(v) => onOptionsChange({ dithering: v as DitheringMode })}
        />
        <SelectField
          label="Colorização"
          value={options.colorMode}
          options={COLOR_MODES}
          onChange={(v) => onOptionsChange({ colorMode: v as ColorMode })}
        />
      </Section>

      {benchmark ? (
        <Section title="Benchmark">
          <Metric label="Conversão" value={`${benchmark.conversionMs.toFixed(2)} ms`} />
          <Metric label="Caracteres" value={benchmark.characterCount.toLocaleString()} />
          <Metric label="Grid" value={`${benchmark.cols}×${benchmark.rows}`} />
        </Section>
      ) : null}

      {matrix ? (
        <Section title="Exportar">
          <button
            type="button"
            onClick={() => void handleCopyAscii()}
            className="mb-2 w-full cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
          >
            {copyState === "copied"
              ? "✓ Copied!"
              : copyState === "unsupported"
                ? "Clipboard indisponível"
                : copyState === "error"
                  ? "Falha ao copiar"
                  : "Copy ASCII"}
          </button>
          <div className="grid grid-cols-2 gap-1">
            {(["txt", "json", "html", "svg"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => downloadMatrix(matrix, fmt, exportOptions)}
                className="cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
              >
                {fmt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void downloadMatrixPng(matrix, exportOptions)}
              className="col-span-2 cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
            >
              PNG ({sourceWidth > 0 ? `${sourceWidth}×${sourceHeight}` : "original"})
            </button>
          </div>
        </Section>
      ) : null}

      <button
        type="button"
        onClick={() => onOptionsChange(DEFAULT_IMAGE_PIPELINE_OPTIONS)}
        className="w-full cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
      >
        Reset pipeline
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--ui-border)]/50 pb-4">
      <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--amber-led)]">
        {title}
      </h2>
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
  onChange: (value: number) => void;
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
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-[10px] text-[var(--ui-text-dim)]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--phosphor-primary)]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[10px] text-[var(--ui-text-dim)]">
      <span className="mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1.5 font-mono text-[10px]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
