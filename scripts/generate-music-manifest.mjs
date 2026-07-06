import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const MUSIC_DIR = path.join(ROOT, "public", "music");
const OUT = path.join(MUSIC_DIR, "manifest.json");

function buildVersion() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.GITHUB_SHA ||
    String(Date.now())
  );
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
      continue;
    }
    out.push(full);
  }
  return out;
}

function toPublicUrl(fullPath) {
  const rel = path.relative(MUSIC_DIR, fullPath).split(path.sep).join("/");
  return `/music/${rel}`;
}

async function main() {
  const files = await walk(MUSIC_DIR).catch(() => []);
  const mp3 = files.filter((f) => f.toLowerCase().endsWith(".mp3"));

  const tracks = [];
  for (const file of mp3) {
    const info = await stat(file);
    const base = path.basename(file);
    const title = base.replace(/\.mp3$/i, "");
    const url = toPublicUrl(file);
    const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
    tracks.push({
      id: `${slugify(title)}-${hash}`,
      title,
      url,
      ext: "mp3",
      bytes: info.size,
    });
  }

  tracks.sort((a, b) => a.url.localeCompare(b.url));

  const manifest = {
    version: buildVersion(),
    generatedAt: new Date().toISOString(),
    tracks,
  };

  await writeFile(OUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  process.stdout.write(`music manifest: ${tracks.length} track(s) → ${path.relative(ROOT, OUT)}\n`);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + "\n");
  process.exitCode = 1;
});

