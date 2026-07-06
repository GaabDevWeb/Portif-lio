import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const historyCommand: CommandDefinition = {
  name: "history",
  description: "Show or clear command history",
  usage: "history [-c]",
  category: "navigation",
  execute(ctx, argv) {
    if (argv.includes("-c")) {
      return success(stdout(""), { clearHistory: true });
    }

    const lines = ctx.history.flatMap((entry, index) =>
      stdout(`  ${(index + 1).toString().padStart(4)}  ${entry}`),
    );

    if (lines.length === 0) {
      return success(stdout("(no history yet)"));
    }

    return success(lines);
  },
};
