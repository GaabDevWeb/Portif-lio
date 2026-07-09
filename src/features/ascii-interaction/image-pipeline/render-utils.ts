import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";

export interface MatrixRenderDimensions {
  width: number;
  height: number;
  cellW: number;
  cellH: number;
  fontSize: number;
}

export interface MatrixRenderOptions {
  targetWidth?: number;
  targetHeight?: number;
  cellW?: number;
  cellH?: number;
  maxWidth?: number;
  transparentBackground?: boolean;
  backgroundColor?: string;
}

/** Resolve dimensões de exportação — prioriza resolução original da fonte. */
export function resolveMatrixRenderDimensions(
  matrix: AsciiMatrix,
  options: MatrixRenderOptions = {},
): MatrixRenderDimensions {
  const cellW =
    options.targetWidth != null
      ? options.targetWidth / matrix.cols
      : (options.cellW ?? 7);
  const cellH =
    options.targetHeight != null
      ? options.targetHeight / matrix.rows
      : (options.cellH ?? 12);

  const width =
    options.targetWidth != null
      ? Math.round(options.targetWidth)
      : Math.round(matrix.cols * cellW);
  const height =
    options.targetHeight != null
      ? Math.round(options.targetHeight)
      : Math.round(matrix.rows * cellH);

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
    cellW,
    cellH,
    fontSize: Math.max(1, Math.floor(cellH * 0.85)),
  };
}

export function renderMatrixToCanvas(
  matrix: AsciiMatrix,
  options: MatrixRenderOptions = {},
): HTMLCanvasElement {
  const dims = resolveMatrixRenderDimensions(matrix, options);
  const canvas = document.createElement("canvas");
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");

  if (options.transparentBackground) {
    ctx.clearRect(0, 0, dims.width, dims.height);
  } else {
    ctx.fillStyle = options.backgroundColor ?? "#0a120a";
    ctx.fillRect(0, 0, dims.width, dims.height);
  }

  ctx.font = `${dims.fontSize}px "Courier New", monospace`;
  ctx.textBaseline = "bottom";

  for (const cell of matrix.cells) {
    ctx.fillStyle = `rgb(${Math.round(cell.r)},${Math.round(cell.g)},${Math.round(cell.b)})`;
    ctx.fillText(
      cell.char,
      cell.col * dims.cellW,
      (cell.row + 1) * dims.cellH - Math.max(1, dims.cellH * 0.08),
    );
  }

  if (options.maxWidth && canvas.width > options.maxWidth) {
    return scaleCanvas(canvas, options.maxWidth / canvas.width);
  }

  return canvas;
}

export function renderMatrixToImageData(
  matrix: AsciiMatrix,
  options: MatrixRenderOptions,
): ImageData {
  const canvas = renderMatrixToCanvas(matrix, options);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function scaleCanvas(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const scaled = document.createElement("canvas");
  scaled.width = Math.max(1, Math.round(source.width * scale));
  scaled.height = Math.max(1, Math.round(source.height * scale));
  const ctx = scaled.getContext("2d");
  if (!ctx) return source;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, scaled.width, scaled.height);
  return scaled;
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Falha ao exportar PNG."));
    }, "image/png");
  });
}
