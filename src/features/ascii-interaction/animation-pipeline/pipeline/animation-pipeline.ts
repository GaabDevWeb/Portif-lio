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
import { convertRgbaFramesTemporal } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalConverter";
import type {
  AnimationPipelineOptions,
  AsciiAnimation,
  AsciiAnimationFrame,
  ConversionProgress,
  DecodedGif,
  RgbaFrame,
  TemporalDebugBuffers,
  TemporalMetrics,
} from "@/features/ascii-interaction/animation-pipeline/types";
import { createEmptyTemporalMetrics } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";
import { delaysFromFps } from "@/features/ascii-interaction/animation-pipeline/utilities/timing";

const CHUNK_SIZE = 8;

/** Throttle progress callbacks to ~8 Hz to avoid React setState storms. */
function createThrottledProgress(
  onProgress?: (p: ConversionProgress) => void,
  intervalMs = 125,
): (p: ConversionProgress) => void {
  if (!onProgress) return () => undefined;
  let last = 0;
  let pending: ConversionProgress | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (p: ConversionProgress) => {
    const now = Date.now();
    if (p.percent >= 100 || p.cancelled || now - last >= intervalMs) {
      last = now;
      pending = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      onProgress(p);
      return;
    }
    pending = p;
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        if (pending) {
          last = Date.now();
          onProgress(pending);
          pending = null;
        }
      }, intervalMs - (now - last));
    }
  };
}

function optionsCacheHash(options: AnimationPipelineOptions): string {
  return hashPipelineOptions({
    pipeline: options.pipeline,
    temporal: options.temporal,
  });
}

export class AnimationPipeline {
  private decoded: DecodedGif | null = null;
  private rgbaSource: RgbaFrame[] = [];
  private animation: AsciiAnimation | null = null;
  private readonly cache = new FrameCache(128);
  private workerPool: ConversionWorkerPool;
  private cancelled = false;
  private conversionComplete = false;
  private conversionGeneration = 0;
  private optionsHash = "";
  private lastTemporalMetrics: TemporalMetrics = createEmptyTemporalMetrics();
  private lastTemporalDebug: TemporalDebugBuffers = {
    motionMap: null,
    temporalBuffer: null,
    cols: 0,
    rows: 0,
  };
  private motionPreviews: {
    cols: number;
    rows: number;
    frames: Uint8Array[];
    buffers: Uint8Array[];
  } = { cols: 0, rows: 0, frames: [], buffers: [] };

  constructor(workerCount = 2) {
    this.workerPool = new ConversionWorkerPool({ poolSize: workerCount });
  }

  private ensurePoolSize(workerCount: number): void {
    const n = Math.max(1, workerCount);
    if (this.workerPool.size === n) return;
    this.workerPool.destroy();
    this.workerPool = new ConversionWorkerPool({ poolSize: n });
  }

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

  getTemporalMetrics(): TemporalMetrics {
    return { ...this.lastTemporalMetrics };
  }

  getTemporalDebug(): TemporalDebugBuffers {
    return this.lastTemporalDebug;
  }

  getMotionPreviews(): {
    cols: number;
    rows: number;
    frames: Uint8Array[];
    buffers: Uint8Array[];
  } {
    return this.motionPreviews;
  }

  isConversionComplete(): boolean {
    return this.conversionComplete;
  }

  isFrameReady(frameIndex: number, options: AnimationPipelineOptions): boolean {
    const hash = optionsCacheHash(options);
    return this.cache.has(frameIndex, hash);
  }

  cancel(): void {
    this.cancelled = true;
    this.conversionGeneration += 1;
    this.workerPool.cancel();
  }

  /**
   * Lazy conversion — um frame sob demanda.
   * Com temporal.enabled NÃO re-converte frame isolado (quebraria coerência).
   */
  getFrame(frameIndex: number, options: AnimationPipelineOptions): AsciiAnimationFrame | null {
    const hash = optionsCacheHash(options);
    this.cache.pruneAround(frameIndex, options.maxFramesInMemory, hash);

    const cached = this.cache.get(frameIndex, hash);
    if (cached) return cached;

    if (options.temporal?.enabled) {
      return this.animation?.frames[frameIndex] ?? null;
    }

    const rgba = this.ensureRgba()[frameIndex];
    if (!rgba) return null;

    const frame = convertRgbaFrameToAnimationFrame(rgba, options.pipeline);
    this.cache.set(frameIndex, hash, frame);
    return frame;
  }

  private ensureRgba(): RgbaFrame[] {
    if (this.rgbaSource.length > 0) return this.rgbaSource;
    if (!this.decoded) return [];
    this.rgbaSource = extractFrames(this.decoded);
    return this.rgbaSource;
  }

  async convert(
    file: File,
    options: AnimationPipelineOptions,
    onProgress?: (p: ConversionProgress) => void,
  ): Promise<AsciiAnimation> {
    this.cancelled = false;
    this.conversionComplete = false;
    const generation = ++this.conversionGeneration;
    const report = createThrottledProgress(onProgress);

    this.ensurePoolSize(options.workerCount);

    const decoded = this.decoded ?? (await this.loadGif(file));
    const rgbaFrames = this.ensureRgba();

    const frameDelays =
      options.targetFps > 0
        ? delaysFromFps(rgbaFrames.length, options.targetFps)
        : rgbaFrames.map((f) => f.delayMs);

    const hash = optionsCacheHash(options);
    this.optionsHash = hash;
    this.cache.clear();

    const total = rgbaFrames.length;
    const sparse: AsciiAnimationFrame[] = [];

    const shell: AsciiAnimation = {
      width: decoded.width,
      height: decoded.height,
      frameCount: total,
      frames: sparse,
      fps: options.targetFps > 0 ? options.targetFps : 0,
      loop: options.loop,
      frameDelays,
      totalDurationMs: frameDelays.reduce((a, b) => a + b, 0),
      pipelineOptions: options.pipeline,
      sourceName: file.name,
    };
    this.animation = shell;

    if (options.temporal?.enabled) {
      // Temporal path — sequential only (workers would break state).
      const { frames: converted, metrics, converter } = await convertRgbaFramesTemporal(
        rgbaFrames,
        options.pipeline,
        options.temporal,
        (completed, tot) => {
          report({
            completed,
            total: tot,
            percent: (completed / tot) * 100,
            currentFrame: completed,
            cancelled: false,
          });
        },
        () => this.cancelled || generation !== this.conversionGeneration,
      );

      if (this.cancelled || generation !== this.conversionGeneration) {
        throw new Error("Conversão cancelada.");
      }

      for (const frame of converted) {
        this.cache.set(frame.index, hash, frame);
        sparse[frame.index] = frame;
      }
      this.lastTemporalMetrics = metrics;
      this.lastTemporalDebug = converter.getDebug();
      this.motionPreviews = converter.getAllMotionPreviews();
      shell.frames = sparse
        .filter((f): f is AsciiAnimationFrame => f != null)
        .sort((a, b) => a.index - b.index);
      this.animation = shell;
      this.conversionComplete = true;
      this.rgbaSource = [];

      report({
        completed: total,
        total,
        percent: 100,
        currentFrame: total - 1,
        cancelled: false,
      });
      return shell;
    }

    this.lastTemporalMetrics = createEmptyTemporalMetrics();
    this.lastTemporalDebug = { motionMap: null, temporalBuffer: null, cols: 0, rows: 0 };
    this.motionPreviews = { cols: 0, rows: 0, frames: [], buffers: [] };

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
            report({
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
            report({
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
    this.rgbaSource = [];

    report({
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
