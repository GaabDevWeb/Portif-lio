import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiAnimation } from "@/features/ascii-interaction/animation-pipeline/types";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline/types";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  mergePipelineOptions,
  runImagePipeline,
} from "@/features/ascii-interaction/image-pipeline";
import {
  AnimationPipeline,
  DEFAULT_ANIMATION_PIPELINE_OPTIONS,
} from "@/features/ascii-interaction/animation-pipeline";

import { SvgAdapter } from "@/features/ascii-engine/converters/svg-adapter";
import type {
  ConversionProgressInfo,
  ConverterCapability,
  ConverterKind,
  SourceAdapter,
} from "@/features/ascii-engine/converters/types";

export type {
  ConversionProgressInfo,
  ConverterCapability,
  ConverterKind,
  FrameProvider,
  SourceAdapter,
} from "@/features/ascii-engine/converters/types";

export {
  canHandleSvgInput,
  isSvgBlob,
  isSvgFile,
  isSvgMarkup,
  rasterizeSvgToImage,
} from "@/features/ascii-engine/converters/rasterize-svg";
export { SvgAdapter, loadSvgAsImage } from "@/features/ascii-engine/converters/svg-adapter";
export {
  convertBatchStub,
  describeBatchFile,
  type BatchConvertOptions,
  type BatchConvertResult,
  type BatchItemResult,
  type BatchItemStatus,
} from "@/features/ascii-engine/converters/batch-stub";

const STUB_CAPABILITIES: ConverterCapability[] = [
  {
    kind: "video",
    label: "Video",
    status: "stub",
    mimeTypes: ["video/mp4", "video/webm"],
    description: "Estrutura preparada — decoder de vídeo ainda não implementado.",
  },
  {
    kind: "webcam",
    label: "Webcam",
    status: "stub",
    mimeTypes: ["video/x-raw"],
    description: "Estrutura preparada — captura getUserMedia futura.",
  },
  {
    kind: "canvas",
    label: "Canvas",
    status: "stub",
    mimeTypes: [],
    description: "Estrutura preparada — HTMLCanvasElement → ASCII.",
  },
  {
    kind: "clipboard",
    label: "Clipboard",
    status: "stub",
    mimeTypes: ["image/png"],
    description: "Estrutura preparada — paste image já existe na UI de upload.",
  },
  {
    kind: "screen",
    label: "Screen Capture",
    status: "stub",
    mimeTypes: [],
    description: "Estrutura preparada — getDisplayMedia futura.",
  },
  {
    kind: "pdf",
    label: "PDF",
    status: "stub",
    mimeTypes: ["application/pdf"],
    description: "Estrutura preparada — página PDF → raster → ASCII.",
  },
];

class StubAdapter implements SourceAdapter {
  readonly kind: ConverterKind;
  readonly capability: ConverterCapability;

  constructor(capability: ConverterCapability) {
    this.kind = capability.kind;
    this.capability = capability;
  }

  canHandle(): boolean {
    return false;
  }

  async convert(): Promise<{ matrix?: AsciiMatrix; animation?: AsciiAnimation }> {
    throw new Error(`Converter "${this.kind}" ainda não está implementado (stub).`);
  }
}

class ImageAdapter implements SourceAdapter {
  readonly kind = "image" as const;
  readonly capability: ConverterCapability = {
    kind: "image",
    label: "Image",
    status: "ready",
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    description: "PNG/JPG/WEBP → AsciiMatrix via image-pipeline.",
  };

  canHandle(input: unknown): boolean {
    return typeof HTMLImageElement !== "undefined" && input instanceof HTMLImageElement;
  }

  async convert(input: unknown, options: Partial<ImagePipelineOptions>) {
    if (!this.canHandle(input)) throw new Error("ImageAdapter espera HTMLImageElement.");
    const result = runImagePipeline(
      input as HTMLImageElement,
      mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, options),
    );
    return { matrix: result.matrix };
  }
}

class GifAdapter implements SourceAdapter {
  readonly kind = "gif" as const;
  readonly capability: ConverterCapability = {
    kind: "gif",
    label: "GIF",
    status: "ready",
    mimeTypes: ["image/gif"],
    description: "GIF → AsciiAnimation via animation-pipeline + workers.",
  };

  private pipeline = new AnimationPipeline();

  canHandle(input: unknown): boolean {
    return typeof File !== "undefined" && input instanceof File && input.type === "image/gif";
  }

  async convert(
    input: unknown,
    options: Partial<ImagePipelineOptions>,
    onProgress?: (p: ConversionProgressInfo) => void,
  ) {
    if (!this.canHandle(input)) throw new Error("GifAdapter espera File image/gif.");
    const animation = await this.pipeline.convert(
      input as File,
      {
        ...DEFAULT_ANIMATION_PIPELINE_OPTIONS,
        pipeline: mergePipelineOptions(DEFAULT_IMAGE_PIPELINE_OPTIONS, options),
      },
      (p) => {
        onProgress?.({
          completed: p.completed,
          total: p.total,
          percent: p.percent,
        });
      },
    );
    return { animation };
  }

  destroy(): void {
    this.pipeline.destroy();
  }
}

/** Registry central de conversores — mesma pipeline, adapters por formato. */
export class ConverterRegistry {
  private readonly adapters = new Map<ConverterKind, SourceAdapter>();

  constructor() {
    this.register(new ImageAdapter());
    this.register(new GifAdapter());
    this.register(new SvgAdapter());
    for (const cap of STUB_CAPABILITIES) {
      this.register(new StubAdapter(cap));
    }
  }

  register(adapter: SourceAdapter): void {
    this.adapters.set(adapter.kind, adapter);
  }

  get(kind: ConverterKind): SourceAdapter | undefined {
    return this.adapters.get(kind);
  }

  list(): ConverterCapability[] {
    return [...this.adapters.values()].map((a) => a.capability);
  }

  findFor(input: unknown): SourceAdapter | undefined {
    for (const adapter of this.adapters.values()) {
      if (adapter.capability.status === "ready" && adapter.canHandle(input)) return adapter;
    }
    return undefined;
  }
}

export const defaultConverterRegistry = new ConverterRegistry();
