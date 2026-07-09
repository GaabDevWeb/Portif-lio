# Plugins

## PluginHost (P9)

Same-origin only (fase 1 — sem iframe/worker sandbox).

```ts
import {
  createAsciiEngine,
  charsetPackManifest,
  charsetPackModule,
} from "@/features/ascii-engine";

const engine = createAsciiEngine();
await engine.plugins.load(charsetPackManifest, charsetPackModule);
engine.plugins.charsets.get("braille-dense");
```

## Manifest

`PluginManifest` declara `contributes` (charsets, themes, converters, …).  
O host regista contribuições declarativas do `PluginModule` e chama `activate` opcional.

## Example

`examples/charset-pack.ts` — shade-blocks, braille-dense, geometric, dots-extra.
