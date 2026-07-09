"use client";

import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { FalloffCurve } from "@/features/ascii-interaction/types";
import { ASCII_PRESETS, CHARACTER_SETS } from "@/labs/ascii/Presets";
import { ASCII_TEST_SCENARIOS } from "@/labs/ascii/test-sources";
import { StressTest } from "@/labs/ascii/StressTest";
import { downloadLabConfig } from "@/labs/ascii/Exporter";
import { pickAndImportLabConfig } from "@/labs/ascii/Importer";
import { LabInteractiveCursorToggle } from "@/labs/ascii/LabInteractiveCursorToggle";
import type { LabDebugOptions } from "@/labs/ascii/types";

export interface ControlPanelProps {
  config: AsciiInteractionConfig;
  activePreset: string;
  scenarioId: string;
  stressMultiplier: number;
  splitView: boolean;
  splitPresetA: string;
  splitPresetB: string;
  debug: LabDebugOptions;
  /** Quando false, omite o header (tabs no AsciiLab). */
  showHeader?: boolean;
  onConfigChange: (patch: Partial<AsciiInteractionConfig>) => void;
  onPresetChange: (presetId: string) => void;
  onScenarioChange: (scenarioId: string) => void;
  onStressChange: (multiplier: number) => void;
  onSplitViewToggle: (enabled: boolean) => void;
  onSplitPresetAChange: (presetId: string) => void;
  onSplitPresetBChange: (presetId: string) => void;
  onDebugChange: (patch: Partial<LabDebugOptions>) => void;
  onImport: (config: AsciiInteractionConfig) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-[#1a3d1a] py-3" open>
      <summary className="cursor-pointer list-none text-[10px] uppercase tracking-widest text-[#5a8a5a] marker:content-none">
        <span className="group-open:text-[#7dff7d]">{title}</span>
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
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
    <label className="block space-y-1">
      <div className="flex justify-between font-mono text-[10px] text-[#9dff9d]">
        <span>{label}</span>
        <span className="text-[#5a8a5a]">{value.toFixed(step < 1 ? 3 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer accent-[#7dff7d]"
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
    <label className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#9dff9d]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[#7dff7d]"
      />
    </label>
  );
}

export function ControlPanel({
  config,
  activePreset,
  scenarioId,
  stressMultiplier,
  splitView,
  splitPresetA,
  splitPresetB,
  debug,
  showHeader = true,
  onConfigChange,
  onPresetChange,
  onScenarioChange,
  onStressChange,
  onSplitViewToggle,
  onSplitPresetAChange,
  onSplitPresetBChange,
  onDebugChange,
  onImport,
}: ControlPanelProps) {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-panel)]">
      {showHeader ? (
        <header className="border-b border-[var(--ui-border)] px-4 py-3">
          <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--phosphor-primary)]">
            ASCII Lab
          </h1>
          <p className="mt-1 text-[9px] leading-relaxed text-[var(--ui-text-dim)]">
            Laboratório isolado · engine compartilhada
          </p>
        </header>
      ) : null}

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="border-b border-[var(--ui-border)]/50 py-3">
          <LabInteractiveCursorToggle
            checked={config.enableInteraction !== false}
            onChange={(value) => onConfigChange({ enableInteraction: value })}
          />
        </div>

        <Section title="Presets">
          <div className="flex flex-wrap gap-1.5">
            {ASCII_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.description}
                onClick={() => onPresetChange(preset.id)}
                className={[
                  "rounded border px-2 py-1 font-mono text-[9px] transition-colors",
                  activePreset === preset.id
                    ? "border-[#7dff7d] bg-[#7dff7d]/15 text-[#c8ffc8]"
                    : "border-[#2a4a2a] text-[#7dff7d] hover:border-[#3d6b3d]",
                ].join(" ")}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Cenários">
          <div className="space-y-1.5">
            {ASCII_TEST_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onScenarioChange(scenario.id)}
                className={[
                  "block w-full rounded border px-2 py-1.5 text-left transition-colors",
                  scenarioId === scenario.id
                    ? "border-[#7dff7d] bg-[#7dff7d]/10"
                    : "border-[#2a4a2a] hover:border-[#3d6b3d]",
                ].join(" ")}
              >
                <div className="font-mono text-[10px] text-[#9dff9d]">{scenario.label}</div>
                <div className="text-[9px] text-[#5a8a5a]">{scenario.description}</div>
              </button>
            ))}
          </div>
          <StressTest multiplier={stressMultiplier} onChange={onStressChange} />
        </Section>

        <Section title="Cursor">
          <Slider label="Raio" value={config.radius} min={20} max={400} step={5} onChange={(v) => onConfigChange({ radius: v })} />
          <Slider label="Intensidade (strength)" value={config.strength} min={40} max={600} step={10} onChange={(v) => onConfigChange({ strength: v })} />
          <Slider label="Damping" value={config.damping} min={0.5} max={0.98} step={0.01} onChange={(v) => onConfigChange({ damping: v })} />
          <Slider label="Spring" value={config.spring} min={0.02} max={0.25} step={0.005} onChange={(v) => onConfigChange({ spring: v })} />
          <Slider label="Min distance" value={config.minDistance} min={1} max={20} step={1} onChange={(v) => onConfigChange({ minDistance: v })} />
        </Section>

        <Section title="Física">
          <Slider label="Restoration damping" value={config.restorationDamping} min={0.5} max={0.98} step={0.01} onChange={(v) => onConfigChange({ restorationDamping: v })} />
          <Slider label="Restoration spring" value={config.restorationSpring} min={0.02} max={0.25} step={0.005} onChange={(v) => onConfigChange({ restorationSpring: v })} />
          <Slider label="Energy impulse" value={config.energyImpulseScale} min={0} max={1} step={0.02} onChange={(v) => onConfigChange({ energyImpulseScale: v })} />
          <Slider label="Micro oscillation" value={config.microOscillationStrength} min={0} max={1} step={0.05} onChange={(v) => onConfigChange({ microOscillationStrength: v })} />
          <Toggle label="Physics enabled" checked={config.enablePhysics} onChange={(v) => onConfigChange({ enablePhysics: v })} />
        </Section>

        <Section title="Trail">
          <Slider label="Trail radius" value={config.trailRadius} min={8} max={120} step={2} onChange={(v) => onConfigChange({ trailRadius: v })} />
          <Slider label="Trail decay" value={config.trailDecay} min={0.005} max={0.12} step={0.001} onChange={(v) => onConfigChange({ trailDecay: v })} />
          <Slider label="Trail deposit" value={config.trailDeposit} min={0.05} max={0.6} step={0.01} onChange={(v) => onConfigChange({ trailDeposit: v })} />
          <Slider label="Trail lifetime (ms)" value={config.trailLifetime} min={200} max={4000} step={100} onChange={(v) => onConfigChange({ trailLifetime: v })} />
          <Slider label="Trail length" value={config.trailLength} min={4} max={48} step={1} onChange={(v) => onConfigChange({ trailLength: v })} />
          <Toggle label="Trail enabled" checked={config.enableTrail} onChange={(v) => onConfigChange({ enableTrail: v })} />
        </Section>

        <Section title="Evolução">
          <Slider label="Histerese" value={config.evolutionHysteresis} min={0.01} max={0.2} step={0.01} onChange={(v) => onConfigChange({ evolutionHysteresis: v })} />
          <Slider label="Density" value={config.density} min={0.2} max={2} step={0.05} onChange={(v) => onConfigChange({ density: v })} />
          <Toggle label="Evolution enabled" checked={config.enableEvolution} onChange={(v) => onConfigChange({ enableEvolution: v })} />
        </Section>

        <Section title="Caracteres">
          <div className="flex flex-wrap gap-1">
            {Object.entries(CHARACTER_SETS).map(([id, set]) => (
              <button
                key={id}
                type="button"
                onClick={() => onConfigChange({ characterSet: set })}
                className={[
                  "rounded border px-2 py-1 font-mono text-[9px]",
                  config.characterSet === set
                    ? "border-[#7dff7d] text-[#c8ffc8]"
                    : "border-[#2a4a2a] text-[#7dff7d]",
                ].join(" ")}
              >
                {id}
              </button>
            ))}
          </div>
          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-[#9dff9d]">Custom set</span>
            <input
              type="text"
              value={config.characterSet}
              onChange={(e) => onConfigChange({ characterSet: e.target.value })}
              className="w-full rounded border border-[#2a4a2a] bg-[#050805] px-2 py-1 font-mono text-[10px] text-[#c8ffc8]"
            />
          </label>
        </Section>

        <Section title="Renderer">
          <Slider label="Font size" value={config.fontSize} min={6} max={20} step={1} onChange={(v) => onConfigChange({ fontSize: v })} />
          <Slider label="Cell width" value={config.cellWidth} min={4} max={16} step={1} onChange={(v) => onConfigChange({ cellWidth: v })} />
          <Slider label="Cell height" value={config.cellHeight} min={6} max={24} step={1} onChange={(v) => onConfigChange({ cellHeight: v })} />
          <Slider label="Opacity" value={config.opacity} min={0.05} max={1} step={0.01} onChange={(v) => onConfigChange({ opacity: v })} />
          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-[#9dff9d]">Falloff</span>
            <select
              value={config.defaultFalloff}
              onChange={(e) => onConfigChange({ defaultFalloff: e.target.value as FalloffCurve })}
              className="w-full rounded border border-[#2a4a2a] bg-[#050805] px-2 py-1 font-mono text-[10px] text-[#c8ffc8]"
            >
              <option value="gaussian">gaussian</option>
              <option value="smoothstep">smoothstep</option>
              <option value="inverse">inverse</option>
            </select>
          </label>
        </Section>

        <Section title="Layers">
          <Slider
            label="Layer count"
            value={config.layerCount}
            min={1}
            max={5}
            step={1}
            onChange={(v) => {
              const parallax = Array.from({ length: v }, (_, i) => (i + 1) / v);
              onConfigChange({ layerCount: v, parallax });
            }}
          />
          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-[#9dff9d]">Parallax (csv)</span>
            <input
              type="text"
              value={config.parallax.join(", ")}
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((s) => parseFloat(s.trim()))
                  .filter((n) => !Number.isNaN(n));
                if (values.length > 0) onConfigChange({ parallax: values });
              }}
              className="w-full rounded border border-[#2a4a2a] bg-[#050805] px-2 py-1 font-mono text-[10px] text-[#c8ffc8]"
            />
          </label>
        </Section>

        <Section title="Comparação">
          <Toggle label="Split View" checked={splitView} onChange={onSplitViewToggle} />
          {splitView ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="font-mono text-[9px] text-[#5a8a5a]">Preset A</span>
                <select
                  value={splitPresetA}
                  onChange={(e) => onSplitPresetAChange(e.target.value)}
                  className="w-full rounded border border-[#2a4a2a] bg-[#050805] px-1 py-1 font-mono text-[9px] text-[#c8ffc8]"
                >
                  {ASCII_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-mono text-[9px] text-[#5a8a5a]">Preset B</span>
                <select
                  value={splitPresetB}
                  onChange={(e) => onSplitPresetBChange(e.target.value)}
                  className="w-full rounded border border-[#2a4a2a] bg-[#050805] px-1 py-1 font-mono text-[9px] text-[#c8ffc8]"
                >
                  {ASCII_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </Section>

        <Section title="Debug">
          <Toggle label="Debug mode" checked={debug.enabled} onChange={(v) => onDebugChange({ enabled: v })} />
          <Toggle label="Grid" checked={debug.showGrid} onChange={(v) => onDebugChange({ showGrid: v })} />
          <Toggle label="Bounding boxes" checked={debug.showBoundingBoxes} onChange={(v) => onDebugChange({ showBoundingBoxes: v })} />
          <Toggle label="Influence radius" checked={debug.showInfluenceRadius} onChange={(v) => onDebugChange({ showInfluenceRadius: v })} />
          <Toggle label="Active cells" checked={debug.showActiveCells} onChange={(v) => onDebugChange({ showActiveCells: v })} />
          <Toggle label="Vectors" checked={debug.showVectors} onChange={(v) => onDebugChange({ showVectors: v })} />
        </Section>
      </div>

      <footer className="flex gap-2 border-t border-[var(--ui-border)] p-3">
        <button
          type="button"
          onClick={() => downloadLabConfig(config)}
          className="flex-1 cursor-pointer rounded border border-[var(--ui-border)] px-2 py-2 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
        >
          Export Config
        </button>
        <button
          type="button"
          onClick={async () => {
            const imported = await pickAndImportLabConfig();
            if (imported) onImport(imported);
          }}
          className="flex-1 cursor-pointer rounded border border-[var(--ui-border)] px-2 py-2 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)]"
        >
          Import Config
        </button>
      </footer>
    </div>
  );
}
