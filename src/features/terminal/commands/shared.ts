import { EXIT_CODES } from "@/constants/system";
import type { CommandContext, CommandResult } from "@/types/root-os";

export function success(
  lines: CommandResult["lines"],
  extra: Partial<CommandResult> = {},
): CommandResult {
  return { exitCode: EXIT_CODES.success, lines, ...extra };
}

export function error(
  message: string,
  exitCode: number = EXIT_CODES.general,
): CommandResult {
  return {
    exitCode,
    lines: [{ stream: "stderr", text: message }],
  };
}

export function notFound(command: string): CommandResult {
  return error(`${command}: command not found`, EXIT_CODES.notFound);
}

export function misuse(message: string): CommandResult {
  return error(message, EXIT_CODES.misuse);
}

export function stdout(text: string): CommandResult["lines"] {
  return [{ stream: "stdout", text }];
}

export function stderr(text: string): CommandResult["lines"] {
  return [{ stream: "stderr", text }];
}

import { normalizePath } from "@/lib/utils";

export function resolvePathArg(
  ctx: CommandContext,
  arg?: string,
): { path: string; error?: CommandResult } {
  if (!arg) {
    return { path: ctx.cwd };
  }

  return { path: normalizePath(ctx.cwd, arg, ctx.homeDir) };
}
