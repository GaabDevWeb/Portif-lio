import { rm } from "node:fs/promises";
import path from "node:path";

const targets = [".next", "out"];

for (const target of targets) {
  await rm(path.join(process.cwd(), target), { recursive: true, force: true });
}

process.stdout.write(`cleaned: ${targets.join(", ")}\n`);
