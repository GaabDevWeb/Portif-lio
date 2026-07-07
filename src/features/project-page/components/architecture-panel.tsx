import type { ArchitecturePanel } from "@/features/project-page/types";

const TYPE_LABELS: Record<ArchitecturePanel["type"], string> = {
  architecture: "ARCH",
  pipeline: "PIPE",
  flow: "FLOW",
  stack: "STACK",
  problem: "PROB",
  decision: "ADR",
  performance: "PERF",
  custom: "NOTE",
};

interface ArchitecturePanelCardProps {
  panel: ArchitecturePanel;
  index: number;
  total: number;
}

export function ArchitecturePanelCard({ panel, index, total }: ArchitecturePanelCardProps) {
  const label = TYPE_LABELS[panel.type];

  return (
    <article
      data-arch-panel
      className="flex h-full w-[min(85vw,640px)] shrink-0 flex-col border border-[var(--ui-border)] bg-[var(--bg-panel)]/60 p-6 md:p-8"
      aria-labelledby={`panel-${panel.id}`}
    >
      <header className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--ui-border)] pb-4">
        <span className="font-mono text-[10px] text-[var(--phosphor-dim)]">
          {"// "}
          {label}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--phosphor-dim)]">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <h2
        id={`panel-${panel.id}`}
        className="font-mono text-xl text-[var(--ui-text)] md:text-2xl"
      >
        {panel.title}
      </h2>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--ui-text-dim)] md:text-base">
        {panel.body}
      </p>

      {panel.code && (
        <pre className="mt-6 overflow-x-auto border border-[var(--ui-border)] bg-[var(--bg-void)] p-4 font-mono text-[11px] leading-relaxed text-[var(--phosphor-primary)]">
          {panel.code}
        </pre>
      )}
    </article>
  );
}
