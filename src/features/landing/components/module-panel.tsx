"use client";

import { cn } from "@/lib/utils";

interface ModulePanelProps {
  id?: string;
  code: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ModulePanel({ id, code, title, children, className }: ModulePanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative border border-[var(--ui-border)] bg-[var(--bg-panel)]",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-[var(--ui-border)] px-4 py-2">
        <span className="font-mono text-[11px] tracking-widest text-[var(--phosphor-dim)] uppercase">
          {code}
        </span>
        <span className="font-mono text-xs text-[var(--ui-text)]">{title}</span>
      </header>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  );
}

interface HudReadoutProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function HudReadout({ label, value, unit, className }: HudReadoutProps) {
  return (
    <div
      className={cn(
        "border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2",
        className,
      )}
    >
      <p className="font-mono text-[10px] tracking-wider text-[var(--phosphor-dim)] uppercase">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-lg text-[var(--phosphor-primary)] tabular-nums">
        {value}
        {unit && (
          <span className="ml-1 text-xs text-[var(--ui-text-dim)]">{unit}</span>
        )}
      </p>
    </div>
  );
}
