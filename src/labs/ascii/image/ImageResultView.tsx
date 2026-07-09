"use client";

import { LabViewport } from "@/labs/ascii/LabViewport";
import { WorkspaceView } from "@/labs/ascii/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/labs/ascii/workspace/useWorkspaceViewport";
import type { LabViewportProps } from "@/labs/ascii/types";
import type { AsciiGridSource } from "@/features/ascii-interaction";

interface ImageResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  source: AsciiGridSource;
  config: LabViewportProps["config"];
  debugEnabled: boolean;
  debugFlags: LabViewportProps["debugFlags"];
  onMetrics?: LabViewportProps["onMetrics"];
}

export function ImageResultView({
  workspace,
  previewUrl,
  source,
  config,
  debugEnabled,
  debugFlags,
  onMetrics,
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
        debugFlags={debugFlags}
        onMetrics={onMetrics}
        className="h-full"
      />
    </WorkspaceView>
  );
}
