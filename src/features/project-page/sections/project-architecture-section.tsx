"use client";

import { ArchitecturePanelCard } from "@/features/project-page/components/architecture-panel";
import { HORIZONTAL_SCROLL } from "@/features/project-page/config/motion-presets";
import { useHorizontalScroll } from "@/features/project-page/hooks/use-horizontal-scroll";
import type { ArchitecturePanel } from "@/features/project-page/types";

interface ProjectArchitectureSectionProps {
  panels: ArchitecturePanel[];
}

export function ProjectArchitectureSection({ panels }: ProjectArchitectureSectionProps) {
  const { sectionRef, trackRef, progressRef, reducedMotion } = useHorizontalScroll();

  if (reducedMotion) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 md:px-8" aria-label="Architecture">
        <h2 className="mb-10 font-mono text-sm text-[var(--phosphor-dim)]">{"// ARCHITECTURE"}</h2>
        <div className="flex flex-col gap-8">
          {panels.map((panel, i) => (
            <ArchitecturePanelCard
              key={panel.id}
              panel={panel}
              index={i}
              total={panels.length}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh overflow-hidden"
      aria-label="Architecture timeline"
    >
      <div className="absolute top-[var(--hud-height)] right-0 left-0 z-10 px-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-[10px] text-[var(--phosphor-dim)]">
          <span>{"// ARCHITECTURE — scroll ↓ moves →"}</span>
          <span className="hidden sm:inline">TIMELINE</span>
        </div>
        <div
          ref={progressRef}
          className="progress-rail mx-auto mt-3 max-w-6xl"
          style={{ "--progress": "0%" } as React.CSSProperties}
          aria-hidden
        />
      </div>

      <div className="flex h-full items-center pt-16">
        <div
          ref={trackRef}
          className="flex items-stretch px-4 will-change-transform md:px-8"
          style={{ gap: HORIZONTAL_SCROLL.panelGap }}
        >
          {panels.map((panel, i) => (
            <ArchitecturePanelCard
              key={panel.id}
              panel={panel}
              index={i}
              total={panels.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
