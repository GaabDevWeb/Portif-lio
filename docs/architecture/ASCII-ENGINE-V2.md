# ASCII Engine V2 — Arquitetura (SSOT)

> **Escopo V2:** pipeline de animação GIF → ASCII com playback, export/import `.ascii.zip`, workers e cache.  
> **Coexistência:** `image-pipeline` (estático) permanece intacto; `animation-pipeline` estende o subsistema.

---

## 1. Visão geral

```
GIF Upload
    ↓
Decoder (gif89a via gifuct-js)
    ↓
Frame Extractor (RGBA full frames + delays)
    ↓
Converter (image-pipeline por frame, worker)
    ↓
Frame Cache + Storage
    ↓
Playback / Timeline
    ↓
AsciiInteractionEngine (frame atual como AsciiMatrix)
```

---

## 2. Módulos

```
src/features/ascii-interaction/animation-pipeline/
├── types.ts
├── index.ts
├── decoder/
│   └── gif-decoder.ts
├── frame-extractor/
│   └── frame-extractor.ts
├── converter/
│   └── frame-converter.ts
├── renderer/
│   └── animation-frame-renderer.ts
├── timeline/
│   └── timeline.ts
├── playback/
│   └── playback-controller.ts
├── exporter/
│   └── animation-exporter.ts
├── importer/
│   └── animation-importer.ts
├── workers/
│   ├── worker-protocol.ts
│   ├── conversion.worker.ts
│   └── worker-pool.ts
├── storage/
│   └── animation-storage.ts
├── cache/
│   └── frame-cache.ts
├── state/
│   └── animation-state.ts
├── utilities/
│   ├── timing.ts
│   └── zip.ts
└── pipeline/
    └── animation-pipeline.ts
```

---

## 3. Formato `animation.ascii.zip`

```
animation.ascii.zip
├── manifest.json      # versão, frameCount, cols, rows, fps, loop, charset, pipelineOptions
├── metadata.json      # sourceName, sourceType, convertedAt, frameDelays, totalDurationMs
├── palette.txt        # charset + colorMode
├── README.txt         # formato legível
├── frames/
│   ├── 0000.txt
│   ├── 0001.txt
│   └── ...
├── preview.png        # frame médio ou primeiro
└── thumbnail.png      # downscale
```

---

## 4. Worker protocol

| Mensagem | Direção | Payload |
|----------|---------|---------|
| `convert-batch` | main → worker | frames[], options, batchId |
| `progress` | worker → main | batchId, completed, total |
| `batch-result` | worker → main | batchId, matrices[] |
| `cancel` | main → worker | batchId |

---

## 5. Playback

- Estados: `stopped` | `playing` | `paused`
- FPS configurável (override ou derivado do GIF)
- Loop, scrubber, frame step, tempo total/atual
- Re-render ao alterar `ImagePipelineOptions` (invalida cache + reconversão cancelável)

---

## 6. Performance

- Conversão em Web Worker (RGBA → matrix sem DOM)
- Cache LRU por hash(options + frameIndex)
- Virtualização: só N frames adjacentes em memória quente
- Lazy conversion: frames sob demanda durante playback se conversão incompleta

---

*Versão: 2.0.0 · SSOT para implementação GIF → ASCII Animation*
