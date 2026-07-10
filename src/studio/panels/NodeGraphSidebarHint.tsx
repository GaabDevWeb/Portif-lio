"use client";

import { PanelSection } from "@/studio/ui/controls";
import type { ProjectDocument } from "@/features/ascii-engine/document";

interface NodeGraphSidebarHintProps {
  document: ProjectDocument;
}

/** Resumo compacto na sidebar Studio — o editor completo vive na área principal. */
export function NodeGraphSidebarHint({ document }: NodeGraphSidebarHintProps) {
  const graph = document.getNodeGraph();
  const nodes = graph?.nodes.length ?? 0;
  const edges = graph?.edges.length ?? 0;

  return (
    <div className="space-y-4 px-4 py-3">
      <PanelSection title="Node Graph (P7)">
        <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
          Editor na área principal · projeto: {nodes}n / {edges}e
        </p>
      </PanelSection>
    </div>
  );
}
