"use client";

/** Controles UI partilhados do ASCII Engine shell. */

export function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--ui-border)]/50 pb-4">
      <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--amber-led)]">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function PanelSlider({
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
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-[10px] text-[var(--ui-text-dim)]">
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="text-[var(--ui-text)]">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[var(--phosphor-primary)]"
      />
    </label>
  );
}

export function PanelToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-[10px] text-[var(--ui-text-dim)]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--phosphor-primary)]"
      />
    </label>
  );
}

export function PanelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-mono text-[10px]">
      <span className="text-[var(--ui-text-dim)]">{label}</span>
      <span className="text-[var(--ui-text)]">{value}</span>
    </div>
  );
}

export function PanelButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`cursor-pointer rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
