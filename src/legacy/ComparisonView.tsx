"use client";

import { LabViewport } from "@/legacy/LabViewport";
import { DebugOverlay } from "@/legacy/DebugOverlay";
import { applyPreset } from "@/studio/Presets";
import type { LabDebugOptions } from "@/studio/types";
import type { AsciiDebugSnapshot, AsciiEngineStats } from "@/features/ascii-interaction/types";
import { useState } from "react";

export interface ComparisonViewProps {
  source: string;
  presetA: string;
  presetB: string;
  debug: LabDebugOptions;
}

export function ComparisonView({
  source,
  presetA,
  presetB,
  debug,
}: ComparisonViewProps) {
  const [statsA, setStatsA] = useState<AsciiEngineStats | null>(null);
  const [statsB, setStatsB] = useState<AsciiEngineStats | null>(null);
  const [snapA, setSnapA] = useState<AsciiDebugSnapshot | null>(null);
  const [snapB, setSnapB] = useState<AsciiDebugSnapshot | null>(null);

  const configA = applyPreset(presetA);
  const configB = applyPreset(presetB);

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-px bg-[#1a3d1a]">
      <div className="relative min-h-0">
        <LabViewport
          source={source}
          config={configA}
          label={`A · ${presetA}`}
          debugEnabled={debug.enabled}
          onStats={setStatsA}
          onDebugSnapshot={setSnapA}
        />
        <DebugOverlay stats={statsA} snapshot={snapA} options={debug} />
      </div>
      <div className="relative min-h-0">
        <LabViewport
          source={source}
          config={configB}
          label={`B · ${presetB}`}
          debugEnabled={debug.enabled}
          onStats={setStatsB}
          onDebugSnapshot={setSnapB}
        />
        <DebugOverlay stats={statsB} snapshot={snapB} options={debug} />
      </div>
    </div>
  );
}
