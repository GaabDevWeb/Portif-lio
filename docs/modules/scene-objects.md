# Scene objects (shapes / text / stamp)

## Responsibility

Builders e helpers para criar entidades editáveis (não bake imediato no EditorDocument).

## Flow

- `shapes.ts` → ShapeObject (line/rect/round-rect/circle/ellipse/polygon/arrow)
- `text.ts` → TextObject (`plain` ready; `figlet-stub` documentado)
- `stamp.ts` → StampLibrary + ReferenceObject com `matrix` embutida (+ opcional ImageObject)

## Deps

`SceneDocument`, compositor para extract de região composta.

## Limits

- FIGlet completo experimental / stub.
- Stamp library é sessão em memória (não no ZIP ainda).
- Reference sem matrix = não aparece no compose.

## Extension

Novos shape kinds em `ShapeKind` + `rasterizeShape`; fonts via `TEXT_FONT_MODES`.
