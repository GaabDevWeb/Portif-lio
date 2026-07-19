"use client";

import type { ToolHost } from "@/features/ascii-engine/tools";
import type { BrushEngine } from "@/features/ascii-engine/brush";
import { BRUSH_PRESETS } from "@/features/ascii-engine/brush";
import { PanelButton, PanelSection } from "@/studio/ui/controls";

interface EditToolsToolbarProps {
  toolHost: ToolHost;
  brush: BrushEngine;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onChange: () => void;
}

export function EditToolsToolbar({
  toolHost,
  brush,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onChange,
}: EditToolsToolbarProps) {
  const active = toolHost.getActiveId();
  const preset = brush.getPreset();

  return (
    <PanelSection title="Tools">
      <div className="flex flex-wrap gap-1">
        {toolHost.list().map((t) => (
          <PanelButton
            key={t.id}
            className={
              active === t.id
                ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10"
                : undefined
            }
            onClick={() => {
              toolHost.setActive(t.id);
              if (t.id === "pencil") brush.setPresetById("pencil");
              if (t.id === "brush") brush.setPresetById("brush");
              onChange();
            }}
          >
            {t.label}
          </PanelButton>
        ))}
      </div>

      <div className="flex gap-1">
        <PanelButton disabled={!canUndo} onClick={onUndo}>
          Undo
        </PanelButton>
        <PanelButton disabled={!canRedo} onClick={onRedo}>
          Redo
        </PanelButton>
      </div>

      <label className="block text-[10px] text-[var(--ui-text-dim)]">
        Brush preset
        <select
          className="ml-2 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          value={preset.id}
          onChange={(e) => {
            brush.setPresetById(e.target.value);
            onChange();
          }}
        >
          {BRUSH_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.status === "experimental" ? " *" : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-[10px] text-[var(--ui-text-dim)]">
        Size
        <input
          type="range"
          min={1}
          max={16}
          value={preset.size}
          onChange={(e) => {
            brush.setPreset({ ...preset, size: Number(e.target.value) });
            onChange();
          }}
          className="ml-2 w-24 accent-[var(--phosphor-primary)]"
        />
        <span className="ml-1 text-[var(--ui-text)]">{preset.size}</span>
      </label>
    </PanelSection>
  );
}
