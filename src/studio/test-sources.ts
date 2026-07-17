import { heroAsciiArt } from "@/studio/fixtures/hero-ascii";

export interface AsciiTestScenario {
  id: string;
  label: string;
  description: string;
  getSource: (stressMultiplier?: number) => string;
}

function tileSource(source: string, multiplier: number): string {
  if (multiplier <= 1) return source;

  const lines = source.trimEnd().split("\n");
  const cols = Math.max(1, ...lines.map((l) => l.length));
  const padded = lines.map((l) => l.padEnd(cols, " "));
  const rows = padded.length;

  const gridCols = Math.ceil(Math.sqrt(multiplier));
  const gridRows = Math.ceil(multiplier / gridCols);

  const out: string[] = [];
  for (let gr = 0; gr < gridRows; gr += 1) {
    for (let r = 0; r < rows; r += 1) {
      let line = "";
      for (let gc = 0; gc < gridCols; gc += 1) {
        const idx = gr * gridCols + gc;
        if (idx >= multiplier) break;
        line += padded[r];
      }
      out.push(line);
    }
  }
  return out.join("\n");
}

function generateDenseAscii(cols: number, rows: number): string {
  const chars = ".:;=-+*#%@█";
  const lines: string[] = [];
  for (let y = 0; y < rows; y += 1) {
    let line = "";
    for (let x = 0; x < cols; x += 1) {
      const n = Math.sin(x * 0.35 + y * 0.22) * Math.cos(y * 0.18 - x * 0.12);
      const idx = Math.floor(((n + 1) * 0.5) * (chars.length - 1));
      line += chars[idx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

function generateSparseAscii(cols: number, rows: number): string {
  const lines: string[] = [];
  for (let y = 0; y < rows; y += 1) {
    let line = "";
    for (let x = 0; x < cols; x += 1) {
      const wave = Math.sin(x * 0.4) * Math.cos(y * 0.3);
      line += wave > 0.65 ? (wave > 0.85 ? "@" : "+") : " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

const TEXT_BANNER = `
 ██████╗  ██████╗  ██████╗ ████████╗     ██████╗ ███████╗
 ██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝    ██╔═══██╗██╔════╝
 ██████╔╝██║   ██║██║   ██║   ██║       ██║   ██║███████╗
 ██╔══██╗██║   ██║██║   ██║   ██║       ██║   ██║╚════██║
 ██║  ██║╚██████╔╝╚██████╔╝   ██║       ╚██████╔╝███████║
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝        ╚═════╝ ╚══════╝
`.trim();

export const ASCII_TEST_SCENARIOS: AsciiTestScenario[] = [
  {
    id: "logo",
    label: "Logo",
    description: "Arte ASCII da Hero (referência visual)",
    getSource: (m = 1) => tileSource(heroAsciiArt, m),
  },
  {
    id: "small",
    label: "Imagem pequena",
    description: "Recorte compacto para iteração rápida",
    getSource: (m = 1) => {
      const crop = heroAsciiArt
        .trimEnd()
        .split("\n")
        .slice(10, 28)
        .map((l) => l.slice(20, 72))
        .join("\n");
      return tileSource(crop, m);
    },
  },
  {
    id: "giant",
    label: "Imagem gigante",
    description: "Arte completa em alta densidade",
    getSource: (m = 1) => tileSource(heroAsciiArt, Math.max(m, 2)),
  },
  {
    id: "text",
    label: "Texto",
    description: "Banner tipográfico ASCII",
    getSource: (m = 1) => tileSource(TEXT_BANNER, m),
  },
  {
    id: "complex",
    label: "ASCII complexo",
    description: "Padrão procedural denso",
    getSource: (m = 1) => tileSource(generateDenseAscii(96, 48), m),
  },
  {
    id: "dense",
    label: "ASCII extremamente denso",
    description: "Grade cheia com variação de glifos",
    getSource: (m = 1) => tileSource(generateDenseAscii(120, 64), m),
  },
  {
    id: "sparse",
    label: "ASCII extremamente vazio",
    description: "Poucos caracteres dispersos",
    getSource: (m = 1) => tileSource(generateSparseAscii(100, 50), m),
  },
];

export function getScenarioSource(scenarioId: string, stressMultiplier = 1): string {
  const scenario = ASCII_TEST_SCENARIOS.find((s) => s.id === scenarioId);
  return scenario?.getSource(stressMultiplier) ?? heroAsciiArt;
}

export const STRESS_MULTIPLIERS = [1, 2, 5, 10, 20] as const;
