"use client";

import { PanelMetric, PanelSection } from "@/studio/ui/controls";
import type { AsciiEngineStatsPanelModel } from "@/features/ascii-engine/stats";
import { formatHeatmapPreview } from "@/features/ascii-engine/stats";
import type { BenchmarkResult } from "@/features/ascii-engine/benchmark";
import { EDITOR_TOOLS } from "@/features/ascii-engine/editor";
import { EXPORTER_CATALOG } from "@/features/ascii-engine/exporters";
import { IMPORTER_CATALOG } from "@/features/ascii-engine/importers";
import { defaultConverterRegistry } from "@/features/ascii-engine/converters";
import { ASCII_ENGINE_CLI_COMMANDS } from "@/features/ascii-engine/cli/commands";

interface StatsPanelProps {
  model: AsciiEngineStatsPanelModel;
  benchmarkResults?: BenchmarkResult[];
  onRunBenchmark?: () => void;
  benchmarkRunning?: boolean;
}

export function StatsPanel({
  model,
  benchmarkResults = [],
  onRunBenchmark,
  benchmarkRunning,
}: StatsPanelProps) {
  const converters = defaultConverterRegistry.list();
  const heatmapPreview =
    model.heatmap != null ? formatHeatmapPreview(model.heatmap) : null;

  return (
    <div className="h-full space-y-4 overflow-y-auto px-4 py-3">
      <PanelSection title="Runtime">
        <PanelMetric label="FPS" value={model.fps.toFixed(1)} />
        <PanelMetric label="Frame time" value={`${model.frameTimeMs.toFixed(2)} ms`} />
        <PanelMetric label="Render time" value={`${model.renderTimeMs.toFixed(2)} ms`} />
        <PanelMetric label="Characters" value={model.characterCount.toLocaleString()} />
        <PanelMetric label="Active" value={model.activeCharacterCount.toLocaleString()} />
        <PanelMetric label="Dirty" value={String(model.dirtyCount)} />
        <PanelMetric
          label="Memory (est.)"
          value={`${(model.memoryEstimateBytes / 1024).toFixed(1)} KB`}
        />
      </PanelSection>

      <PanelSection title="Conversion">
        <PanelMetric label="Grid" value={model.cols && model.rows ? `${model.cols}×${model.rows}` : "—"} />
        <PanelMetric
          label="Conversion"
          value={model.conversionMs != null ? `${model.conversionMs.toFixed(2)} ms` : "—"}
        />
        <PanelMetric label="Charset" value={model.charset ?? "—"} />
        <PanelMetric label="Frames" value={model.frameCount != null ? String(model.frameCount) : "—"} />
      </PanelSection>

      <PanelSection title="Luminance heatmap">
        {model.heatmap == null ? (
          <p className="text-[9px] text-[var(--ui-text-dim)]">Sem matriz ativa.</p>
        ) : (
          <>
            <PanelMetric
              label="Min / Max"
              value={`${model.heatmap.min.toFixed(2)} / ${model.heatmap.max.toFixed(2)}`}
            />
            <PanelMetric label="Mean" value={model.heatmap.mean.toFixed(3)} />
            <PanelMetric
              label="Coverage"
              value={`${(model.heatmap.coverage * 100).toFixed(1)}%`}
            />
            {heatmapPreview ? (
              <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-[8px] leading-tight text-[var(--phosphor-primary)]">
                {heatmapPreview}
              </pre>
            ) : null}
          </>
        )}
      </PanelSection>

      <PanelSection title="Character histogram">
        {model.histogram.length === 0 ? (
          <p className="text-[9px] text-[var(--ui-text-dim)]">Sem matriz ativa.</p>
        ) : (
          <div className="space-y-1">
            {model.histogram.map((h) => (
              <div key={h.char + h.count} className="flex items-center gap-2 font-mono text-[10px]">
                <span className="w-4 text-center text-[var(--phosphor-primary)]">
                  {h.char === " " ? "␠" : h.char}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-[var(--ui-border)]">
                  <div
                    className="h-full bg-[var(--phosphor-primary)]"
                    style={{
                      width: `${Math.min(100, (h.count / (model.histogram[0]?.count || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-[var(--ui-text-dim)]">{h.count}</span>
              </div>
            ))}
          </div>
        )}
      </PanelSection>

      <PanelSection title="Benchmark">
        <button
          type="button"
          disabled={!onRunBenchmark || benchmarkRunning}
          onClick={onRunBenchmark}
          className="mb-2 w-full cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
        >
          {benchmarkRunning ? "A correr…" : "Run suite (imagem carregada)"}
        </button>
        {benchmarkResults.map((r) => (
          <PanelMetric
            key={r.caseId}
            label={r.label}
            value={`${r.benchmark.conversionMs.toFixed(2)} ms · ${r.benchmark.characterCount}`}
          />
        ))}
      </PanelSection>

      <PanelSection title="Architecture">
        <p className="mb-2 text-[9px] text-[var(--ui-text-dim)]">Converters</p>
        {converters.map((c) => (
          <PanelMetric key={c.kind} label={c.label} value={c.status} />
        ))}
        <p className="mb-2 mt-3 text-[9px] text-[var(--ui-text-dim)]">Exporters</p>
        {EXPORTER_CATALOG.map((e) => (
          <PanelMetric key={e.id} label={e.label} value={e.status} />
        ))}
        <p className="mb-2 mt-3 text-[9px] text-[var(--ui-text-dim)]">Importers</p>
        {IMPORTER_CATALOG.map((e) => (
          <PanelMetric key={e.id} label={e.label} value={e.status} />
        ))}
        <p className="mb-2 mt-3 text-[9px] text-[var(--ui-text-dim)]">Editor tools</p>
        {EDITOR_TOOLS.map((t) => (
          <PanelMetric key={t.id} label={t.label} value={t.status} />
        ))}
        <p className="mb-2 mt-3 text-[9px] text-[var(--ui-text-dim)]">CLI</p>
        {ASCII_ENGINE_CLI_COMMANDS.map((c) => (
          <PanelMetric key={c.name} label={c.name} value={c.status} />
        ))}
      </PanelSection>
    </div>
  );
}
