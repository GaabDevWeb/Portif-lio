# Nodes (P6)

Headless node graph — PLATFORM §3.13. UI do editor fica para P7.

## API

```ts
import { createAsciiEngine, createNodeGraphRunner } from "@/features/ascii-engine";

const engine = createAsciiEngine();
const result = await engine.nodes.execute(graph, {
  bindings: { src: { image: buffer } },
});
```

## Portas

`ImageBuffer` | `RgbaFrame[]` | `AsciiMatrix` | `AsciiAnimation` | `Blob`

## Built-ins (16)

ImageSource, Resize, Brightness, Contrast, Gamma, Exposure, Blur, Sharpen, Edge, Threshold, Invert, Dither, CharsetMap, ColorMode, Effect, Export.

Filtros reutilizam `applyImageFilters` / `sampleRgba` / `applyDithering` / charset-mapper do image-pipeline.

## Execução

1. `validateNodeGraph` — ids, portas, tipagem, ciclo (Kahn)
2. Ordem topológica → `execute` por node
3. Memo opcional por hash (params + inputs)

`ProjectDocument.setNodeGraph` serializa `NodeGraph` (`NodeGraphStub` = alias).
