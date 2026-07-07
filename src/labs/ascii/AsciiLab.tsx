"use client";

import { useCallback, useMemo, useState } from "react";

import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import type { AsciiDebugSnapshot, AsciiEngineStats, AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import { ControlPanel } from "@/labs/ascii/ControlPanel";
import { ComparisonView } from "@/labs/ascii/ComparisonView";
import { DebugOverlay } from "@/labs/ascii/DebugOverlay";
import { LabViewport } from "@/labs/ascii/LabViewport";
import { applyPreset } from "@/labs/ascii/Presets";
import { getScenarioSource } from "@/labs/ascii/test-sources";
import { DEFAULT_DEBUG_OPTIONS } from "@/labs/ascii/types";

export function AsciiLab() {
  const [activePreset, setActivePreset] = useState("default");
  const [config, setConfig] = useState<AsciiInteractionConfig>(() => applyPreset("default"));
  const [scenarioId, setScenarioId] = useState("logo");
  const [stressMultiplier, setStressMultiplier] = useState(1);
  const [splitView, setSplitView] = useState(false);
  const [splitPresetA, setSplitPresetA] = useState("default");
  const [splitPresetB, setSplitPresetB] = useState("magnetic");
  const [debug, setDebug] = useState(DEFAULT_DEBUG_OPTIONS);
  const [stats, setStats] = useState<AsciiEngineStats | null>(null);
  const [snapshot, setSnapshot] = useState<AsciiDebugSnapshot | null>(null);

  const source = useMemo(
    () => getScenarioSource(scenarioId, stressMultiplier),
    [scenarioId, stressMultiplier],
  );

  const handlePresetChange = useCallback((presetId: string) => {
    setActivePreset(presetId);
    setConfig(applyPreset(presetId));
  }, []);

  const handleConfigChange = useCallback((patch: Partial<AsciiInteractionConfig>) => {
    setConfig((prev) => mergeAsciiConfig({ ...prev, ...patch }));
  }, []);

  const handleImport = useCallback((imported: AsciiInteractionConfig) => {
    setConfig(imported);
    setActivePreset("custom");
  }, []);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#050805] text-[#9dff9d]">
      <div className="w-[min(100%,360px)] shrink-0">
        <ControlPanel
          config={config}
          activePreset={activePreset}
          scenarioId={scenarioId}
          stressMultiplier={stressMultiplier}
          splitView={splitView}
          splitPresetA={splitPresetA}
          splitPresetB={splitPresetB}
          debug={debug}
          onConfigChange={handleConfigChange}
          onPresetChange={handlePresetChange}
          onScenarioChange={setScenarioId}
          onStressChange={setStressMultiplier}
          onSplitViewToggle={setSplitView}
          onSplitPresetAChange={setSplitPresetA}
          onSplitPresetBChange={setSplitPresetB}
          onDebugChange={(patch) => setDebug((d) => ({ ...d, ...patch }))}
          onImport={handleImport}
        />
      </div>

      <main className="relative min-h-0 min-w-0 flex-1">
        {splitView ? (
          <ComparisonView
            source={source}
            presetA={splitPresetA}
            presetB={splitPresetB}
            debug={debug}
          />
        ) : (
          <div className="relative h-full">
            <LabViewport
              source={source}
              config={config}
              debugEnabled={debug.enabled}
              onStats={setStats}
              onDebugSnapshot={setSnapshot}
            />
            <DebugOverlay stats={stats} snapshot={snapshot} options={debug} />
          </div>
        )}
      </main>
    </div>
  );
}
