"use client";

import { manifestoContent } from "@/content-data/manifesto";
import { ModulePanel } from "@/features/landing/components/module-panel";

export function ManifestoSection() {
  const paragraphs = manifestoContent
    .replace(/^# .+\n+/m, "")
    .trim()
    .split("\n\n")
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8" style={{ paddingBlock: "var(--section-padding-y)" }}>
      <div data-reveal>
        <ModulePanel id="manifesto" code="MOD-MANIFESTO" title="~/manifesto.md">
          <div className="space-y-4 font-mono text-sm leading-relaxed text-[var(--ui-text-dim)] md:text-base">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </ModulePanel>
      </div>
    </div>
  );
}
