"use client";

import type { SceneDocument } from "@/features/ascii-engine/scene";
import { runWithHistory, type SceneHistory } from "@/features/ascii-engine/scene";
import { PanelButton, PanelSection } from "@/studio/ui/controls";

interface LayersPanelProps {
  scene: SceneDocument;
  history: SceneHistory;
  onChange: () => void;
}

export function LayersPanel({ scene, history, onChange }: LayersPanelProps) {
  const layers = scene.getLayers();
  const activeId = scene.getActiveLayerId();

  return (
    <PanelSection title="Layers">
      <div className="flex gap-1">
        <PanelButton
          onClick={() => {
            runWithHistory(history, scene, "Add layer", () => {
              scene.addLayer();
            });
            onChange();
          }}
        >
          + Layer
        </PanelButton>
      </div>

      <ul className="space-y-1">
        {[...layers].reverse().map((layer, revIdx) => {
          const index = layers.length - 1 - revIdx;
          return (
            <li
              key={layer.id}
              className={`flex flex-col gap-1 border px-1.5 py-1 font-mono text-[10px] ${
                layer.id === activeId
                  ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/5"
                  : "border-[var(--ui-border)]"
              }`}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="min-w-0 flex-1 cursor-pointer truncate text-left text-[var(--ui-text)]"
                  onClick={() => {
                    scene.setActiveLayerId(layer.id);
                    onChange();
                  }}
                >
                  {layer.name}
                </button>
                <button
                  type="button"
                  title={layer.visible ? "Hide" : "Show"}
                  className="cursor-pointer px-0.5 text-[var(--ui-text-dim)] hover:text-[var(--phosphor-primary)]"
                  onClick={() => {
                    runWithHistory(history, scene, "Toggle layer visibility", () => {
                      scene.updateLayer(layer.id, { visible: !layer.visible });
                    });
                    onChange();
                  }}
                >
                  {layer.visible ? "vis" : "hid"}
                </button>
                <button
                  type="button"
                  title={layer.locked ? "Unlock" : "Lock"}
                  className="cursor-pointer px-0.5 text-[var(--ui-text-dim)] hover:text-[var(--phosphor-primary)]"
                  onClick={() => {
                    runWithHistory(history, scene, "Toggle layer lock", () => {
                      scene.updateLayer(layer.id, { locked: !layer.locked });
                    });
                    onChange();
                  }}
                >
                  {layer.locked ? "lock" : "edit"}
                </button>
              </div>
              <input
                type="text"
                value={layer.name}
                onChange={(e) => {
                  scene.updateLayer(layer.id, { name: e.target.value });
                  onChange();
                }}
                onBlur={() => {
                  /* rename already applied; optional history on blur skipped for typing UX */
                }}
                className="w-full border border-[var(--ui-border)] bg-transparent px-1 text-[var(--ui-text)]"
              />
              <div className="flex flex-wrap gap-1">
                <PanelButton
                  onClick={() => {
                    runWithHistory(history, scene, "Duplicate layer", () => {
                      scene.duplicateLayer(layer.id);
                    });
                    onChange();
                  }}
                >
                  Dup
                </PanelButton>
                <PanelButton
                  disabled={index >= layers.length - 1}
                  onClick={() => {
                    runWithHistory(history, scene, "Reorder layer", () => {
                      scene.reorderLayer(layer.id, index + 1);
                    });
                    onChange();
                  }}
                >
                  ↑
                </PanelButton>
                <PanelButton
                  disabled={index <= 0}
                  onClick={() => {
                    runWithHistory(history, scene, "Reorder layer", () => {
                      scene.reorderLayer(layer.id, index - 1);
                    });
                    onChange();
                  }}
                >
                  ↓
                </PanelButton>
                <PanelButton
                  disabled={layers.length <= 1}
                  onClick={() => {
                    runWithHistory(history, scene, "Remove layer", () => {
                      scene.removeLayer(layer.id);
                    });
                    onChange();
                  }}
                >
                  Del
                </PanelButton>
              </div>
              <p className="text-[9px] text-[var(--ui-text-dim)]">
                {layer.objectIds.length} objects · opacity {layer.opacity.toFixed(2)}
              </p>
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
