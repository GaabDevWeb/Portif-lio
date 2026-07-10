# Plugins

## Responsibility

`PluginHost` same-origin: packs de charset/theme sem sandbox iframe.

## Flow

Register pack → host aplica charset/theme registries → Studio `PluginsPanel`.

## Deps

`ascii-engine/plugins` (+ `examples/`); themes/charset registries

## Limits

Sem sandbox iframe/worker. Sem marketplace. Same-origin only.

## Extension

Novo pack de exemplo; futuro sandbox = path additive no host.
