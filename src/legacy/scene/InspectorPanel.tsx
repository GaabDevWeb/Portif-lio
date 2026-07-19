"use client";

import type { SceneDocument, EffectRef } from "@/features/ascii-engine/scene";
import { runWithHistory, type SceneHistory } from "@/features/ascii-engine/scene";
import { PanelButton, PanelSection, PanelSlider, PanelToggle } from "@/studio/ui/controls";

interface InspectorPanelProps {
  scene: SceneDocument;
  history: SceneHistory;
  onChange: () => void;
}

export function InspectorPanel({ scene, history, onChange }: InspectorPanelProps) {
  const ids = scene.getSelectedObjectIds();
  const obj = ids[0] ? scene.getObject(ids[0]) : undefined;

  if (!obj) {
    return (
      <PanelSection title="Inspector">
        <p className="font-mono text-[10px] text-[var(--ui-text-dim)]">
          Nenhum objeto selecionado.
        </p>
      </PanelSection>
    );
  }

  const patch = (partial: Parameters<SceneDocument["updateObject"]>[1], label: string) => {
    runWithHistory(history, scene, label, () => {
      scene.updateObject(obj.id, partial);
    });
    onChange();
  };

  const live = (partial: Parameters<SceneDocument["updateObject"]>[1]) => {
    scene.updateObject(obj.id, partial);
    onChange();
  };

  return (
    <PanelSection title="Inspector">
      <p className="font-mono text-[9px] uppercase text-[var(--amber-led)]">
        {obj.type} · {obj.id.slice(0, 8)}
      </p>

      <label className="block text-[10px] text-[var(--ui-text-dim)]">
        Name
        <input
          type="text"
          value={obj.name}
          onChange={(e) => live({ name: e.target.value })}
          className="ml-2 w-[calc(100%-3rem)] border border-[var(--ui-border)] bg-transparent px-1 text-[var(--ui-text)]"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumField
          label="X"
          value={obj.transform.x}
          onChange={(x) => live({ transform: { ...obj.transform, x } })}
        />
        <NumField
          label="Y"
          value={obj.transform.y}
          onChange={(y) => live({ transform: { ...obj.transform, y } })}
        />
        <NumField
          label="W"
          value={obj.bounds.w}
          onChange={(w) => live({ bounds: { ...obj.bounds, w: Math.max(1, w) } })}
        />
        <NumField
          label="H"
          value={obj.bounds.h}
          onChange={(h) => live({ bounds: { ...obj.bounds, h: Math.max(1, h) } })}
        />
      </div>

      <PanelSlider
        label="Opacity"
        value={obj.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(opacity) => live({ opacity })}
      />

      <PanelToggle
        label="Visible"
        checked={obj.visible}
        onChange={(visible) => patch({ visible }, "Toggle visibility")}
      />
      <PanelToggle
        label="Locked"
        checked={obj.locked}
        onChange={(locked) => patch({ locked }, "Toggle lock")}
      />

      <EffectsList
        effects={obj.effects}
        onChange={(effects) => {
          runWithHistory(history, scene, "Update effects", () => {
            scene.updateObject(obj.id, { effects });
          });
          onChange();
        }}
      />

      <PanelButton
        onClick={() => {
          runWithHistory(history, scene, "Duplicate object", () => {
            scene.duplicateObject(obj.id);
          });
          onChange();
        }}
      >
        Duplicate
      </PanelButton>
      <PanelButton
        onClick={() => {
          runWithHistory(history, scene, "Delete object", () => {
            scene.removeObject(obj.id);
          });
          onChange();
        }}
      >
        Delete
      </PanelButton>
    </PanelSection>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-[10px] text-[var(--ui-text-dim)]">
      {label}
      <input
        type="number"
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ml-1 w-16 border border-[var(--ui-border)] bg-transparent px-1 text-[var(--ui-text)]"
      />
    </label>
  );
}

function EffectsList({
  effects,
  onChange,
}: {
  effects: EffectRef[];
  onChange: (effects: EffectRef[]) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[9px] uppercase text-[var(--ui-text-dim)]">Effects</p>
      {effects.length === 0 ? (
        <p className="text-[9px] text-[var(--ui-text-dim)]">Nenhum efeito.</p>
      ) : (
        <ul className="space-y-1">
          {effects.map((fx) => (
            <li key={fx.id} className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--ui-text)]">
                {fx.kind}
                {!fx.enabled ? " (off)" : ""}
              </span>
              <button
                type="button"
                className="cursor-pointer text-[var(--ui-text-dim)] hover:text-[var(--phosphor-primary)]"
                onClick={() =>
                  onChange(
                    effects.map((e) =>
                      e.id === fx.id ? { ...e, enabled: !e.enabled } : e,
                    ),
                  )
                }
              >
                toggle
              </button>
            </li>
          ))}
        </ul>
      )}
      <PanelButton
        onClick={() => {
          const id =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `fx-${Date.now()}`;
          onChange([...effects, { id, kind: "outline", enabled: true, params: {} }]);
        }}
      >
        + Outline
      </PanelButton>
    </div>
  );
}
