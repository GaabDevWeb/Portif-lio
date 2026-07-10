"use client";

interface LabInteractiveCursorToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function LabInteractiveCursorToggle({ checked, onChange }: LabInteractiveCursorToggleProps) {
  return (
    <label className="mb-2 flex cursor-pointer items-center gap-2 text-[10px] text-[var(--ui-text-dim)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--phosphor-primary)]"
      />
      Interactive Cursor
    </label>
  );
}
