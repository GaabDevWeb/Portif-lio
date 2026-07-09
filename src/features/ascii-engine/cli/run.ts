#!/usr/bin/env node
/**
 * ASCII Engine CLI entry — Node via tsx.
 *
 *   npm run ascii-engine -- info
 *   npm run ascii-engine -- benchmark [--width 80]
 *   npm run ascii-engine -- convert <input> -o <output> [--width 80]
 */

import { runInfo } from "@/features/ascii-engine/cli/info";
import { runBenchmark } from "@/features/ascii-engine/cli/benchmark";
import { runConvert } from "@/features/ascii-engine/cli/convert";
import { ASCII_ENGINE_CLI_COMMANDS } from "@/features/ascii-engine/cli/commands";

function printHelp(exitCode = 0): never {
  const lines = [
    "Usage: ascii-engine <command> [options]",
    "",
    "Commands:",
    ...ASCII_ENGINE_CLI_COMMANDS.map((c) => `  ${c.synopsis.padEnd(52)} ${c.description}`),
    "",
    "Global:",
    "  -h, --help     Show this help",
    "",
    "Examples:",
    "  npm run ascii-engine -- info",
    "  npm run ascii-engine -- benchmark --width 80",
    "  npm run ascii-engine -- convert anim.gif -o out.txt --width 80",
    "  npm run ascii-engine -- convert matrix.json -o out.txt",
  ];
  console.log(lines.join("\n"));
  process.exit(exitCode);
}

function parseFlag(args: string[], name: string): string | undefined {
  const long = `--${name}`;
  const idx = args.indexOf(long);
  if (idx >= 0) {
    const next = args[idx + 1];
    if (next && !next.startsWith("-")) return next;
  }
  if (name === "output") {
    const short = args.indexOf("-o");
    if (short >= 0) {
      const next = args[short + 1];
      if (next && !next.startsWith("-")) return next;
    }
  }
  return undefined;
}

function hasFlag(args: string[], ...names: string[]): boolean {
  return names.some((n) => args.includes(n));
}

function stripFlags(args: string[], flagsWithValue: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]!;
    if (flagsWithValue.includes(a)) {
      i += 1;
      continue;
    }
    if (a.startsWith("--") || a === "-o" || a === "-h") continue;
    out.push(a);
  }
  return out;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || hasFlag(argv, "-h", "--help")) {
    printHelp(0);
  }

  const [command, ...rest] = argv;

  switch (command) {
    case "info": {
      runInfo();
      return;
    }
    case "benchmark": {
      const widthRaw = parseFlag(rest, "width");
      const width = widthRaw ? Number(widthRaw) : undefined;
      if (widthRaw && (!Number.isFinite(width) || (width ?? 0) < 8)) {
        throw new Error("--width must be a number >= 8");
      }
      await runBenchmark({ width });
      return;
    }
    case "convert": {
      const output = parseFlag(rest, "output");
      const widthRaw = parseFlag(rest, "width");
      const formatRaw = parseFlag(rest, "format") as "txt" | "json" | "auto" | undefined;
      const positional = stripFlags(rest, ["--output", "-o", "--width", "--format"]);
      const input = positional[0];
      if (!input || !output) {
        console.error("convert requires <input> and -o <output>");
        printHelp(1);
      }
      const width = widthRaw ? Number(widthRaw) : undefined;
      if (widthRaw && (!Number.isFinite(width) || (width ?? 0) < 8)) {
        throw new Error("--width must be a number >= 8");
      }
      await runConvert({ input, output, width, format: formatRaw });
      return;
    }
    case "export":
    case "play":
    case "analyze":
    case "serve": {
      const stub = ASCII_ENGINE_CLI_COMMANDS.find((c) => c.name === command);
      console.error(
        stub
          ? `Command "${command}" is still a stub (${stub.synopsis}).`
          : `Command "${command}" is not implemented yet.`,
      );
      process.exit(2);
      return;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printHelp(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
