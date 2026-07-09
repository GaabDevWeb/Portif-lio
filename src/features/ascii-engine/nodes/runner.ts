import { BUILTIN_NODE_MAP, getBuiltinNode } from "@/features/ascii-engine/nodes/builtin-nodes";
import {
  incomingEdgesByNode,
  topologicalOrder,
  validateNodeGraph,
} from "@/features/ascii-engine/nodes/validate";
import type {
  NodeDefinition,
  NodeGraph,
  NodeGraphExecuteOptions,
  NodeGraphExecuteResult,
  NodeGraphValidationResult,
  NodePortValue,
} from "@/features/ascii-engine/nodes/types";

function stableHash(parts: unknown[]): string {
  // Hash simples FNV-1a sobre JSON — suficiente para memo de sessão.
  const str = JSON.stringify(parts, (_key, value) => {
    if (value instanceof Float32Array || value instanceof Uint8ClampedArray) {
      let h = 2166136261;
      const step = Math.max(1, Math.floor(value.length / 64));
      for (let i = 0; i < value.length; i += step) {
        h ^= value[i]!;
        h = Math.imul(h, 16777619);
      }
      h ^= value.length;
      return `typed:${h}`;
    }
    if (typeof Blob !== "undefined" && value instanceof Blob) {
      return `blob:${value.size}:${value.type}`;
    }
    if (value && typeof value === "object" && "cells" in value && "cols" in value) {
      const m = value as { cols: number; rows: number; cells: { length: number }; charset: string };
      return `matrix:${m.cols}x${m.rows}:${m.cells.length}:${m.charset}`;
    }
    return value;
  });
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function normalizeExecuteResult(
  raw: NodePortValue | Record<string, NodePortValue>,
  def: NodeDefinition,
): Record<string, NodePortValue> {
  const primary = def.outputs[0];
  if (!primary) {
    throw new Error(`Node ${def.type} sem outputs`);
  }
  if (raw instanceof Blob || Array.isArray(raw)) {
    return { [primary.id]: raw };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const looksLikePorts = def.outputs.some((o) => o.id in obj);
    if (looksLikePorts) {
      return raw as Record<string, NodePortValue>;
    }
  }
  return { [primary.id]: raw as NodePortValue };
}

/**
 * Runner headless — executa DAG em ordem topológica.
 * Reutiliza steps do image-pipeline via built-in nodes.
 */
export class NodeGraphRunner {
  private readonly registry: Map<string, NodeDefinition>;
  private readonly memo = new Map<string, Record<string, NodePortValue>>();

  constructor(extraNodes: NodeDefinition[] = []) {
    this.registry = new Map(BUILTIN_NODE_MAP);
    for (const def of extraNodes) {
      this.registry.set(def.type, def);
    }
  }

  register(def: NodeDefinition): void {
    this.registry.set(def.type, def);
  }

  getDefinition(type: string): NodeDefinition | undefined {
    return this.registry.get(type) ?? getBuiltinNode(type);
  }

  listDefinitions(): NodeDefinition[] {
    return [...this.registry.values()];
  }

  validate(graph: NodeGraph): NodeGraphValidationResult {
    return validateNodeGraph(graph, this.registry);
  }

  clearMemo(): void {
    this.memo.clear();
  }

  async execute(
    graph: NodeGraph,
    options: NodeGraphExecuteOptions = {},
  ): Promise<NodeGraphExecuteResult> {
    const memoize = options.memoize !== false;
    const validation = this.validate(graph);
    if (!validation.ok || !validation.order) {
      throw new Error(
        `NodeGraph inválido: ${validation.issues.map((i) => i.message).join("; ")}`,
      );
    }

    const order = validation.order.length
      ? validation.order
      : topologicalOrder(graph, this.registry);

    const outputs: Record<string, Record<string, NodePortValue>> = {};
    const incoming = incomingEdgesByNode(graph.edges);
    const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
    let cacheHits = 0;

    for (const nodeId of order) {
      const node = nodesById.get(nodeId)!;
      const def = this.registry.get(node.type);
      if (!def) {
        throw new Error(`Tipo desconhecido: ${node.type}`);
      }

      const inputs: Record<string, NodePortValue | undefined> = {};
      const binding = options.bindings?.[nodeId];
      if (binding) {
        for (const [port, value] of Object.entries(binding)) {
          inputs[port] = value;
        }
      }

      for (const edge of incoming.get(nodeId) ?? []) {
        const upstream = outputs[edge.from]?.[edge.fromPort];
        if (upstream !== undefined) {
          inputs[edge.toPort] = upstream;
        }
      }

      const params = { ...def.defaultParams, ...node.params };
      const memoKey = memoize
        ? `${node.type}:${stableHash([params, inputs])}`
        : "";

      if (memoize && this.memo.has(memoKey)) {
        outputs[nodeId] = this.memo.get(memoKey)!;
        cacheHits += 1;
        continue;
      }

      const raw = await def.execute({ inputs, params, nodeId });
      const portOut = normalizeExecuteResult(raw, def);
      outputs[nodeId] = portOut;
      if (memoize) this.memo.set(memoKey, portOut);
    }

    return { outputs, order, cacheHits };
  }
}

export function createNodeGraphRunner(extraNodes?: NodeDefinition[]): NodeGraphRunner {
  return new NodeGraphRunner(extraNodes);
}
