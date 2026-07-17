import type { AsciiMatrix, ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";

/** Alias SSOT — buffer amostrado do image-pipeline. */
export type ImageBuffer = ImageSampleBuffer;

/** Tipos de porta do grafo (PLATFORM §3.13). */
export type NodePortType =
  | "ImageBuffer"
  | "RgbaFrame[]"
  | "AsciiMatrix"
  | "AsciiAnimation"
  | "Blob";

export type NodePortValue =
  | ImageBuffer
  | RgbaFrame[]
  | AsciiMatrix
  | AsciiAnimation
  | Blob;

export interface NodePortDef {
  id: string;
  type: NodePortType;
  label?: string;
}

export type BuiltinNodeType =
  | "ImageSource"
  | "Resize"
  | "Brightness"
  | "Contrast"
  | "Gamma"
  | "Exposure"
  | "Blur"
  | "Sharpen"
  | "Edge"
  | "Threshold"
  | "Invert"
  | "Dither"
  | "CharsetMap"
  | "ColorMode"
  | "Effect"
  | "Export";

export interface GraphNode {
  id: string;
  type: BuiltinNodeType | string;
  /** Parâmetros tipados por definição do node. */
  params?: Record<string, unknown>;
  /** Posição UI (P7); ignorada no runner headless. */
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  /** Node de origem. */
  from: string;
  fromPort: string;
  /** Node de destino. */
  to: string;
  toPort: string;
}

/**
 * Grafo serializável no ProjectDocument (PLATFORM §3.13).
 * Substitui o stub P1 com schema real; compatível com `{ version, nodes, edges }`.
 */
export interface NodeGraph {
  version: 1;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodeExecuteContext {
  /** Inputs resolvidos por id de porta. */
  inputs: Record<string, NodePortValue | undefined>;
  params: Record<string, unknown>;
  nodeId: string;
}

export interface NodeDefinition {
  type: BuiltinNodeType | string;
  label: string;
  description?: string;
  inputs: NodePortDef[];
  outputs: NodePortDef[];
  defaultParams?: Record<string, unknown>;
  execute(ctx: NodeExecuteContext): NodePortValue | Promise<NodePortValue> | Record<string, NodePortValue> | Promise<Record<string, NodePortValue>>;
}

export interface NodeGraphValidationIssue {
  code: "unknown-node" | "unknown-type" | "cycle" | "port-mismatch" | "missing-edge" | "duplicate-id" | "dangling-edge";
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface NodeGraphValidationResult {
  ok: boolean;
  issues: NodeGraphValidationIssue[];
  /** Ordem topológica quando ok (ou parcial se só avisos). */
  order?: string[];
}

export interface NodeGraphExecuteOptions {
  /** Memoizar outputs por hash de (type+params+inputs). Default true. */
  memoize?: boolean;
  /** Valores externos injectados em portas de source (ex.: ImageSource.buffer). */
  bindings?: Record<string, Record<string, NodePortValue>>;
}

export interface NodeGraphExecuteResult {
  /** Outputs por nodeId → portId → value. */
  outputs: Record<string, Record<string, NodePortValue>>;
  order: string[];
  cacheHits: number;
}
