import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiMatrix, AsciiMatrixCell, ImageSampleBuffer } from "@/features/ascii-interaction/image-pipeline/types";
import {
  applyImageFilters,
  runRgbaPipeline,
} from "@/features/ascii-interaction/image-pipeline/rgba-processor";
import { sobelEdges } from "@/features/ascii-interaction/image-pipeline/image-processor";
import {
  applyAdaptiveLuminance,
  applyCharacterDensity,
} from "@/features/ascii-interaction/image-pipeline/matrix-generator";
import {
  mapLuminanceToCharByDensity,
  resolveCellColor,
} from "@/features/ascii-interaction/image-pipeline/charset-mapper";
import { applyDithering } from "@/features/ascii-interaction/image-pipeline/dithering";
import type { AsciiAnimationFrame, RgbaFrame } from "@/features/ascii-interaction/animation-pipeline/types";
import { detectMotion } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/MotionDetector";
import { applyCharacterPersistence } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/CharacterPersistence";
import { applyTemporalDither } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalDither";
import { smoothTemporal } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/TemporalSmoothing";
import { reduceNoise } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/NoiseReducer";
import { motionSharpen } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/MotionSharpen";
import { reuseStaticRegions } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/RegionReuse";
import { shouldSkipFrame } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/AdaptiveFPS";
import { isKeyframe, KeyframeManager } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/KeyframeManager";
import { applyRoiBias } from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/RegionOfInterest";
import type {
  TemporalDebugBuffers,
  TemporalFrameState,
  TemporalMetrics,
  TemporalPipelineOptions,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";
import {
  createTemporalState,
  DEFAULT_TEMPORAL_OPTIONS,
} from "@/features/ascii-interaction/animation-pipeline/TemporalPipeline/types";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function buildMappingField(
  buffer: ImageSampleBuffer,
  options: ImagePipelineOptions,
): Float32Array {
  const { width, height, luminance } = buffer;
  const field = new Float32Array(luminance);
  const mode = options.mappingMode;
  const edgeEnhance = options.edgeEnhance;

  if (mode === "edge" || mode === "hybrid") {
    const edges = sobelEdges(luminance, width, height);
    for (let i = 0; i < field.length; i += 1) {
      field[i] =
        mode === "edge"
          ? edges[i]!
          : luminance[i]! * (1 - edgeEnhance) + edges[i]! * edgeEnhance;
    }
  }
  if (mode === "density") {
    for (let i = 0; i < field.length; i += 1) field[i] = 1 - luminance[i]!;
  }
  return field;
}

function heapMb(): number | null {
  const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
  if (perf.memory?.usedJSHeapSize) {
    return Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
  }
  return null;
}

interface PreparedFrame {
  rgba: RgbaFrame;
  filtered: ImageSampleBuffer;
  field: Float32Array;
}

/**
 * Sequential temporal converter — must not be parallelized across frames.
 * Pass 1 prepares luminance fields (enables N-1 / N / N+1 smoothing).
 * Pass 2 maps with motion / persistence / dither / reuse.
 */
export class TemporalConverter {
  private state: TemporalFrameState = createTemporalState();
  private readonly keyframes = new KeyframeManager();
  private options: TemporalPipelineOptions;
  private lastDebug: TemporalDebugBuffers = {
    motionMap: null,
    temporalBuffer: null,
    cols: 0,
    rows: 0,
  };
  /** Compact per-frame motion (0|255) for technical preview. */
  private motionPreviews: Uint8Array[] = [];
  private bufferPreviews: Uint8Array[] = [];
  private previewCols = 0;
  private previewRows = 0;

  constructor(options: Partial<TemporalPipelineOptions> = {}) {
    this.options = { ...DEFAULT_TEMPORAL_OPTIONS, ...options };
  }

  reset(options?: Partial<TemporalPipelineOptions>): void {
    if (options) this.options = { ...DEFAULT_TEMPORAL_OPTIONS, ...options };
    this.state = createTemporalState();
    this.keyframes.clear();
    this.lastDebug = { motionMap: null, temporalBuffer: null, cols: 0, rows: 0 };
    this.motionPreviews = [];
    this.bufferPreviews = [];
    this.previewCols = 0;
    this.previewRows = 0;
  }

  getMetrics(): TemporalMetrics {
    return { ...this.state.metrics };
  }

  getDebug(): TemporalDebugBuffers {
    return this.lastDebug;
  }

  getMotionPreview(frameIndex: number): {
    cols: number;
    rows: number;
    motion: Uint8Array;
  } | null {
    const motion = this.motionPreviews[frameIndex];
    if (!motion || !this.previewCols) return null;
    return { cols: this.previewCols, rows: this.previewRows, motion };
  }

  getAllMotionPreviews(): {
    cols: number;
    rows: number;
    frames: Uint8Array[];
    buffers: Uint8Array[];
  } {
    return {
      cols: this.previewCols,
      rows: this.previewRows,
      frames: this.motionPreviews,
      buffers: this.bufferPreviews,
    };
  }

  getKeyframes() {
    return [...this.keyframes.records];
  }

  async convertSequence(
    frames: RgbaFrame[],
    imageOptions: ImagePipelineOptions,
    onProgress?: (completed: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<AsciiAnimationFrame[]> {
    this.reset(this.options);
    const t0 = performance.now();
    const total = frames.length;
    const prepared: PreparedFrame[] = [];

    // Pass 1 — shared image pipeline only (no temporal state yet)
    for (let i = 0; i < frames.length; i += 1) {
      if (shouldCancel?.()) break;
      const rgba = frames[i]!;
      let sampled = runRgbaPipeline(rgba.pixels, rgba.width, rgba.height, imageOptions);
      let filtered = applyImageFilters(sampled, imageOptions);
      let field = buildMappingField(filtered, imageOptions);

      if (this.options.noiseReduction) {
        field = reduceNoise(field, filtered.width, filtered.height, this.options.noiseStrength);
      }
      if (imageOptions.adaptiveMapping) {
        field = applyAdaptiveLuminance(field);
      }
      const bias = imageOptions.characterBias ?? 0;
      if (bias !== 0) {
        for (let j = 0; j < field.length; j += 1) {
          field[j] = clamp01(field[j]! + bias * 0.5);
        }
      }
      if (this.options.roiPriority) {
        field = applyRoiBias(
          field,
          filtered.width,
          filtered.height,
          this.options.roiRadius,
          true,
        );
      }

      prepared.push({ rgba, filtered, field });
      if (i % 3 === 0) await yieldToMain();
    }

    const results: AsciiAnimationFrame[] = [];
    let motionAcc = 0;
    let stabilityAcc = 0;

    // Pass 2 — temporal stages (strictly sequential)
    for (let i = 0; i < prepared.length; i += 1) {
      if (shouldCancel?.()) break;
      const curr = prepared[i]!;
      const prevField = prepared[i - 1]?.field ?? null;
      const nextField = prepared[i + 1]?.field ?? null;

      let field = curr.field;
      if (this.options.temporalSmoothing) {
        field = smoothTemporal(field, prevField, this.options.smoothingStrength, nextField);
      }

      const w = curr.filtered.width;
      const h = curr.filtered.height;

      const motion = this.options.motionDetection
        ? detectMotion(field, this.state.prevLuminance, w, h, this.options.motionThreshold)
        : {
            width: w,
            height: h,
            mask: new Float32Array(w * h).fill(1),
            motionFraction: 1,
          };

      if (this.options.motionSharpen) {
        field = motionSharpen(field, w, h, motion.mask, this.options.motionSharpenAmount);
      }

      if (
        shouldSkipFrame(
          motion.motionFraction,
          this.options.adaptiveSimilarity,
          this.options.adaptiveFps,
        ) &&
        this.state.prevMatrix
      ) {
        const prev = results[results.length - 1]!;
        results.push({
          index: curr.rgba.index,
          matrix: prev.matrix,
          delayMs: curr.rgba.delayMs,
        });
        this.state.metrics.framesSkipped += 1;
        this.state.frameIndex += 1;
        motionAcc += motion.motionFraction;
        stabilityAcc += 1 - motion.motionFraction;
        this.recordMotionPreview(w, h, motion.mask, field);
        this.lastDebug = {
          motionMap: motion,
          temporalBuffer: field,
          cols: w,
          rows: h,
        };
        onProgress?.(i + 1, total);
        if (i % 2 === 0) await yieldToMain();
        continue;
      }

      const charset = applyCharacterDensity(
        imageOptions.charset.length > 1 ? imageOptions.charset : " .",
        imageOptions.characterDensity ?? 1,
      );
      const levels = charset.length;

      let dithered: Float32Array;
      if (this.options.temporalDithering) {
        dithered = applyTemporalDither(field, w, h, motion.mask, levels, true);
      } else {
        dithered = applyDithering(field, w, h, imageOptions.dithering, levels);
      }

      let charIndices: Int16Array | null = null;
      let charsChanged = 0;
      if (this.options.characterPersistence) {
        const persisted = applyCharacterPersistence(
          dithered,
          levels,
          this.state.prevCharIndex,
          this.options.persistenceBand,
        );
        charIndices = persisted.indices;
        charsChanged = persisted.changed;
      }

      let cells: AsciiMatrixCell[] = [];
      for (let row = 0; row < h; row += 1) {
        for (let col = 0; col < w; col += 1) {
          const idx = row * w + col;
          const lum = dithered[idx]!;
          let ch: string;
          if (charIndices) {
            ch = charset[charIndices[idx]!] ?? " ";
          } else {
            ch = mapLuminanceToCharByDensity(lum, charset).char;
          }
          if (ch === " " && lum < 0.05) continue;
          const color = resolveCellColor(
            curr.filtered.r[idx]!,
            curr.filtered.g[idx]!,
            curr.filtered.b[idx]!,
            lum,
            imageOptions.colorMode,
          );
          cells.push({
            char: ch,
            col,
            row,
            luminance: lum,
            r: color.r,
            g: color.g,
            b: color.b,
          });
        }
      }

      let reused = 0;
      if (this.options.regionReuse && this.options.motionDetection) {
        const rr = reuseStaticRegions(cells, this.state.prevMatrix, motion.mask, w);
        cells = rr.cells;
        reused = rr.reused;
      }

      const matrix: AsciiMatrix = { cols: w, rows: h, cells, charset };

      if (!charIndices) {
        charIndices = new Int16Array(w * h);
        charIndices.fill(-1);
        for (const c of cells) {
          const ci = charset.indexOf(c.char);
          charIndices[c.row * w + c.col] = ci >= 0 ? ci : 0;
        }
        charsChanged = cells.length;
      }

      if (
        isKeyframe(
          this.state.frameIndex,
          this.state.lastKeyframe,
          this.options.keyframeInterval,
          motion.motionFraction,
        )
      ) {
        this.keyframes.push(this.state.frameIndex, motion.motionFraction);
        this.state.lastKeyframe = this.state.frameIndex;
      }

      this.state.prevLuminance = new Float32Array(field);
      this.state.prevSmoothed = new Float32Array(field);
      this.state.prevMatrix = matrix;
      this.state.prevCharIndex = charIndices;
      this.state.frameIndex += 1;
      this.state.metrics.blocksReused += reused;
      this.state.metrics.charactersUpdated += charsChanged;
      this.recordMotionPreview(w, h, motion.mask, field);
      this.lastDebug = {
        motionMap: motion,
        temporalBuffer: field,
        cols: w,
        rows: h,
      };

      results.push({
        index: curr.rgba.index,
        matrix,
        delayMs: curr.rgba.delayMs,
      });

      motionAcc += motion.motionFraction;
      stabilityAcc += 1 - motion.motionFraction;
      onProgress?.(i + 1, total);
      if (i % 2 === 0) await yieldToMain();
    }

    const m = this.state.metrics;
    m.frames = results.length;
    m.motionPercent = results.length ? (motionAcc / results.length) * 100 : 0;
    m.temporalStability = results.length ? stabilityAcc / results.length : 1;
    m.processingTimeMs = performance.now() - t0;
    m.peakHeapMb = heapMb();
    this.state.debug = this.lastDebug;
    return results;
  }

  private recordMotionPreview(
    w: number,
    h: number,
    mask: Float32Array,
    field: Float32Array,
  ): void {
    this.previewCols = w;
    this.previewRows = h;
    const packed = new Uint8Array(w * h);
    const buf = new Uint8Array(w * h);
    for (let i = 0; i < packed.length; i += 1) {
      packed[i] = mask[i]! > 0.5 ? 255 : 0;
      buf[i] = Math.round(Math.max(0, Math.min(1, field[i]!)) * 255);
    }
    this.motionPreviews.push(packed);
    this.bufferPreviews.push(buf);
  }
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function convertRgbaFramesTemporal(
  frames: RgbaFrame[],
  imageOptions: ImagePipelineOptions,
  temporal: TemporalPipelineOptions,
  onProgress?: (completed: number, total: number) => void,
  shouldCancel?: () => boolean,
): Promise<{ frames: AsciiAnimationFrame[]; metrics: TemporalMetrics; converter: TemporalConverter }> {
  const converter = new TemporalConverter(temporal);
  const out = await converter.convertSequence(frames, imageOptions, onProgress, shouldCancel);
  return { frames: out, metrics: converter.getMetrics(), converter };
}
