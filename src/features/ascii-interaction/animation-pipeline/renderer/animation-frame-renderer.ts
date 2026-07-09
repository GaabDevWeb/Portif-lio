import type { AnimationPipeline } from "@/features/ascii-interaction/animation-pipeline/pipeline/animation-pipeline";
import type {
  AnimationPipelineOptions,
  AsciiAnimationFrame,
} from "@/features/ascii-interaction/animation-pipeline/types";

/**
 * Renderer de frame único — resolve ASCII a partir do cache ou lazy conversion.
 * Desacoplado da UI; consumido pelo lab e futuros players.
 */
export class AnimationFrameRenderer {
  constructor(private readonly pipeline: AnimationPipeline) {}

  resolveFrame(
    frameIndex: number,
    options: AnimationPipelineOptions,
  ): AsciiAnimationFrame | null {
    const lazy = this.pipeline.getFrame(frameIndex, options);
    if (lazy) return lazy;

    const animation = this.pipeline.getAnimation();
    if (!animation) return null;
    return animation.frames[frameIndex] ?? null;
  }

  isFrameReady(frameIndex: number, options: AnimationPipelineOptions): boolean {
    return this.pipeline.isFrameReady(frameIndex, options);
  }

  get conversionComplete(): boolean {
    return this.pipeline.isConversionComplete();
  }
}
