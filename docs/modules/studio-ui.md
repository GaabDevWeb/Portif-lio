# Studio UI (`src/studio`)

## Responsibility

App de referência do ASCII Engine: shell com tabs Convert / Animate / Playground / Engine / Stats / Studio + Gallery.

## Flow

- `/` → `AsciiLab` (Studio)  
- `/gallery` → `GalleryApp`  
- Nav: `StudioChromeNav` (desktop + mobile header)  
- Viewport: `LabViewport` → `WorkspaceCanvas` (never-crop)  
- Painéis consomem SDK (`createAsciiEngine` / módulos `ascii-engine`)

## Deps

- `ascii-engine` (produto)  
- `ascii-interaction` (engine no viewport)  
- Controles partilhados: `studio/ui/controls.tsx`

## Limits

- App Next.js — não é package publicável  
- Sliders locais ainda em `ControlPanel`, `ImageConverterPanel`, `AnimationConverterPanel` (dívida vs `ui/controls`)  
- ROOT OS / portfolio removidos (W0)

## Extension

Novos painéis em `studio/panels/` ou tabs em `AsciiLab`. Gallery actions → Studio via query (`/?gallery=&action=edit`).
