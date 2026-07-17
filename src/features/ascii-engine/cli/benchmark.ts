import {
  DEFAULT_BENCHMARK_CASES,
  type BenchmarkCase,
  type BenchmarkResult,
} from "@/features/ascii-engine/benchmark";
import { convertRgbaFrameToMatrix } from "@/features/ascii-interaction/animation-pipeline/converter/frame-converter";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  mergePipelineOptions,
} from "@/features/ascii-interaction/image-pipeline";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";

export interface CliBenchmarkOptions {
  width?: number;
  cases?: BenchmarkCase[];
}

/** Gradiente sintético RGBA — fixture Node sem DOM/canvas. */
export function createSyntheticRgba(
  width = 64,
  height = 48,
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const t = x / Math.max(1, width - 1);
      const u = y / Math.max(1, height - 1);
      pixels[i] = Math.round(255 * t);
      pixels[i + 1] = Math.round(255 * (1 - t) * u);
      pixels[i + 2] = Math.round(255 * (1 - u));
      pixels[i + 3] = 255;
    }
  }
  return { pixels, width, height };
}

/**
 * Suite de benchmark em Node via pipeline RGBA (sem HTMLImageElement).
 * A suite browser (`runBenchmarkSuite`) continua a exigir imagem DOM.
 */
export async function runNodeBenchmarkSuite(
  options: CliBenchmarkOptions = {},
): Promise<BenchmarkResult[]> {
  const cases = options.cases ?? DEFAULT_BENCHMARK_CASES;
  const base: Partial<ImagePipelineOptions> = { width: options.width ?? 80 };
  const fixture = createSyntheticRgba(96, 64);
  const results: BenchmarkResult[] = [];

  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i]!;
    const opts = mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, {
      ...base,
      ...c.options,
    });
    const start = performance.now();
    const matrix = convertRgbaFrameToMatrix(
      { pixels: fixture.pixels, width: fixture.width, height: fixture.height },
      opts,
    );
    const conversionMs = performance.now() - start;
    results.push({
      caseId: c.id,
      label: c.label,
      benchmark: {
        conversionMs,
        characterCount: matrix.cells.length,
        cols: matrix.cols,
        rows: matrix.rows,
      },
    });
    await new Promise((r) => setTimeout(r, 0));
  }

  return results.sort((a, b) => a.benchmark.conversionMs - b.benchmark.conversionMs);
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

export async function runBenchmark(options: CliBenchmarkOptions = {}): Promise<void> {
  console.log("ascii-engine benchmark (Node RGBA synthetic fixture)");
  console.log(`cases: ${(options.cases ?? DEFAULT_BENCHMARK_CASES).length}  width: ${options.width ?? 80}`);
  console.log("");

  const results = await runNodeBenchmarkSuite(options);

  console.log(
    `${pad("case", 18)} ${pad("label", 28)} ${pad("ms", 8)} ${pad("cols", 6)} ${pad("rows", 6)} chars`,
  );
  console.log("-".repeat(78));
  for (const r of results) {
    const b = r.benchmark;
    console.log(
      `${pad(r.caseId, 18)} ${pad(r.label, 28)} ${pad(b.conversionMs.toFixed(2), 8)} ${pad(String(b.cols), 6)} ${pad(String(b.rows), 6)} ${b.characterCount}`,
    );
  }
  console.log("");
  console.log("Note: browser suite uses HTMLImageElement + canvas sampleImage; CLI uses RGBA path.");
}
