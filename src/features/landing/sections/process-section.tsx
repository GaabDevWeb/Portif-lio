"use client";

import { ModulePanel } from "@/features/landing/components/module-panel";
import { loadProcessSteps } from "@/lib/content/process";

export function ProcessSection() {
  const steps = loadProcessSteps();

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8" style={{ paddingBlock: "var(--section-padding-y)" }}>
      <div data-reveal>
        <ModulePanel id="process" code="MOD-PROCESS" title="~/process.md">
          <ol className="grid gap-3 md:grid-cols-2">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="border border-[var(--ui-border)] bg-[var(--bg-void)] p-4"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--phosphor-dim)]">
                  <span>{step.id}</span>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-2 font-mono text-sm text-[var(--phosphor-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--ui-text-dim)]">{step.description}</p>
              </li>
            ))}
          </ol>
        </ModulePanel>
      </div>
    </div>
  );
}
