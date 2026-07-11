"use client";

import { useEffect, useRef } from "react";

import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import {
  DEFAULT_MATRIX_CELL_H,
  DEFAULT_MATRIX_CELL_W,
  renderMatrixToCanvas,
} from "@/features/ascii-interaction/image-pipeline/render-utils";

export interface MatrixPreviewProps {
  matrix: AsciiMatrix;
  cellW?: number;
  cellH?: number;
  backgroundColor?: string;
  className?: string;
}

/**
 * Static WYSIWYG preview — same MatrixRasterizer path as PNG/GIF export.
 * Does not use GlyphAtlas / physics (those stay on Engine/Playground).
 */
export function MatrixPreview({
  matrix,
  cellW = DEFAULT_MATRIX_CELL_W,
  cellH = DEFAULT_MATRIX_CELL_H,
  backgroundColor = "#0a120a",
  className,
}: MatrixPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const target = canvasRef.current;
    if (!target) return;
    const rendered = renderMatrixToCanvas(matrix, {
      cellW,
      cellH,
      backgroundColor,
    });
    target.width = rendered.width;
    target.height = rendered.height;
    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(rendered, 0, 0);
  }, [matrix, cellW, cellH, backgroundColor]);

  return (
    <div className={`flex h-full w-full items-center justify-center overflow-auto ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="max-h-full max-w-full"
        style={{ imageRendering: "pixelated" }}
        aria-label="ASCII conversion preview"
      />
    </div>
  );
}
