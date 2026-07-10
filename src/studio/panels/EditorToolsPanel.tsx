"use client";

import { useState } from "react";
import type { EditorDocument, EditorToolId } from "@/features/ascii-engine/editor";
import { EDITOR_TOOLS } from "@/features/ascii-engine/editor";
import { PanelButton, PanelSection } from "@/studio/ui/controls";

interface EditorToolsPanelProps {
  document: EditorDocument;
  onChange: () => void;
}

/**
 * Painel Studio: tools ready (W5) + stroke/text/replace/move params.
 * Core API é a fonte de verdade — demonstra applyToolAt / moveSelectionBy.
 */
export function EditorToolsPanel({ document, onChange }: EditorToolsPanelProps) {
  const state = document.getState();
  const [col, setCol] = useState(0);
  const [row, setRow] = useState(0);
  const [stroke, setStroke] = useState(state.strokeChar);
  const [text, setText] = useState(state.textBuffer);
  const [fromChar, setFromChar] = useState(state.replaceFrom);
  const [toChar, setToChar] = useState(state.replaceTo);
  const [dCol, setDCol] = useState(state.moveDelta.col);
  const [dRow, setDRow] = useState(state.moveDelta.row);

  const readyTools = EDITOR_TOOLS.filter((t) => t.status === "ready");
  const stubTools = EDITOR_TOOLS.filter((t) => t.status === "stub");

  const sync = () => onChange();

  return (
    <PanelSection title="Editor Tools (W5)">
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
      {stubTools.length > 0 ? (
        <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
          stubs: {stubTools.map((t) => t.id).join(", ")}
        </p>
      ) : null}

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

      <label className="block text-[10px] text-[var(--ui-text-dim)]">
        Text
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            document.setTextBuffer(e.target.value);
            sync();
          }}
          className="ml-2 w-28 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
        />
      </label>

      <div className="flex gap-2 text-[10px] text-[var(--ui-text-dim)]">
        <label>
          from
          <input
            type="text"
            maxLength={1}
            value={fromChar}
            onChange={(e) => {
              const ch = e.target.value || ".";
              setFromChar(ch);
              document.setReplaceChars(ch, toChar);
              sync();
            }}
            className="ml-1 w-8 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          />
        </label>
        <label>
          to
          <input
            type="text"
            maxLength={1}
            value={toChar}
            onChange={(e) => {
              const ch = e.target.value || "#";
              setToChar(ch);
              document.setReplaceChars(fromChar, ch);
              sync();
            }}
            className="ml-1 w-8 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          />
        </label>
      </div>

      <div className="flex gap-2 text-[10px] text-[var(--ui-text-dim)]">
        <label>
          Δcol
          <input
            type="number"
            value={dCol}
            onChange={(e) => {
              const n = Number(e.target.value);
              setDCol(n);
              document.setMoveDelta(n, dRow);
              sync();
            }}
            className="ml-1 w-12 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          />
        </label>
        <label>
          Δrow
          <input
            type="number"
            value={dRow}
            onChange={(e) => {
              const n = Number(e.target.value);
              setDRow(n);
              document.setMoveDelta(dCol, n);
              sync();
            }}
            className="ml-1 w-12 border border-[var(--ui-border)] bg-transparent px-1 font-mono text-[var(--ui-text)]"
          />
        </label>
      </div>

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
        {col},{row}={document.getCharAt(col, row) || "∅"} · clip=
        {state.clipboard ? `${state.clipboard.cols}×${state.clipboard.rows}` : "∅"}
      </p>
    </PanelSection>
  );
}
