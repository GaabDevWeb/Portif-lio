# Document

`ProjectDocument` — SSOT de sessão / ficheiro (PLATFORM §2.3).

## API
- `ProjectDocument.create()` / `fromJSON()` / `fromEditor()`
- `toJSON()` → `ProjectDocumentData` v3.0
- `editor: EditorDocument` (layers, selection, history)
- stubs: `timeline`, `nodeGraph`, `assets`, `animation`

## Storage
Ver `storage/` — IndexedDB `ProjectStore` + `*.ascii-project.zip`.
