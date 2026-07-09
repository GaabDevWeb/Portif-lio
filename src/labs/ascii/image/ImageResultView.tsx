"use client";

import { LabViewport } from "@/labs/ascii/LabViewport";
import { WorkspaceView } from "@/labs/ascii/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/labs/ascii/workspace/useWorkspaceViewport";
import type { AsciiGridSource } from "@/features/ascii-interaction";
import type { AsciiInteractionConfig, AsciiEngineStats } from "@/features/ascii-interaction/types";

interface ImageResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  source: AsciiGridSource;
  config: AsciiInteractionConfig;
  debugEnabled?: boolean;
  onStats?: (stats: AsciiEngineStats) => void;
}

export function ImageResultView({
  workspace,
  previewUrl,
  source,
  config,
  debugEnabled = false,
  onStats,
}: ImageResultViewProps) {
  return (
    <WorkspaceView
      workspace={workspace}
      hasOriginal={!!previewUrl}
      originalUrl={previewUrl}
      originalAlt="Imagem original"
    >
      <LabViewport
        source={source}
        config={config}
        debugEnabled={debugEnabled}
        onStats={onStats}
        className="h-full"
      />
    </WorkspaceView>
  );
}
