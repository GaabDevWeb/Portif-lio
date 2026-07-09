# ASCII Engine V2 — Arquitetura (SSOT)

> **Escopo V2:** pipeline de animação GIF → ASCII com playback, export/import `.ascii.zip`, workers e cache.  
> **Escopo V2.1:** refinamentos de UX no lab — Export GIF, Interactive Cursor, resolução original, Copy ASCII, Workspace result-first.  
> **Coexistência:** `image-pipeline` (estático) permanece intacto; `animation-pipeline` estende o subsistema. O lab de física (`engine`) coexiste com tabs `image` e `gif`.

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
│   ├── animation-exporter.ts      # .ascii.zip
│   ├── gif-exporter.ts             # GIF animado (V2.1)
│   └── txt-sequence-exporter.ts    # sequência TXT
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

Lab UI (V2.1):

```
src/labs/ascii/
├── AsciiLab.tsx                 # tabs: engine | image | gif
├── LabInteractiveCursorToggle.tsx
├── LabMobileHeader.tsx
├── workspace/                   # canvas result-first, zoom, pan, focus, original
├── image/                       # Image → ASCII converter UI
└── animation/                   # GIF → ASCII converter UI + timeline
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
├── preview.png        # frame médio ou primeiro (resolução da animação)
└── thumbnail.png      # downscale (apenas miniatura; não é export principal)
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
- Export GIF assíncrono com yield ao main thread + progresso + cancelamento

---

## 7. V2.1 — Export GIF

Menu de exportação de animação:

- **ASCII ZIP** — formato proprietário (secção 3)
- **GIF** — `gif-exporter.ts` via `gifenc`; mantém FPS, frame count, loop, proporção, transparência quando suportada; não altera a animação em memória
- **TXT Sequence** — sequência de frames em texto

Fluxo: ASCII Animation → render frames → encoder GIF → download. Progresso na UI; sem travar o main thread.

---

## 8. V2.1 — Interactive Cursor

- Controlo no lab: `Interactive Cursor` → `AsciiInteractionConfig.enableInteraction`
- `false`: sem física, deslocamento ou efeito do mouse; arte estática (`settleMotion`)
- `true`: comportamento V2 inalterado
- Estado em memória da sessão (enquanto a página estiver aberta); não persiste em `localStorage`
- `LabViewport` passa `interactive={config.enableInteraction}` ao wrapper React

---

## 9. V2.1 — Resolução original

Exports de imagem e GIF usam a geometria da fonte:

- Imagem: `PipelineResult.sourceWidth` / `sourceHeight` → PNG/HTML/SVG
- GIF: `animation.width` / `animation.height` por frame
- Proibido resize, compressão, crop ou padding no export principal
- Única transformação permitida: conversão visual para ASCII
- `thumbnail.png` no ZIP pode downscale (é miniatura, não export principal)

---

## 10. V2.1 — Copy ASCII

- Botão **Copy ASCII** no conversor de imagem
- `copyAsciiToClipboard` (Clipboard API); preserva quebras, espaços e caracteres sem alteração
- Feedback: `✓ Copied!` ~2s; mensagem amigável se API indisponível

---

## 11. V2.1 — Workspace (resultado em foco)

Princípio: o ASCII é o elemento central; o original é referência opcional.

| Controlo | Comportamento |
|----------|---------------|
| Default | Só ASCII (`showOriginal: false`) |
| Mostrar original | Split \| Overlay (segurar) \| Quick Peek (Space) |
| Focus Mode | Esconde painéis; maximiza renderer; toolbar compacta |
| Zoom | Fit, 100%, 200%, 400%, 800% + Ctrl/Cmd+Scroll |
| Pan | Arrastar quando ampliado (não altera resolução real) |
| Mobile | Header + drawer/sheet para painéis |
| GIF | Vista principal = ASCII animado; original só sob pedido |

Tabs do lab: `engine` (física) \| `image` \| `gif`.

---

*Versão: 2.1.0 · SSOT para GIF → ASCII Animation + refinamentos de UX do lab*
