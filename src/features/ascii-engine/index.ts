/**
 * ASCII Engine — fachada de produto.
 * Reexporta a implementação em ascii-interaction e módulos Next.
 *
 * downloadBlob/downloadText: vindos do core (animation-pipeline).
 * writeTextToClipboard: browser adapter.
 */
export * from "@/features/ascii-engine/core";
export {
  writeTextToClipboard,
  type ClipboardWriteResult,
} from "@/features/ascii-engine/browser";
export * from "@/features/ascii-engine/converters";
export * from "@/features/ascii-engine/editor";
export * from "@/features/ascii-engine/document";
export * from "@/features/ascii-engine/storage";
export * from "@/features/ascii-engine/animator";
export * from "@/features/ascii-engine/nodes";
export * from "@/features/ascii-engine/playground";
export * from "@/features/ascii-engine/presets";
export * from "@/features/ascii-engine/themes";
export * from "@/features/ascii-engine/stats";
export * from "@/features/ascii-engine/benchmark";
export * from "@/features/ascii-engine/exporters";
export * from "@/features/ascii-engine/importers";
export * from "@/features/ascii-engine/plugins";
export { createAsciiEngine, type AsciiEngine } from "@/features/ascii-engine/sdk/create-ascii-engine";
export { ASCII_ENGINE_CLI_COMMANDS } from "@/features/ascii-engine/cli/commands";
export {
  runInfo,
  runBenchmark,
  runNodeBenchmarkSuite,
  runConvert,
  type CliConvertOptions,
} from "@/features/ascii-engine/cli";
