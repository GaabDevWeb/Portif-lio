"use client";

import { useState } from "react";
import type { EditorDocument, EditorToolId } from "@/features/ascii-engine/editor";
import { EDITOR_TOOLS } from "@/features/ascii-engine/editor";
import { PanelButton, PanelSection } from "@/labs/ascii/ui/controls";

interface EditorToolsPanelProps {
  document: EditorDocument;
  onChange: () => void;
}

/**
 * Painel mínimo Studio: escolhe tool, stroke, e aplica paint/fill em col/row.
 * Core API é a fonte de verdade — isto só demonstra o path applyToolAt.
 */
export function EditorToolsPanel({ document, onChange }: EditorToolsPanelProps) {
  const state = document.getState();
  const [col, setCol] = useState(0);
  const [row, setRow] = useState(0);
  const [stroke, setStroke] = useState(state.strokeChar);

  const readyTools = EDITOR_TOOLS.filter((t) =>
    t.id === "select" || t.id === "brush" || t.id === "eraser" || t.id === "fill",
  );

  const sync = () => onChange();

  return (
    <PanelSection title="Editor Tools (P2)">
      <div className="flex flex-wrap gap-1">
        {readyTools.map((t) => (
          <PanelButton
            key={t.id}
            className={
              state.activeTool === t.id
                ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10"
                : undefined
            }
            onClick={() => {
              document.setActiveTool(t.id as EditorToolId);
              sync();
            }}
          >
            {t.label}
          </PanelButton>
        ))}
      </div>

      <label className="block text-[10px] text-[var(--ui-text-dim)]">
        Stroke
        <input
          type="text"
          maxLength={1}
          value={stroke}
          onChange={(e) => {
            const ch = e.target.value || "#";
            setStroke(ch);
            document.setStrokeChar(ch);
            sync();
          }}
          className="ml-2 w-8 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
        />
      </label>

      <div className="flex gap-2 text-[10px] text-[var(--ui-text-dim)]">
        <label>
          col
          <input
            type="number"
            min={0}
            value={col}
            onChange={(e) => setCol(Number(e.target.value))}
            className="ml-1 w-12 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          />
        </label>
        <label>
          row
          <input
            type="number"
            min={0}
            value={row}
            onChange={(e) => setRow(Number(e.target.value))}
            className="ml-1 w-12 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1">
        <PanelButton
          onClick={() => {
            document.applyToolAt(col, row);
            sync();
          }}
        >
          Apply
        </PanelButton>
        <PanelButton
          disabled={!state.canUndo}
          onClick={() => {
            document.undo();
            sync();
          }}
        >
          Undo
        </PanelButton>
        <PanelButton
          disabled={!state.canRedo}
          onClick={() => {
            document.redo();
            sync();
          }}
        >
          Redo
        </PanelButton>
      </div>

      <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
        tool={state.activeTool} · undo={document.getHistoryDepth().undo} · char@
        {col},{row}={document.getCharAt(col, row) || "∅"}
      </p>
    </PanelSection>
  );
}
