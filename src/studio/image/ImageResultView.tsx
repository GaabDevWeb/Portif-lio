"use client";

import { LabViewport } from "@/studio/LabViewport";
import { WorkspaceView } from "@/studio/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/studio/workspace/useWorkspaceViewport";
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
