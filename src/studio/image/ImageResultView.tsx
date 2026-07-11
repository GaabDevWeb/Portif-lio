"use client";

import { MatrixPreview } from "@/studio/MatrixPreview";
import { WorkspaceView } from "@/studio/workspace/WorkspaceView";
import type { WorkspaceViewportApi } from "@/studio/workspace/useWorkspaceViewport";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
} from "@/features/ascii-interaction/image-pipeline/render-utils";

interface ImageResultViewProps {
  workspace: WorkspaceViewportApi;
  previewUrl: string | null;
  matrix: AsciiMatrix;
  cellW?: number;
  cellH?: number;
}

export function ImageResultView({
  workspace,
  previewUrl,
  matrix,
  cellW = DEFAULT_MATRIX_CELL_W,
  cellH = DEFAULT_MATRIX_CELL_H,
}: ImageResultViewProps) {
  return (
    <WorkspaceView
      workspace={workspace}
      hasOriginal={!!previewUrl}
      originalUrl={previewUrl}
      originalAlt="Imagem original"
    >
      <MatrixPreview matrix={matrix} cellW={cellW} cellH={cellH} className="h-full" />
    </WorkspaceView>
  );
}
