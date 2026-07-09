/** Default max edge when SVG has no intrinsic size (viewBox/width/height). */
const DEFAULT_RASTER_SIZE = 512;

/** Boolean check only — avoid `input is File` (narrows File → never when false). */
export function isSvgFile(input: unknown): boolean {
  if (typeof File === "undefined" || !(input instanceof File)) return false;
  if (input.type === "image/svg+xml") return true;
  return /\.svg$/i.test(input.name);
}

export function isSvgBlob(input: unknown): boolean {
  if (typeof Blob === "undefined" || !(input instanceof Blob)) return false;
  if (input instanceof File) return isSvgFile(input);
  return input.type === "image/svg+xml";
}

export function isSvgMarkup(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const trimmed = input.trimStart();
  return trimmed.startsWith("<svg") || trimmed.startsWith("<?xml");
}

export function canHandleSvgInput(input: unknown): boolean {
  return isSvgFile(input) || isSvgBlob(input) || isSvgMarkup(input);
}

function toSvgBlob(input: File | Blob | string): Blob {
  if (typeof input === "string") {
    return new Blob([input], { type: "image/svg+xml" });
  }
  if (input.type === "image/svg+xml") return input;
  return new Blob([input], { type: "image/svg+xml" });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar SVG como imagem."));
    img.src = url;
  });
}

function resolveRasterSize(
  img: HTMLImageElement,
  maxEdge = DEFAULT_RASTER_SIZE,
): { width: number; height: number } {
  const w = img.naturalWidth || img.width || maxEdge;
  const h = img.naturalHeight || img.height || maxEdge;
  if (w <= 0 || h <= 0) return { width: maxEdge, height: maxEdge };
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/**
 * Rasteriza SVG (File / Blob / markup) via Image + canvas, devolvendo
 * um HTMLImageElement PNG adequado ao image-pipeline existente.
 */
export async function rasterizeSvgToImage(
  input: File | Blob | string,
  options?: { maxEdge?: number },
): Promise<HTMLImageElement> {
  if (typeof document === "undefined") {
    throw new Error("rasterizeSvgToImage requer DOM (browser).");
  }

  const blob = toSvgBlob(input);
  const objectUrl = URL.createObjectURL(blob);

  try {
    const svgImage = await loadImageFromUrl(objectUrl);
    const { width, height } = resolveRasterSize(svgImage, options?.maxEdge ?? DEFAULT_RASTER_SIZE);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponível para rasterizar SVG.");

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(svgImage, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Falha ao exportar SVG rasterizado."))),
        "image/png",
      );
    });

    const pngUrl = URL.createObjectURL(pngBlob);
    try {
      return await loadImageFromUrl(pngUrl);
    } finally {
      URL.revokeObjectURL(pngUrl);
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
