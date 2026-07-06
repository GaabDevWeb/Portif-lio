import { EXIT_CODES } from "@/constants/system";
import type { CommandContext, CommandResult } from "@/types/root-os";
import { expandAliases } from "../aliases";
import { parseInput } from "../parser/tokenizer";
import { getCommandRegistry } from "../registry/command-registry";
import { notFound } from "../commands/shared";
import { ascii } from "@/features/ascii";

export async function executeInput(
  input: string,
  ctx: CommandContext,
): Promise<CommandResult> {
  const trimmed = input.trim();

  if (!trimmed) {
    return { exitCode: EXIT_CODES.success, lines: [] };
  }

  const expanded = expandAliases(trimmed);
  const pipeline = parseInput(expanded);
  if (!pipeline || pipeline.argv.length === 0) {
    return { exitCode: EXIT_CODES.success, lines: [] };
  }

  const [commandName, ...args] = pipeline.argv;
  const registry = getCommandRegistry();
  const command = registry.resolve(commandName);

  if (!command) {
    return notFound(commandName);
  }

  const result = await command.execute(ctx, args);
  return ascii.renderCommandResult(result);
}

export function getAutocompleteCandidates(
  ctx: CommandContext,
  input: string,
): string[] {
  const trimmed = input.trim();
  if (!trimmed) {
    return getCommandRegistry().names();
  }

  const parts = trimmed.split(/\s+/);
  const isCommandPosition = parts.length === 1 && !trimmed.endsWith(" ");

  if (isCommandPosition) {
    return getCommandRegistry()
      .names()
      .filter((name) => name.startsWith(parts[0]));
  }

  const commandName = parts[0];
  const command = getCommandRegistry().resolve(commandName);
  if (!command?.autocomplete) return [];

  const partial = parts[parts.length - 1] ?? "";
  return command.autocomplete(ctx, partial);
}
