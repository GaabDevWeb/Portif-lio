"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProjectDocument } from "@/features/ascii-engine/document";
import {
  BUILTIN_NODE_DEFINITIONS,
  createNodeGraphRunner,
  getBuiltinNode,
  type BuiltinNodeType,
  type GraphEdge,
  type GraphNode,
  type ImageBuffer,
  type NodeGraph,
  type NodePortValue,
} from "@/features/ascii-engine/nodes";
import { PanelButton, PanelSection } from "@/labs/ascii/ui/controls";

interface NodeGraphPanelProps {
  document: ProjectDocument;
  /** Notifica o shell após mutações no ProjectDocument (ex.: save). */
  onDocumentChange?: () => void;
}

const EMPTY_GRAPH: NodeGraph = { version: 1, nodes: [], edges: [] };

const selectClass =
  "w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1 font-mono text-[10px] text-[var(--ui-text)]";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function makeDemoBuffer(width = 24, height = 12, fill = 0.35): ImageBuffer {
  const n = width * height;
  const luminance = new Float32Array(n);
  const r = new Uint8ClampedArray(n);
  const g = new Uint8ClampedArray(n);
  const b = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i += 1) {
    const t = (i % width) / Math.max(1, width - 1);
    const lum = Math.min(1, Math.max(0, fill + t * 0.45));
    luminance[i] = lum;
    const v = Math.round(lum * 255);
    r[i] = v;
    g[i] = v;
    b[i] = v;
  }
  return { width, height, luminance, r, g, b };
}

function summarizeValue(value: NodePortValue | undefined): string {
  if (value == null) return "∅";
  if (value instanceof Blob) return `Blob(${value.size}b, ${value.type || "bin"})`;
  if (Array.isArray(value)) return `RgbaFrame[${value.length}]`;
  if (typeof value === "object" && "cells" in value) {
    return `AsciiMatrix ${value.cols}×${value.rows} (${value.cells.length} cells)`;
  }
  if (typeof value === "object" && "luminance" in value) {
    return `ImageBuffer ${value.width}×${value.height}`;
  }
  return typeof value;
}

function cloneGraph(graph: NodeGraph): NodeGraph {
  return {
    version: 1,
    nodes: graph.nodes.map((n) => ({
      ...n,
      params: n.params ? { ...n.params } : undefined,
      position: n.position ? { ...n.position } : undefined,
    })),
    edges: graph.edges.map((e) => ({ ...e })),
  };
}

/**
 * Editor mínimo de NodeGraph (P7): lista/add nodes, edges via dropdowns,
 * Run (demo buffer) e Save no ProjectDocument. Sem canvas library.
 */
export function NodeGraphPanel({ document, onDocumentChange }: NodeGraphPanelProps) {
  const [graph, setGraph] = useState<NodeGraph>(() =>
    cloneGraph(document.getNodeGraph() ?? EMPTY_GRAPH),
  );
  const [addType, setAddType] = useState<BuiltinNodeType>("Brightness");
  const [edgeFrom, setEdgeFrom] = useState("");
  const [edgeFromPort, setEdgeFromPort] = useState("");
  const [edgeTo, setEdgeTo] = useState("");
  const [edgeToPort, setEdgeToPort] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [runLog, setRunLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Sync local editor when ProjectDocument instance changes (load/import).
  useEffect(() => {
    setGraph(cloneGraph(document.getNodeGraph() ?? EMPTY_GRAPH));
    setDirty(false);
    setStatus(null);
    setRunLog([]);
  }, [document]);

  const runner = useMemo(() => createNodeGraphRunner(), []);

  const fromDef = edgeFrom ? getBuiltinNode(graph.nodes.find((n) => n.id === edgeFrom)?.type ?? "") : undefined;
  const toDef = edgeTo ? getBuiltinNode(graph.nodes.find((n) => n.id === edgeTo)?.type ?? "") : undefined;

  useEffect(() => {
    const firstOut = fromDef?.outputs[0]?.id ?? "";
    setEdgeFromPort((prev) => (fromDef?.outputs.some((p) => p.id === prev) ? prev : firstOut));
  }, [fromDef]);

  useEffect(() => {
    const firstIn = toDef?.inputs[0]?.id ?? "";
    setEdgeToPort((prev) => (toDef?.inputs.some((p) => p.id === prev) ? prev : firstIn));
  }, [toDef]);

  const mutate = useCallback((next: NodeGraph) => {
    setGraph(next);
    setDirty(true);
    setStatus(null);
  }, []);

  const addNode = () => {
    const def = getBuiltinNode(addType);
    const node: GraphNode = {
      id: uid(addType.toLowerCase()),
      type: addType,
      params: def?.defaultParams ? { ...def.defaultParams } : undefined,
    };
    mutate({ ...graph, nodes: [...graph.nodes, node] });
    setStatus(`Node ${node.id} (${addType}) adicionado.`);
  };

  const removeNode = (id: string) => {
    mutate({
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== id),
      edges: graph.edges.filter((e) => e.from !== id && e.to !== id),
    });
  };

  const addEdge = () => {
    if (!edgeFrom || !edgeTo || !edgeFromPort || !edgeToPort) {
      setStatus("Escolha from/to e portas.");
      return;
    }
    if (edgeFrom === edgeTo) {
      setStatus("Edge não pode ligar um node a si próprio.");
      return;
    }
    const edge: GraphEdge = {
      id: uid("e"),
      from: edgeFrom,
      fromPort: edgeFromPort,
      to: edgeTo,
      toPort: edgeToPort,
    };
    mutate({ ...graph, edges: [...graph.edges, edge] });
    setStatus(`Edge ${edge.from}:${edge.fromPort} → ${edge.to}:${edge.toPort}`);
  };

  const removeEdge = (id: string) => {
    mutate({ ...graph, edges: graph.edges.filter((e) => e.id !== id) });
  };

  const saveToProject = () => {
    document.setNodeGraph(graph);
    setDirty(false);
    setStatus(
      `Guardado no projeto · ${graph.nodes.length} nodes · ${graph.edges.length} edges`,
    );
    onDocumentChange?.();
  };

  const loadFromProject = () => {
    setGraph(cloneGraph(document.getNodeGraph() ?? EMPTY_GRAPH));
    setDirty(false);
    setStatus("Recarregado do ProjectDocument.");
    setRunLog([]);
  };

  const clearGraph = () => {
    mutate(cloneGraph(EMPTY_GRAPH));
    setRunLog([]);
    setStatus("Grafo limpo (não guardado).");
  };

  const runGraph = async () => {
    setBusy(true);
    setStatus(null);
    setRunLog([]);
    try {
      const validation = runner.validate(graph);
      if (!validation.ok) {
        setRunLog(validation.issues.map((i) => `[${i.code}] ${i.message}`));
        setStatus(`Validação falhou (${validation.issues.length} issues).`);
        return;
      }

      const bindings: Record<string, Record<string, NodePortValue>> = {};
      const demo = makeDemoBuffer();
      for (const node of graph.nodes) {
        if (node.type === "ImageSource") {
          bindings[node.id] = { image: demo };
        }
      }

      const result = await runner.execute(graph, { bindings });
      const lines: string[] = [
        `ok · order: ${result.order.join(" → ")}`,
        `cacheHits: ${result.cacheHits}`,
      ];
      for (const nodeId of result.order) {
        const ports = result.outputs[nodeId];
        if (!ports) continue;
        for (const [portId, value] of Object.entries(ports)) {
          lines.push(`${nodeId}.${portId}: ${summarizeValue(value)}`);
        }
      }
      setRunLog(lines);
      setStatus("Run OK (ImageSource usa buffer demo 24×12).");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha no Run.");
      setRunLog([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto bg-[var(--bg-void)] px-6 py-5">
      <PanelSection title="Node Graph Editor (P7)">
        <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
          UI mínima — lista + dropdowns (sem canvas). Persistência via{" "}
          <code className="text-[var(--phosphor-primary)]">projectDoc.setNodeGraph</code>.
          {dirty ? " · dirty" : ""}
        </p>

        <div className="flex flex-wrap gap-1">
          <select
            className={`${selectClass} max-w-[10rem] flex-1`}
            value={addType}
            onChange={(e) => setAddType(e.target.value as BuiltinNodeType)}
          >
            {BUILTIN_NODE_DEFINITIONS.map((d) => (
              <option key={d.type} value={d.type}>
                {d.label}
              </option>
            ))}
          </select>
          <PanelButton onClick={addNode}>Add node</PanelButton>
        </div>

        <ul className="max-h-40 space-y-1 overflow-auto font-mono text-[9px]">
          {graph.nodes.length === 0 ? (
            <li className="text-[var(--ui-text-dim)]">Nenhum node.</li>
          ) : (
            graph.nodes.map((n) => {
              const def = getBuiltinNode(n.type);
              return (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-2 border border-[var(--ui-border)]/40 px-2 py-1"
                >
                  <span className="truncate text-[var(--ui-text)]">
                    <span className="text-[var(--phosphor-primary)]">{n.id}</span>
                    {" · "}
                    {def?.label ?? n.type}
                  </span>
                  <PanelButton className="shrink-0 px-1.5 py-0.5" onClick={() => removeNode(n.id)}>
                    ×
                  </PanelButton>
                </li>
              );
            })
          )}
        </ul>
      </PanelSection>

      <PanelSection title="Edges">
        <div className="grid grid-cols-2 gap-1">
          <label className="block text-[9px] text-[var(--ui-text-dim)]">
            From
            <select
              className={`${selectClass} mt-0.5`}
              value={edgeFrom}
              onChange={(e) => setEdgeFrom(e.target.value)}
            >
              <option value="">—</option>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} ({n.type})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[9px] text-[var(--ui-text-dim)]">
            From port
            <select
              className={`${selectClass} mt-0.5`}
              value={edgeFromPort}
              onChange={(e) => setEdgeFromPort(e.target.value)}
              disabled={!fromDef}
            >
              {(fromDef?.outputs ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} ({p.type})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[9px] text-[var(--ui-text-dim)]">
            To
            <select
              className={`${selectClass} mt-0.5`}
              value={edgeTo}
              onChange={(e) => setEdgeTo(e.target.value)}
            >
              <option value="">—</option>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} ({n.type})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[9px] text-[var(--ui-text-dim)]">
            To port
            <select
              className={`${selectClass} mt-0.5`}
              value={edgeToPort}
              onChange={(e) => setEdgeToPort(e.target.value)}
              disabled={!toDef}
            >
              {(toDef?.inputs ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} ({p.type})
                </option>
              ))}
            </select>
          </label>
        </div>
        <PanelButton className="w-full" onClick={addEdge}>
          Add edge
        </PanelButton>

        <ul className="max-h-28 space-y-1 overflow-auto font-mono text-[9px]">
          {graph.edges.length === 0 ? (
            <li className="text-[var(--ui-text-dim)]">Nenhuma edge.</li>
          ) : (
            graph.edges.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-2 border border-[var(--ui-border)]/40 px-2 py-1"
              >
                <span className="truncate text-[var(--ui-text)]">
                  {e.from}:{e.fromPort} → {e.to}:{e.toPort}
                </span>
                <PanelButton className="shrink-0 px-1.5 py-0.5" onClick={() => removeEdge(e.id)}>
                  ×
                </PanelButton>
              </li>
            ))
          )}
        </ul>
      </PanelSection>

      <PanelSection title="Actions">
        <div className="flex flex-wrap gap-1">
          <PanelButton disabled={busy} className="flex-1" onClick={() => void runGraph()}>
            {busy ? "Running…" : "Run graph"}
          </PanelButton>
          <PanelButton className="flex-1" onClick={saveToProject}>
            Save to project
          </PanelButton>
          <PanelButton onClick={loadFromProject}>Reload</PanelButton>
          <PanelButton onClick={clearGraph}>Clear</PanelButton>
        </div>
        {status ? (
          <p className="font-mono text-[9px] text-[var(--phosphor-primary)]">{status}</p>
        ) : null}
        {runLog.length > 0 ? (
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-[var(--ui-border)]/40 bg-[var(--bg-void)] p-2 font-mono text-[8px] text-[var(--ui-text-dim)]">
            {runLog.join("\n")}
          </pre>
        ) : null}
      </PanelSection>
    </div>
  );
}
