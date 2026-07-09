import type {
  DitheringMode,
  ImagePipelineOptions,
  MappingMode,
  PipelineBenchmark,
} from "@/features/ascii-interaction/image-pipeline/types";
import {
  runImagePipeline,
  IMAGE_CHARSETS,
  mergePipelineOptions,
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
} from "@/features/ascii-interaction/image-pipeline";

export interface BenchmarkCase {
  id: string;
  label: string;
  options: Partial<ImagePipelineOptions>;
}

export interface BenchmarkResult {
  caseId: string;
  label: string;
  benchmark: PipelineBenchmark;
}

export const DEFAULT_BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: "brightness-fs",
    label: "Brightness + Floyd-Steinberg",
    options: { mappingMode: "brightness", dithering: "floyd-steinberg" },
  },
  {
    id: "density-ordered",
    label: "Density + Ordered",
    options: { mappingMode: "density", dithering: "ordered" },
  },
  {
    id: "edge-none",
    label: "Edge + None",
    options: { mappingMode: "edge", dithering: "none" },
  },
  {
    id: "hybrid-atkinson",
    label: "Hybrid + Atkinson",
    options: { mappingMode: "hybrid", dithering: "atkinson" },
  },
  {
    id: "charset-dense",
    label: "Dense charset",
    options: { charset: IMAGE_CHARSETS.dense, dithering: "floyd-steinberg" },
  },
  {
    id: "charset-blocks",
    label: "Blocks charset",
    options: { charset: IMAGE_CHARSETS.blocks, dithering: "bayer" },
  },
];

/** Corre casos de benchmark no main thread (fixture HTMLImageElement). */
export async function runBenchmarkSuite(
  image: HTMLImageElement,
  cases: BenchmarkCase[] = DEFAULT_BENCHMARK_CASES,
  base: Partial<ImagePipelineOptions> = { width: 80 },
  onProgress?: (completed: number, total: number) => void,
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];
  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i]!;
    const result = runImagePipeline(
      image,
      mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, { ...base, ...c.options }),
    );
    results.push({ caseId: c.id, label: c.label, benchmark: result.benchmark });
    onProgress?.(i + 1, cases.length);
    await new Promise((r) => setTimeout(r, 0));
  }
  return results.sort((a, b) => a.benchmark.conversionMs - b.benchmark.conversionMs);
}

export type { MappingMode, DitheringMode };
