# Studio UI (`src/studio`)

## Responsibility

App de referência do ASCII Engine: shell com tabs Convert / Animate / Playground / Engine / Stats / Studio / **Edit** + Gallery.

## Flow

- `/` → `AsciiLab` (Studio)  
- `/gallery` → `GalleryApp`  
- Nav: `StudioChromeNav` (desktop + mobile header)  
- Viewport Convert/Animate: `LabViewport` → `WorkspaceCanvas` (never-crop)  
- Tab **Edit**: `EditWorkspace` → `SceneViewport` + Layers/Inspector/Tools/Libraries  
- Painéis consomem SDK (`createAsciiEngine` / módulos `ascii-engine`)

## Deps

- `ascii-engine` (produto; `scene/`, `brush/`, `tools/`, `libraries/`)  
- `ascii-interaction` (engine no viewport)  
- Controles partilhados: `studio/ui/controls.tsx`

## Limits

- App Next.js — não é package publicável  
- Sliders locais ainda em `ControlPanel`, `ImageConverterPanel`, `AnimationConverterPanel` (dívida vs `ui/controls`)  
- Dual edit model: tab Studio = `EditorDocument` raster; tab Edit = `SceneDocument`  
- ROOT OS / portfolio removidos (W0)

## Extension

Novos painéis em `studio/panels/` ou `studio/scene/`; tabs em `AsciiLab`. Gallery actions → Studio via query (`/?gallery=&action=edit`).
