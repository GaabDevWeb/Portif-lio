import { ConversionWorkerPool } from "@/features/ascii-interaction/animation-pipeline/workers/worker-pool";
import { extractFrames } from "@/features/ascii-interaction/animation-pipeline/frame-extractor/frame-extractor";
import { decodeGifFile } from "@/features/ascii-interaction/animation-pipeline/decoder/gif-decoder";
import {
  FrameCache,
  hashPipelineOptions,
} from "@/features/ascii-interaction/animation-pipeline/cache/frame-cache";
import {
  convertRgbaFrameToAnimationFrame,
  convertRgbaFramesBatch,
} from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";
import type {
  AnimationPipelineOptions,
  AsciiAnimation,
  AsciiAnimationFrame,
  ConversionProgress,
  DecodedGif,
  RgbaFrame,
} from "@/features/ascii-interaction/animation-pipeline/types";
import { delaysFromFps } from "@/features/ascii-interaction/animation-pipeline/utilities/timing";

const CHUNK_SIZE = 8;

export class AnimationPipeline {
  private decoded: DecodedGif | null = null;
  private rgbaSource: RgbaFrame[] = [];
  private animation: AsciiAnimation | null = null;
  private readonly cache = new FrameCache(128);
  private readonly workerPool = new ConversionWorkerPool();
  private cancelled = false;
  private conversionComplete = false;
  private conversionGeneration = 0;
  private optionsHash = "";

  async loadGif(file: File): Promise<DecodedGif> {
    this.decoded = await decodeGifFile(file);
    this.rgbaSource = extractFrames(this.decoded);
    this.animation = null;
    this.conversionComplete = false;
    this.cache.clear();
    return this.decoded;
  }

  getDecoded(): DecodedGif | null {
    return this.decoded;
  }

  getAnimation(): AsciiAnimation | null {
    return this.animation;
  }

  isConversionComplete(): boolean {
    return this.conversionComplete;
  }

  isFrameReady(frameIndex: number, options: AnimationPipelineOptions): boolean {
    const hash = hashPipelineOptions(options.pipeline);
    return this.cache.has(frameIndex, hash);
  }

  cancel(): void {
    this.cancelled = true;
    this.conversionGeneration += 1;
    this.workerPool.cancel();
  }

  /** Lazy conversion — um frame sob demanda (playback durante conversão). */
  getFrame(frameIndex: number, options: AnimationPipelineOptions): AsciiAnimationFrame | null {
    const hash = hashPipelineOptions(options.pipeline);
    this.cache.pruneAround(frameIndex, options.maxFramesInMemory, hash);

    const cached = this.cache.get(frameIndex, hash);
    if (cached) return cached;

    const rgba = this.rgbaSource[frameIndex];
    if (!rgba) return null;

    const frame = convertRgbaFrameToAnimationFrame(rgba, options.pipeline);
    this.cache.set(frameIndex, hash, frame);
    return frame;
  }

  async convert(
    file: File,
    options: AnimationPipelineOptions,
    onProgress?: (p: ConversionProgress) => void,
  ): Promise<AsciiAnimation> {
    this.cancelled = false;
    this.conversionComplete = false;
    const generation = ++this.conversionGeneration;

    const decoded = this.decoded ?? (await this.loadGif(file));
    const rgbaFrames = this.rgbaSource.length > 0 ? this.rgbaSource : extractFrames(decoded);
    this.rgbaSource = rgbaFrames;

    const frameDelays =
      options.targetFps > 0
        ? delaysFromFps(rgbaFrames.length, options.targetFps)
        : rgbaFrames.map((f) => f.delayMs);

    const hash = hashPipelineOptions(options.pipeline);
    this.optionsHash = hash;
    this.cache.clear();

    const total = rgbaFrames.length;
    const sparse: AsciiAnimationFrame[] = [];

    const shell: AsciiAnimation = {
      width: decoded.width,
      height: decoded.height,
      frameCount: total,
      frames: sparse,
      fps: options.targetFps,
      loop: options.loop,
      frameDelays,
      totalDurationMs: frameDelays.reduce((a, b) => a + b, 0),
      pipelineOptions: options.pipeline,
      sourceName: file.name,
    };
    this.animation = shell;

    for (let offset = 0; offset < total; offset += CHUNK_SIZE) {
      if (this.cancelled || generation !== this.conversionGeneration) {
        throw new Error("Conversão cancelada.");
      }

      const chunk = rgbaFrames.slice(offset, Math.min(offset + CHUNK_SIZE, total));
      let converted: AsciiAnimationFrame[];

      try {
        converted = await this.workerPool.convertBatch(
          chunk,
          options.pipeline,
          (localCompleted) => {
            onProgress?.({
              completed: offset + localCompleted,
              total,
              percent: ((offset + localCompleted) / total) * 100,
              currentFrame: offset + localCompleted,
              cancelled: false,
            });
          },
        );
      } catch {
        converted = convertRgbaFramesBatch(
          chunk,
          options.pipeline,
          (localCompleted) => {
            onProgress?.({
              completed: offset + localCompleted,
              total,
              percent: ((offset + localCompleted) / total) * 100,
              currentFrame: offset + localCompleted,
              cancelled: false,
            });
          },
          () => this.cancelled || generation !== this.conversionGeneration,
        );
      }

      if (this.cancelled || generation !== this.conversionGeneration) {
        throw new Error("Conversão cancelada.");
      }

      for (const frame of converted) {
        this.cache.set(frame.index, hash, frame);
        sparse[frame.index] = frame;
      }

      shell.frames = sparse.filter((f): f is AsciiAnimationFrame => f != null);
    }

    shell.frames = sparse
      .filter((f): f is AsciiAnimationFrame => f != null)
      .sort((a, b) => a.index - b.index);

    this.animation = shell;
    this.conversionComplete = true;

    onProgress?.({
      completed: total,
      total,
      percent: 100,
      currentFrame: total - 1,
      cancelled: false,
    });

    return shell;
  }

  destroy(): void {
    this.cancel();
    this.workerPool.destroy();
    this.cache.clear();
    this.rgbaSource = [];
    this.decoded = null;
    this.animation = null;
  }
}
