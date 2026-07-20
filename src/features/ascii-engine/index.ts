/**
 * ASCII Engine — product facade (converter-first).
 * Experimental editor/scene/nodes/playground/AI are NOT re-exported.
 * See src/legacy/ and PRODUCT_DECISIONS.md.
 */
export * from "@/features/ascii-engine/core";
export {
  writeTextToClipboard,
  writeHtmlToClipboard,
  type ClipboardWriteResult,
} from "@/features/ascii-engine/browser";
export * from "@/features/ascii-engine/converters";
export * from "@/features/ascii-engine/animator";
export * from "@/features/ascii-engine/presets";
export * from "@/features/ascii-engine/recipes";
export * from "@/features/ascii-engine/gallery";
export * from "@/features/ascii-engine/icons";
export * from "@/features/ascii-engine/themes";
export * from "@/features/ascii-engine/exporters";
export * from "@/features/ascii-engine/importers";
export { createAsciiEngine, type AsciiEngine } from "@/features/ascii-engine/sdk/create-ascii-engine";
export { ASCII_ENGINE_CLI_COMMANDS } from "@/features/ascii-engine/cli/commands";
export {
  runInfo,
  runBenchmark,
  runConvert,
  type CliConvertOptions,
} from "@/features/ascii-engine/cli";
