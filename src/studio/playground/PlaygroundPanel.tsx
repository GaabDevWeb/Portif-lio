"use client";

import { useEffect, useRef, useState } from "react";

import type {
  AsciiInteractionConfig,
  AsciiInteractionEngineHandle,
  InfluencerSurface,
} from "@/features/ascii-interaction/types";
import {
  defaultPlaygroundRegistry,
  type PlaygroundEffectId,
} from "@/features/ascii-engine/playground";
import { LabViewport } from "@/studio/LabViewport";
import { PanelButton, PanelSection } from "@/studio/ui/controls";
import { getScenarioSource } from "@/studio/test-sources";

interface PlaygroundPanelProps {
  config: AsciiInteractionConfig;
}

function toSurface(handle: AsciiInteractionEngineHandle, config: AsciiInteractionConfig): InfluencerSurface {
  return {
    emitField: (input) => handle.emitField(input),
    updateField: (id, patch) => handle.updateField(id, patch),
    removeField: (id) => handle.removeField(id),
    getCanvasElement: () => document.querySelector("main canvas") as HTMLCanvasElement | null,
    getConfig: () => config,
    getSurfaceState: () => handle.getSurfaceState(),
    isReducedMotion: () => false,
  };
}

export function PlaygroundPanel({ config }: PlaygroundPanelProps) {
  const effects = defaultPlaygroundRegistry.list();
  const [activeId, setActiveId] = useState<PlaygroundEffectId | null>("matrix");
  const engineRef = useRef<AsciiInteractionEngineHandle>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const source = getScenarioSource("logo", 1);

  useEffect(() => {
    stopRef.current?.();
    stopRef.current = null;

    const handle = engineRef.current;
    if (!activeId || !handle) return;

    const effect = defaultPlaygroundRegistry.get(activeId);
    if (!effect || effect.descriptor.status !== "ready") return;

    const mounted = effect.mount(toSurface(handle, config));
    stopRef.current = mounted.stop;

    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [activeId, config]);

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <aside className="w-full shrink-0 space-y-3 overflow-y-auto border-b border-[var(--ui-border)] px-4 py-3 md:w-[280px] md:border-b-0 md:border-r">
        <PanelSection title="Playground Effects">
          <div className="grid grid-cols-2 gap-1">
            {effects.map((fx) => (
              <PanelButton
                key={fx.id}
                disabled={fx.status === "stub"}
                className={
                  activeId === fx.id
                    ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10"
                    : ""
                }
                onClick={() => setActiveId(fx.id)}
              >
                {fx.label}
                {fx.status === "stub" ? " · soon" : ""}
              </PanelButton>
            ))}
          </div>
          <p className="text-[9px] text-[var(--ui-text-dim)]">
            Efeitos via emitField. Ready: matrix, ripple, smoke, gravity, fire, wind,
            particles, explosion, water, noise. Stubs: tornado, cloth.
          </p>
        </PanelSection>
      </aside>
      <div className="relative min-h-0 flex-1">
        <LabViewport source={source} config={config} engineRef={engineRef} />
      </div>
    </div>
  );
}
