import type { AsciiRenderer, RenderFrameContext } from "@/features/ascii-interaction/types";
import { GlyphAtlas } from "@/features/ascii-interaction/render/glyph-atlas";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";

/** Renderer Canvas 2D com glyph atlas e dirty rectangles. */
export class CanvasRenderer implements AsciiRenderer {
  private readonly atlas = new GlyphAtlas();
  private displayCtx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private primary = "#9dff9d";
  private dim = "#3d6b3d";
  private accent = "#c8ffc8";
  private config: AsciiInteractionConfig | null = null;
  private fullRedraw = true;

  attach(ctx: CanvasRenderingContext2D, config: AsciiInteractionConfig): void {
    this.displayCtx = ctx;
    this.config = config;
    this.atlas.build(
      config.characterSet,
      config.fontFamily,
      config.fontSize,
      config.cellWidth,
      config.cellHeight,
    );
    this.fullRedraw = true;
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.fullRedraw = true;
  }

  setColors(primary: string, dim: string, accent: string): void {
    this.primary = primary;
    this.dim = dim;
    this.accent = accent;
  }

  requestFullRedraw(): void {
    this.fullRedraw = true;
  }

  renderFrame(frame: RenderFrameContext): void {
    const ctx = this.displayCtx;
    if (!ctx || !this.atlas.isReady()) return;

    const { grid, dirtyIndices, dirtyCount, opacity } = frame;
    const pad = 6;

    if (this.fullRedraw) {
      ctx.clearRect(0, 0, this.width, this.height);
      for (let i = 0; i < grid.count; i += 1) {
        this.drawCell(ctx, grid, i, opacity);
      }
      this.fullRedraw = false;
      grid.clearDirty();
      return;
    }

    for (let d = 0; d < dirtyCount; d += 1) {
      const i = dirtyIndices[d]!;
      const x = grid.getPosX(i);
      const y = grid.getPosY(i);
      const ox = grid.originX[i]!;
      const oy = grid.originY[i]!;
      const minX = Math.min(x, ox) - pad;
      const minY = Math.min(y, oy) - pad;
      const w = Math.max(x, ox) - minX + pad + 8;
      const h = Math.max(y, oy) - minY + pad + 12;
      ctx.clearRect(minX, minY, w, h);
      this.drawCell(ctx, grid, i, opacity);
    }

    grid.clearDirty();
  }

  private drawCell(
    ctx: CanvasRenderingContext2D,
    grid: import("@/features/ascii-interaction/grid/character-grid").CharacterGrid,
    index: number,
    opacity: number,
  ): void {
    const ch = grid.getGlyphChar(index);
    const rect = this.atlas.getRect(ch);
    if (!rect) return;

    const x = grid.getPosX(index);
    const y = grid.getPosY(index);
    const alpha = grid.alpha[index]! * opacity;
    const intensity = grid.intensity[index]!;

    const color = intensity > 0.55 ? this.accent : intensity > 0.3 ? this.primary : this.dim;
    const drawX = x - rect.w * 0.5;
    const drawY = y - rect.h * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      this.atlas.getSource(),
      rect.x,
      rect.y,
      rect.w,
      rect.h,
      drawX,
      drawY,
      rect.w,
      rect.h,
    );
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(drawX, drawY, rect.w, rect.h);
    ctx.restore();
  }

  destroy(): void {
    this.displayCtx = null;
    this.config = null;
  }
}
