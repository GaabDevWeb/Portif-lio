import type {
  GraphEdge,
  GraphNode,
  NodeDefinition,
  NodeGraph,
  NodeGraphValidationIssue,
  NodeGraphValidationResult,
  NodePortType,
} from "@/features/ascii-engine/nodes/types";
import { BUILTIN_NODE_MAP } from "@/features/ascii-engine/nodes/builtin-nodes";

function portCompatible(from: NodePortType, to: NodePortType): boolean {
  return from === to;
}

/**
 * Valida DAG: ids únicos, edges válidas, tipos de porta, ausência de ciclos.
 * Devolve ordem topológica (Kahn) quando ok.
 */
export function validateNodeGraph(
  graph: NodeGraph,
  registry: ReadonlyMap<string, NodeDefinition> = BUILTIN_NODE_MAP,
): NodeGraphValidationResult {
  const issues: NodeGraphValidationIssue[] = [];
  const nodesById = new Map<string, GraphNode>();

  for (const node of graph.nodes) {
    if (nodesById.has(node.id)) {
      issues.push({ code: "duplicate-id", message: `Node id duplicado: ${node.id}`, nodeId: node.id });
      continue;
    }
    nodesById.set(node.id, node);
    if (!registry.has(node.type)) {
      issues.push({
        code: "unknown-type",
        message: `Tipo de node desconhecido: ${node.type}`,
        nodeId: node.id,
      });
    }
  }

  const adj = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const id of nodesById.keys()) {
    adj.set(id, []);
    indegree.set(id, 0);
  }

  for (const edge of graph.edges) {
    const fromNode = nodesById.get(edge.from);
    const toNode = nodesById.get(edge.to);
    if (!fromNode || !toNode) {
      issues.push({
        code: "dangling-edge",
        message: `Edge ${edge.id} referencia node inexistente`,
        edgeId: edge.id,
      });
      continue;
    }

    const fromDef = registry.get(fromNode.type);
    const toDef = registry.get(toNode.type);
    if (!fromDef || !toDef) continue;

    const outPort = fromDef.outputs.find((p) => p.id === edge.fromPort);
    const inPort = toDef.inputs.find((p) => p.id === edge.toPort);
    if (!outPort || !inPort) {
      issues.push({
        code: "unknown-node",
        message: `Edge ${edge.id}: porta inexistente (${edge.fromPort}→${edge.toPort})`,
        edgeId: edge.id,
        nodeId: edge.to,
      });
      continue;
    }
    if (!portCompatible(outPort.type, inPort.type)) {
      issues.push({
        code: "port-mismatch",
        message: `Edge ${edge.id}: ${outPort.type} → ${inPort.type}`,
        edgeId: edge.id,
        nodeId: edge.to,
      });
    }

    adj.get(edge.from)!.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of indegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id) ?? []) {
      const d = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }

  if (order.length !== nodesById.size) {
    issues.push({
      code: "cycle",
      message: "Grafo contém ciclo (não é DAG)",
    });
  }

const ok = issues.length === 0 && order.length === nodesById.size;

  return {
    ok,
    issues,
    order: order.length === nodesById.size ? order : undefined,
  };
}

export function topologicalOrder(graph: NodeGraph, registry?: ReadonlyMap<string, NodeDefinition>): string[] {
  const result = validateNodeGraph(graph, registry);
  if (!result.order) {
    throw new Error(
      `NodeGraph inválido: ${result.issues.map((i) => i.message).join("; ") || "ciclo"}`,
    );
  }
  return result.order;
}

/** Agrupa edges por node destino → porta. */
export function incomingEdgesByNode(edges: GraphEdge[]): Map<string, GraphEdge[]> {
  const map = new Map<string, GraphEdge[]>();
  for (const edge of edges) {
    const list = map.get(edge.to) ?? [];
    list.push(edge);
    map.set(edge.to, list);
  }
  return map;
}
