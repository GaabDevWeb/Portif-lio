"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ForceGraphMethods } from "react-force-graph-2d";

import { ModulePanel } from "@/features/landing/components/module-panel";
import { buildGraphIndices, loadKnowledgeGraph } from "@/lib/content/knowledge-graph";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSessionStore } from "@/providers/session-store";
import { BOOT_LINES } from "./graph-boot-terminal";
import { GraphBootTerminal } from "./graph-boot-terminal";
import { GraphControls } from "./graph-controls";
import { GraphFallbackList } from "./graph-fallback-list";
import { GraphInspector } from "./graph-inspector";
import { KnowledgeGraphCanvas } from "./knowledge-graph-canvas";
import { useGraphStore } from "../store/graph-store";

gsap.registerPlugin(ScrollTrigger);

export function KnowledgeGraphSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const bootStartedRef = useRef(false);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const phase = useGraphStore((s) => s.phase);
  const bootLineIndex = useGraphStore((s) => s.bootLineIndex);
  const selectedId = useGraphStore((s) => s.selectedId);
  const showFallback = useGraphStore((s) => s.showFallback);
  const setPhase = useGraphStore((s) => s.setPhase);
  const setBootLineIndex = useGraphStore((s) => s.setBootLineIndex);
  const setRevealProgress = useGraphStore((s) => s.setRevealProgress);
  const setLinkRevealProgress = useGraphStore((s) => s.setLinkRevealProgress);
  const setSelectedId = useGraphStore((s) => s.setSelectedId);
  const setShowFallback = useGraphStore((s) => s.setShowFallback);
  const resetInteraction = useGraphStore((s) => s.resetInteraction);

  const openProject = useSessionStore((s) => s.openProject);
  const emitSync = useSessionStore((s) => s.emitSync);

  const indices = buildGraphIndices();
  const selectedNode = selectedId ? indices.nodesById.get(selectedId) ?? null : null;

  const runBootSequence = useCallback(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    if (reducedMotion) {
      setBootLineIndex(BOOT_LINES.length - 1);
      setPhase("rendering");
      setRevealProgress(1);
      setLinkRevealProgress(1);
      setPhase("stable");
      return;
    }

    setPhase("booting");
    setBootLineIndex(-1);

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("rendering");
        gsap.to(
          { p: 0 },
          {
            p: 1,
            duration: 1.1,
            ease: "power2.out",
            onUpdate() {
              setRevealProgress(this.targets()[0].p);
            },
            onComplete: () => {
              gsap.to(
                { p: 0 },
                {
                  p: 1,
                  duration: 0.7,
                  ease: "power1.inOut",
                  onUpdate() {
                    setLinkRevealProgress(this.targets()[0].p);
                  },
                  onComplete: () => setPhase("stable"),
                },
              );
            },
          },
        );
      },
    });

    BOOT_LINES.forEach((_, index) => {
      tl.call(() => setBootLineIndex(index), undefined, index === 0 ? 0 : "+=0.45");
    });
    tl.to({}, { duration: 0.35 });
  }, [
    reducedMotion,
    setBootLineIndex,
    setLinkRevealProgress,
    setPhase,
    setRevealProgress,
  ]);

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      setSelectedId(nodeId);
      if (!nodeId) resetInteraction();
    },
    [resetInteraction, setSelectedId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleNodeSelect(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNodeSelect]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      once: true,
      onEnter: runBootSequence,
    });

    return () => trigger.kill();
  }, [runBootSequence]);

  const handleProjectOpen = useCallback(
    (slug: string) => {
      emitSync({ type: "section.goto", origin: "landing", section: "knowledge" });
      openProject(slug, "landing");
    },
    [emitSync, openProject],
  );

  const handleFocusNode = useCallback((nodeId: string) => {
    setFocusNodeId(nodeId);
    setSelectedId(nodeId);
    window.setTimeout(() => setFocusNodeId(null), 700);
  }, [setSelectedId]);

  const handleZoomIn = useCallback(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.zoom(fg.zoom() * 1.35, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.zoom(fg.zoom() / 1.35, 300);
  }, []);

  const handleReset = useCallback(() => {
    graphRef.current?.zoomToFit(500, 48);
    resetInteraction();
    setSelectedId(null);
  }, [resetInteraction, setSelectedId]);

  const handleFocusSelected = useCallback(() => {
    if (selectedId) handleFocusNode(selectedId);
  }, [handleFocusNode, selectedId]);

  const graphVisible = phase !== "idle" && phase !== "booting";
  const bootVisible = phase === "booting" || (phase === "rendering" && bootLineIndex >= 0);

  return (
    <div
      className="mx-auto max-w-6xl px-4 md:px-8"
      style={{ paddingBlock: "var(--section-padding-y)" }}
    >
      <div ref={sectionRef} data-reveal>
        <ModulePanel
          id="knowledge"
          code="MOD-KNOWLEDGE"
          title="index --knowledge"
        >
          <p className="mb-4 font-mono text-sm text-[var(--phosphor-dim)]">
            Ecossistema de conhecimento — conexões entre projetos, skills e tecnologias.
          </p>

          <div className="grid overflow-hidden border border-[var(--ui-border)] lg:grid-cols-[1fr_280px]">
            <div className="min-w-0">
              <GraphBootTerminal
                lineIndex={bootLineIndex}
                visible={bootVisible && !reducedMotion}
              />
              <KnowledgeGraphCanvas
                graphRef={graphRef}
                visible={graphVisible}
                onNodeSelect={handleNodeSelect}
                onProjectOpen={handleProjectOpen}
                focusNodeId={focusNodeId}
              />
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                onFocusSelected={handleFocusSelected}
                onToggleFallback={() => setShowFallback(!showFallback)}
                fallbackOpen={showFallback}
                hasSelection={Boolean(selectedId)}
              />
              {showFallback && (
                <GraphFallbackList
                  selectedId={selectedId}
                  onSelect={(id) => {
                    handleNodeSelect(id);
                    handleFocusNode(id);
                  }}
                />
              )}
            </div>

            <GraphInspector
              node={selectedNode && selectedNode.type !== "project" ? selectedNode : null}
              onClose={() => handleNodeSelect(null)}
              onOpenProject={handleProjectOpen}
              onFocusNode={handleFocusNode}
              className="hidden lg:flex"
            />
          </div>

          {selectedNode && selectedNode.type !== "project" && (
            <div className="mt-3 border border-[var(--ui-border)] lg:hidden">
              <GraphInspector
                node={selectedNode}
                onClose={() => handleNodeSelect(null)}
                onOpenProject={handleProjectOpen}
                onFocusNode={handleFocusNode}
                className="max-h-[50vh]"
              />
            </div>
          )}
        </ModulePanel>
      </div>
    </div>
  );
}

export function getKnowledgeGraphNodeCount(): number {
  return loadKnowledgeGraph().nodes.length;
}
