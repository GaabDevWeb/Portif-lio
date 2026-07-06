"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods } from "react-force-graph-2d";

import {
  buildGraphIndices,
  getHighlightSubgraph,
  loadKnowledgeGraph,
  type KGColorToken,
} from "@/lib/content/knowledge-graph";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { adaptGraphData } from "../lib/graph-adapter";
import {
  nodeRadius,
  resolveNodeColor,
  resolveThemeColors,
} from "../lib/colors";
import { useGraphStore } from "../store/graph-store";
import type { ForceGraphLink, ForceGraphNode } from "../types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center font-mono text-xs text-[var(--phosphor-dim)]">
      Initializing renderer...
    </div>
  ),
});

interface KnowledgeGraphCanvasProps {
  graphRef: MutableRefObject<ForceGraphMethods | undefined>;
  onNodeSelect: (nodeId: string | null) => void;
  onProjectOpen: (slug: string) => void;
  focusNodeId: string | null;
  visible: boolean;
}

export function KnowledgeGraphCanvas({
  graphRef,
  onNodeSelect,
  onProjectOpen,
  focusNodeId,
  visible,
}: KnowledgeGraphCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const pulseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const highlightBlendRef = useRef(0);
  const [, setRenderFrame] = useState(0);

  const hoveredId = useGraphStore((s) => s.hoveredId);
  const selectedId = useGraphStore((s) => s.selectedId);
  const pinnedHighlight = useGraphStore((s) => s.pinnedHighlight);
  const revealProgress = useGraphStore((s) => s.revealProgress);
  const linkRevealProgress = useGraphStore((s) => s.linkRevealProgress);
  const setHoveredId = useGraphStore((s) => s.setHoveredId);
  const setSimStable = useGraphStore((s) => s.setSimStable);

  const graphData = useMemo(() => adaptGraphData(loadKnowledgeGraph()), []);
  const indices = useMemo(() => buildGraphIndices(), []);

  const maxRevealIndex = useMemo(
    () => Math.max(...graphData.nodes.map((n) => n.revealIndex), 1),
    [graphData.nodes],
  );

  const highlightId = pinnedHighlight ? selectedId : hoveredId;
  const highlight = useMemo(() => {
    if (!highlightId) return null;
    return getHighlightSubgraph(highlightId, indices, 1);
  }, [highlightId, indices]);

  const theme = useMemo(() => resolveThemeColors(), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDimensions({
        width: Math.max(entry.contentRect.width, 320),
        height: Math.max(entry.contentRect.height, 320),
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let running = true;

    const animate = () => {
      if (!running) return;

      pulseRef.current = performance.now();

      const target = highlightId ? 1 : 0;
      const current = highlightBlendRef.current;
      const step = reducedMotion ? 1 : 0.07;
      const next =
        Math.abs(target - current) < 0.004
          ? target
          : current + (target - current) * step;
      highlightBlendRef.current = next;

      const animating = Math.abs(next - current) > 0.004;
      if (animating || highlightId) {
        setRenderFrame((f) => f + 1);
      }

      if (running && (animating || highlightId)) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, highlightId, reducedMotion]);

  useEffect(() => {
    if (!focusNodeId || !graphRef.current) return;
    const node = graphData.nodes.find((n) => n.id === focusNodeId);
    if (!node || node.x == null || node.y == null) return;
    graphRef.current.centerAt(node.x, node.y, 600);
    graphRef.current.zoom(2.2, 600);
  }, [focusNodeId, graphData.nodes, graphRef]);

  useEffect(() => {
    if (!visible || !graphRef.current) return;
    const timer = window.setTimeout(() => {
      graphRef.current?.zoomToFit(400, 56);
    }, reducedMotion ? 50 : 1800);
    return () => window.clearTimeout(timer);
  }, [visible, graphRef, reducedMotion]);

  const getNodeOpacity = useCallback(
    (node: ForceGraphNode) => {
      const blend = highlightBlendRef.current;

      const revealThreshold = (node.revealIndex / maxRevealIndex) * revealProgress;
      const revealed = reducedMotion
        ? 1
        : revealProgress >= revealThreshold
          ? 1
          : 0;
      if (revealed === 0) return 0;

      if (!highlight || blend <= 0) return revealed;

      const inSubgraph = highlight.nodes.has(node.id);
      const highlightedOpacity = inSubgraph ? revealed : revealed * 0.32;
      return revealed * (1 - blend) + highlightedOpacity * blend;
    },
    [highlight, maxRevealIndex, revealProgress, reducedMotion],
  );

  const getLinkOpacity = useCallback(
    (link: ForceGraphLink) => {
      const blend = highlightBlendRef.current;

      if (!reducedMotion && linkRevealProgress < 0.05) return 0;

      const base = reducedMotion ? 0.32 : linkRevealProgress * 0.38;
      if (!highlight || blend <= 0) return base;

      const inSubgraph = highlight.links.has(link.id);
      const highlightedOpacity = inSubgraph ? Math.min(0.62, base + 0.22) : base * 0.22;
      return base * (1 - blend) + highlightedOpacity * blend;
    },
    [highlight, linkRevealProgress, reducedMotion],
  );

  const getLinkWidth = useCallback(
    (link: ForceGraphLink) => {
      const blend = highlightBlendRef.current;
      const scale = 1 / Math.sqrt(dimensions.width / 800);
      const base = 0.45 * scale;

      if (!highlight || blend <= 0) return base;

      const inSubgraph = highlight.links.has(link.id);
      const highlightedWidth = inSubgraph ? 0.85 * scale : 0.35 * scale;
      return base * (1 - blend) + highlightedWidth * blend;
    },
    [dimensions.width, highlight],
  );

  const paintNode = useCallback(
    (node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const opacity = getNodeOpacity(node);
      if (opacity <= 0) return;

      const isActive = highlightId === node.id;
      const isHighlighted = highlight?.nodes.has(node.id) ?? false;
      const radius = nodeRadius(node.type, node.level ?? 50);
      const color = resolveNodeColor(node.color as KGColorToken);

      ctx.save();
      ctx.globalAlpha = opacity;

      if (isActive || isHighlighted) {
        const pulse = reducedMotion
          ? 1
          : 1 + Math.sin(pulseRef.current * 0.003) * 0.04;
        const glowStrength = isActive ? 0.08 : 0.05;
        ctx.shadowColor = color;
        ctx.shadowBlur = (isActive ? 8 : 5) / globalScale;
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, radius * pulse * 1.35, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity * glowStrength * highlightBlendRef.current;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = theme.labelBright;
      ctx.lineWidth = 0.5 / globalScale;
      ctx.stroke();

      if (globalScale > 0.55 && opacity > 0.4) {
        const fontSize = Math.max(9 / globalScale, 3);
        ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = isActive || isHighlighted ? theme.labelBright : theme.label;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.title, node.x!, node.y! + radius + 2 / globalScale);
      }

      ctx.restore();
    },
    [getNodeOpacity, highlight, highlightId, reducedMotion, theme],
  );

  const paintPointerArea = useCallback(
    (
      node: ForceGraphNode,
      color: string,
      ctx: CanvasRenderingContext2D,
    ) => {
      const radius = nodeRadius(node.type, node.level ?? 50);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, Math.max(radius, 8), 0, 2 * Math.PI);
      ctx.fill();
    },
    [],
  );

  const handleNodeClick = useCallback(
    (node: object, event: MouseEvent) => {
      const n = node as ForceGraphNode;
      if (n.projectSlug) {
        onProjectOpen(n.projectSlug);
        return;
      }
      if (event.shiftKey) {
        useGraphStore.getState().setPinnedHighlight(true);
      }
      onNodeSelect(n.id);
    },
    [onNodeSelect, onProjectOpen],
  );

  const handleNodeHover = useCallback(
    (node: object | null) => {
      const n = node as ForceGraphNode | null;
      setHoveredId(n?.id ?? null);
    },
    [setHoveredId],
  );

  const handleEngineStop = useCallback(() => {
    setSimStable(true);
    graphRef.current?.pauseAnimation();
  }, [graphRef, setSimStable]);

  const handleBackgroundClick = useCallback(() => {
    onNodeSelect(null);
    useGraphStore.getState().setPinnedHighlight(false);
  }, [onNodeSelect]);

  const handleNodeDrag = useCallback(() => {
    setSimStable(false);
    graphRef.current?.resumeAnimation();
    const sim = graphRef.current;
    if (sim) {
      sim.d3ReheatSimulation();
    }
  }, [graphRef, setSimStable]);

  const handleNodeDragEnd = useCallback((node: object) => {
    const n = node as ForceGraphNode;
    n.fx = undefined;
    n.fy = undefined;
  }, []);

  const paintNodeWrapped = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      paintNode(node as ForceGraphNode, ctx, globalScale);
    },
    [paintNode],
  );

  const paintLink = useCallback(
    (link: object, ctx: CanvasRenderingContext2D) => {
      const l = link as ForceGraphLink & {
        source: ForceGraphNode;
        target: ForceGraphNode;
      };
      const source = l.source;
      const target = l.target;
      if (source.x == null || source.y == null || target.x == null || target.y == null) {
        return;
      }

      const opacity = getLinkOpacity(l);
      if (opacity <= 0.01) return;

      const inSubgraph = highlight?.links.has(l.id) ?? false;
      const blend = highlightBlendRef.current;
      const dim = { r: 90, g: 100, b: 110 };
      const bright = { r: 130, g: 185, b: 150 };
      const mix = inSubgraph ? blend : 0;
      const r = Math.round(dim.r * (1 - mix) + bright.r * mix);
      const g = Math.round(dim.g * (1 - mix) + bright.g * mix);
      const b = Math.round(dim.b * (1 - mix) + bright.b * mix);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = getLinkWidth(l);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.restore();
    },
    [getLinkOpacity, getLinkWidth, highlight],
  );

  const paintLinkWrapped = useCallback(
    (link: object, ctx: CanvasRenderingContext2D) => {
      paintLink(link, ctx);
    },
    [paintLink],
  );
  const paintPointerWrapped = useCallback(
    (node: object, color: string, ctx: CanvasRenderingContext2D) => {
      paintPointerArea(node as ForceGraphNode, color, ctx);
    },
    [paintPointerArea],
  );

  if (!visible) {
    return (
      <div
        ref={containerRef}
        className="min-h-[320px] bg-[var(--bg-void)] md:min-h-[480px]"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[320px] w-full bg-[var(--bg-void)] md:min-h-[480px]"
      data-lenis-prevent
      role="img"
      aria-label="Interactive knowledge graph"
    >
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="transparent"
        nodeRelSize={1}
        linkDirectionalParticles={0}
        enableNodeDrag
        enableZoomInteraction
        enablePanInteraction
        warmupTicks={reducedMotion ? 120 : 80}
        cooldownTicks={reducedMotion ? 0 : 100}
        d3AlphaDecay={0.028}
        d3VelocityDecay={0.35}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        onNodeDrag={handleNodeDrag}
        onNodeDragEnd={handleNodeDragEnd}
        onEngineStop={handleEngineStop}
        nodeCanvasObject={paintNodeWrapped}
        nodePointerAreaPaint={paintPointerWrapped}
        linkCanvasObject={paintLinkWrapped}
        linkCanvasObjectMode={() => "replace"}
        linkVisibility={(link) => getLinkOpacity(link as ForceGraphLink) > 0.01}
        nodeLabel=""
      />
    </div>
  );
}
