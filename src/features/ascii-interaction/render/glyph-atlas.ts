/** Região de um glifo no atlas (pixels). */
export interface GlyphRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Atlas de glifos pré-renderizado — evita fillText por célula.
 * Toda renderização usa drawImage a partir do atlas.
 */
export class GlyphAtlas {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private readonly map = new Map<string, GlyphRect>();
  private cellW = 0;
  private cellH = 0;
  private ready = false;

  constructor() {
    if (typeof OffscreenCanvas !== "undefined") {
      this.canvas = new OffscreenCanvas(1, 1);
      this.ctx = this.canvas.getContext("2d")!;
    } else {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d")!;
    }
  }

  build(
    charset: string,
    fontFamily: string,
    fontSize: number,
    cellWidth: number,
    cellHeight: number,
  ): void {
    const unique = [...new Set(charset.split(""))];
    const cols = Math.ceil(Math.sqrt(unique.length));
    const rows = Math.ceil(unique.length / cols);

    this.cellW = cellWidth + 2;
    this.cellH = cellHeight + 2;

    const width = cols * this.cellW;
    const height = rows * this.cellH;

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.fillStyle = "transparent";
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#ffffff";

    this.map.clear();

    for (let i = 0; i < unique.length; i += 1) {
      const ch = unique[i]!;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * this.cellW;
      const y = row * this.cellH;

      this.ctx.fillText(ch, x + this.cellW * 0.5, y + this.cellH * 0.5);

      this.map.set(ch, { x, y, w: this.cellW, h: this.cellH });
    }

    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  getSource(): CanvasImageSource {
    return this.canvas as CanvasImageSource;
  }

  getRect(char: string): GlyphRect | undefined {
    return this.map.get(char);
  }

  getCellSize(): { w: number; h: number } {
    return { w: this.cellW, h: this.cellH };
  }
}
