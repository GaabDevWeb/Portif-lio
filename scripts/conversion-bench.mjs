#!/usr/bin/env node
/**
 * Conversion quality benchmark — Node, no DOM.
 * Usage: node scripts/conversion-bench.mjs [--label baseline|after]
 *
 * Metrics: convert ms, matrix fingerprint, cell count, heap (if available).
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const fixturesDir = join(root, "fixtures/conversion-bench");
const outDir = join(root, "docs/architecture/phase-logs");

const label = process.argv.includes("--label")
  ? process.argv[process.argv.indexOf("--label") + 1] ?? "run"
  : "run";

function parsePpm(buf) {
  let i = 0;
  const text = buf.toString("latin1");
  if (!text.startsWith("P6")) throw new Error("Expected P6 PPM");
  i = 2;
  const skip = () => {
    while (i < text.length && /\s/.test(text[i])) i += 1;
    if (text[i] === "#") {
      while (i < text.length && text[i] !== "\n") i += 1;
      skip();
    }
  };
  const readTok = () => {
    skip();
    let s = "";
    while (i < text.length && !/\s/.test(text[i])) {
      s += text[i];
      i += 1;
    }
    return s;
  };
  const w = Number(readTok());
  const h = Number(readTok());
  const max = Number(readTok());
  if (max !== 255) throw new Error("Expected max 255");
  skip();
  const rgb = buf.subarray(i);
  const pixels = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < w * h; p += 1) {
    pixels[p * 4] = rgb[p * 3];
    pixels[p * 4 + 1] = rgb[p * 3 + 1];
    pixels[p * 4 + 2] = rgb[p * 3 + 2];
    pixels[p * 4 + 3] = 255;
  }
  return { pixels, width: w, height: h };
}

function fingerprint(matrix) {
  let h = 2166136261;
  for (const c of matrix.cells) {
    h ^= c.char.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
    h ^= (c.col << 8) ^ c.row;
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

async function loadPipeline() {
  // Prefer compiled-free path via tsx register if available
  const require = createRequire(import.meta.url);
  try {
    // Dynamic import of TS via tsx when run as: npx tsx scripts/conversion-bench.mjs
    const mod = await import(
      pathToFileURL(
        join(root, "src/features/ascii-interaction/animation-pipeline/converter/frame-converter.ts"),
      ).href
    );
    const opts = await import(
      pathToFileURL(join(root, "src/features/ascii-interaction/image-pipeline/types.ts")).href
    );
    return { convert: mod.convertRgbaFrameToMatrix, defaults: opts.DEFAULT_IMAGE_PIPELINE_OPTIONS };
  } catch (e) {
    console.error("Run with: npx tsx scripts/conversion-bench.mjs");
    throw e;
  }
}

async function main() {
  const { convert, defaults } = await loadPipeline();
  const files = readdirSync(fixturesDir)
    .filter((f) => f.endsWith(".ppm"))
    .sort();

  const rows = [];
  for (const file of files) {
    const { pixels, width, height } = parsePpm(readFileSync(join(fixturesDir, file)));
    const options = { ...defaults, width: Math.min(80, width), height: 0, lockAspectRatio: true };
    const t0 = performance.now();
    const matrix = convert({ pixels, width, height }, options);
    const ms = performance.now() - t0;
    const heap =
      typeof process.memoryUsage === "function"
        ? Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        : null;
    rows.push({
      fixture: file.replace(/\.ppm$/, ""),
      convertMs: Number(ms.toFixed(2)),
      cols: matrix.cols,
      rows: matrix.rows,
      cells: matrix.cells.length,
      fingerprint: fingerprint(matrix),
      heapMb: heap,
    });
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const mdPath = join(outDir, "CONVERSION-BENCH.md");
  const table = [
    `| fixture | convert ms | cols×rows | cells | fingerprint | heap MiB |`,
    `|---|---:|---|---:|---|---:|`,
    ...rows.map(
      (r) =>
        `| ${r.fixture} | ${r.convertMs} | ${r.cols}×${r.rows} | ${r.cells} | \`${r.fingerprint}\` | ${r.heapMb ?? "—"} |`,
    ),
  ].join("\n");

  const section = [
    ``,
    `## ${label} — ${new Date().toISOString()}`,
    ``,
    table,
    ``,
  ].join("\n");

  let existing = existsSync(mdPath) ? readFileSync(mdPath, "utf8") : "# Conversion Benchmark Log\n";
  if (!existing.includes("# Conversion Benchmark Log")) {
    existing = "# Conversion Benchmark Log\n" + existing;
  }
  writeFileSync(mdPath, existing.trimEnd() + "\n" + section);
  console.log(JSON.stringify({ label, count: rows.length, rows }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
