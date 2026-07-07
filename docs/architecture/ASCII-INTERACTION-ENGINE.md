# AsciiInteractionEngine — Arquitetura

> **Filosofia:** diretor de arte, não engenheiro de partículas.  
> A engine não reage ao mouse — reage a **campos de influência**.  
> A física não sabe quem gerou o campo.

---

## 1. Mudança de paradigma

### Antes (engenharia)

```
Mouse → Campo → Caracteres → Renderer
```

O cursor é o centro do sistema. Tudo acopla ao input.

### Depois (direção de arte)

```
Influencers → Influence Layer → Physics → Character Evolution → Renderer
                      ↑
              SurfaceState (modula comportamento global)
```

A diferença não é cosmética:

| Antes | Depois |
|-------|--------|
| Mouse como origem | Eventos como origem |
| Física conhece a fonte | Física só vê campos somados |
| Hero-only | Site-wide |
| Regras por feature | Estados + campos reutilizáveis |

---

## 2. Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  INFLUENCERS (fontes)                                       │
│  Mouse · Scroll · Audio · Terminal · Hover · Idle · …       │
└──────────────────────────┬──────────────────────────────────┘
                           │ emitField() / registra eventos
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  INFLUENCE LAYER                                            │
│  Acumula campos escalares/vetoriais no grid                 │
│  fieldTotal = Σ fieldA + fieldB + fieldC + …                │
│  Decay · merge · clamp · viewport culling                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ fieldTotal (por célula)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PHYSICS                                                    │
│  Spring · damping · velocity · retorno ao repouso            │
│  Não conhece mouse, beat, scroll — só o campo resultante    │
└──────────────────────────┬──────────────────────────────────┘
                           │ offset, velocity, force
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CHARACTER EVOLUTION                                        │
│  Glifo · densidade · intensidade · evaporação               │
│  Mapeamento monotônico + histerese                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  RENDERER                                                   │
│  Canvas2D (atlas) → WebGL (instancing) quando escalar       │
│  Dirty rects · active set · pooling                         │
└─────────────────────────────────────────────────────────────┘

        SurfaceState ──modula──► parâmetros de todas as camadas
```

---

## 3. Influence Layer

Responsável por transformar **eventos** em **campos**.

Um evento pode vir de qualquer lugar:

| Evento | Campo gerado |
|--------|----------------|
| Mouse passou | Onda radial + rastro |
| Scroll | Direção vertical suave |
| Beat da música | Pulso concêntrico |
| Comando no terminal | Burst no ponto de foco |
| Hover em botão | Micro-perturbação local |
| Idle prolongado | Respiração quase imperceptível |

A física recebe apenas:

```
fieldTotal[x,y] = field_mouse + field_audio + field_scroll + …
```

Nunca recebe `source: "mouse"`.

### Field (primitiva)

```ts
interface InfluenceField {
  id: string;
  x: number;
  y: number;
  radius: number;
  strength: number;
  falloff: FalloffCurve;   // 'gaussian' | 'smoothstep' | 'inverse'
  duration: number;        // ms; Infinity = estático até remoção
  decay: number;           // taxa de evaporação (0–1)
  velocity?: { x: number; y: number }; // para trail direcional
  layer?: number;          // parallax futuro
}
```

### API pública

```ts
engine.emitField({
  x,
  y,
  radius,
  strength,
  falloff,
  duration,
});

engine.removeField(id);
engine.clearFields();
```

Qualquer subsistema do ROOT OS pode perturbar a superfície:

- Hero → mouse
- Terminal → comando executado
- Media player → beat
- Knowledge Graph → nó arrastado
- Transição de seção → dissolve

---

## 4. Influencers

Registram fontes de eventos. Todos escrevem na mesma Influence Layer.

```ts
interface Influencer {
  readonly id: string;
  mount(engine: AsciiInteractionEngine): void;
  unmount(): void;
  update(dt: number): void; // opcional: emite campos por frame
}
```

### Influencers planejados

| Influencer | Fase | Descrição |
|------------|------|-----------|
| `MouseInfluencer` | **Slice 1** | Cursor → campo radial |
| `IdleInfluencer` | Slice 2 | Respiração em `SurfaceState.Idle` |
| `ScrollInfluencer` | Fase 3 | Scroll → campo vertical |
| `AudioInfluencer` | Fase 3 | Beat → pulso |
| `TerminalInfluencer` | Fase 3 | Comando → burst |
| `HoverInfluencer` | Fase 3 | Hover em elementos → micro-campo |

Registro:

```ts
engine.registerInfluencer(new MouseInfluencer({ radius, strength }));
```

A Hero no slice 1 registra apenas `MouseInfluencer`. O resto entra depois.

---

## 5. SurfaceState

Modula o comportamento **global** da superfície. Evita regras espalhadas.

```ts
enum SurfaceState {
  Idle,            // respiração quase imperceptível
  Hover,           // maior sensibilidade ao cursor
  Disturbed,       // pós-interação intensa
  AudioReactive,   // trail pulsa no ritmo
  ScrollReactive,  // leve direção vertical
  Dissolving,      // transições entre seções
}
```

### Como modula

Cada estado aplica um **preset de parâmetros** (não lógica nova):

```ts
interface SurfaceStatePreset {
  physicsDamping: number;
  springStiffness: number;
  fieldSensitivity: number;
  trailDecay: number;
  evolutionRate: number;
  idleBreathAmplitude: number;
}
```

Transições entre estados usam easing físico (não snap).

```ts
engine.setSurfaceState(SurfaceState.Hover);
```

---

## 6. Módulos

```
src/features/ascii-interaction/
├── index.ts
├── AsciiInteractionEngine.tsx      # React wrapper; Hero usa só isto
├── config.ts                       # defaults + merge com props
├── types.ts                        # Field, SurfaceState, Config
│
├── influence/
│   ├── influence-layer.ts          # acumulação + decay de campos
│   ├── field.ts                    # primitiva + falloff
│   └── influencers/
│       ├── influencer.ts           # interface base
│       └── mouse-influencer.ts     # slice 1
│
├── physics/
│   ├── physics-system.ts           # spring + damping + integração
│   └── timestep.ts                 # accumulator fixo (Gaffer)
│
├── grid/
│   ├── character-grid.ts           # estado por célula (typed arrays)
│   └── ascii-source.ts             # parse hero-ascii / imagem
│
├── evolution/
│   └── character-evolution.ts      # glifo · densidade · histerese
│
├── surface/
│   └── surface-state.ts            # enum + presets + transições
│
├── render/
│   ├── renderer.ts                 # interface
│   └── canvas2d-atlas-renderer.ts  # slice 1
│
└── loop/
    └── frame-loop.ts               # rAF + maxFPS + reduced motion
```

**Nota:** `src/features/ascii/` existente é o **ASCIIEngine** do terminal (boxes, banners, tabelas).  
`ascii-interaction/` é engine visual independente. Nomes distintos de propósito.

---

## 7. Character Grid — estado por célula

```ts
interface CellState {
  // Geometria
  originX: number;
  originY: number;
  layer: number;

  // Física
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;

  // Visual
  baseChar: string;      // da arte estática
  currentChar: string;   // após evolução
  density: number;       // 0–1
  intensity: number;     // 0–1
  alpha: number;

  // Meta
  age: number;
  dirty: boolean;
}
```

Armazenamento preferencial: `Float32Array` / `Uint16Array` contíguos (sem GC por frame).

---

## 8. Configuração

Tudo configurável. Nada hardcoded para Hero.

```ts
interface AsciiInteractionConfig {
  // Grid
  maxCharacters: number;
  cellWidth: number;
  cellHeight: number;
  layerCount: number;

  // Influence
  defaultFalloff: FalloffCurve;
  maxActiveFields: number;

  // Physics
  radius: number;
  strength: number;
  damping: number;
  spring: number;

  // Trail (fase 2)
  trailLength: number;
  trailLifetime: number;

  // Evolution (fase 2)
  characterSet: string;

  // Loop
  maxFPS: number;
  fixedTimestep: number;

  // Responsive
  breakpoints: {
    mobile: Partial<AsciiInteractionConfig>;
    tablet: Partial<AsciiInteractionConfig>;
  };
}
```

---

## 9. Reduced Motion

`prefers-reduced-motion: reduce`:

- Remove física e trail
- Mantém fade leve de glifos
- `SurfaceState` forçado para `Idle` com `idleBreathAmplitude` mínimo
- Influencers de alta energia (Audio, Scroll) não montam

---

## 10. Roadmap — Vertical Slice primeiro

### Slice 1 — Validar beleza (AGORA)

**Objetivo:** provar que atravessar a superfície ASCII é elegante.

| Incluir | Excluir |
|---------|---------|
| Hero + arte `hero-ascii` | Música / áudio |
| `MouseInfluencer` | Terminal |
| Influence Layer (1 campo) | Scroll |
| Physics (spring + damping) | Hover |
| Renderer Canvas2D atlas | Múltiplas camadas |
| `SurfaceState.Idle` + `Hover` | Smoke trail completo |
| `prefers-reduced-motion` | Parallax |

**Critério de aceite (PO):**
- Sensação de “fumaça de caracteres”, não cursor trail
- Retorno físico lento ao repouso
- 60fps em desktop (grid hero ~80×80)
- Zero acoplamento Hero ↔ internals

### Fase 2 — Profundidade visual

- Smoke trail (campo que evapora, não partículas)
- Character evolution (densidade por velocidade/força)
- `SurfaceState.Disturbed`
- Parallax leve (layerCount: 3)

### Fase 3 — Site-wide

- `emitField` exposto publicamente
- `AudioInfluencer`, `ScrollInfluencer`, `TerminalInfluencer`, `HoverInfluencer`
- `SurfaceState.AudioReactive`, `ScrollReactive`
- Integração Knowledge Graph, Media, transições

### Fase 4 — Escala

- WebGL instanced renderer
- OffscreenCanvas / worker (se profiling exigir)
- Spatial active-set otimizado

---

## 11. Integração Hero (slice 1)

```tsx
// hero-section.tsx — único contrato
<AsciiInteractionEngine
  source={heroAsciiArt}
  config={heroInteractionConfig}
  className="absolute inset-0 pointer-events-none"
/>
```

A Hero não importa `MouseInfluencer`, `Physics`, nem `InfluenceLayer`.  
A engine monta internamente o que o slice exige.

---

## 12. Decisões técnicas (resumo)

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Renderer slice 1 | Canvas2D + glyph atlas | Simplicidade; provar feel |
| Particionamento | Grid local (não quadtree) | Células já são grid uniforme |
| Timestep | Fixo + accumulator | Estabilidade spring (Gaffer) |
| Trail | Campo escalar que decai | Fumaça, não partículas |
| Arquitetura input | Influence Layer + emitField | Reutilização site-wide |
| Comportamento global | SurfaceState presets | Sem regras espalhadas |

---

*Versão: 0.2 — Influence-first architecture*  
*Última atualização: 2026-07-07*
