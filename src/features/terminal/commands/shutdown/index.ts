import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const exitCommand: CommandDefinition = {
  name: "exit",
  aliases: ["logout"],
  description: "Exit session hint",
  usage: "exit",
  category: "navigation",
  execute() {
    return success(
      stdout("There is no escape from ROOT OS. Use 'shutdown' to power off."),
    );
  },
};

export const shutdownCommand: CommandDefinition = {
  name: "shutdown",
  aliases: ["poweroff"],
  description: "Power off the system",
  usage: "shutdown [-h now]",
  category: "system",
  chapter: 10,
  execute(ctx) {
    if (ctx.chaptersComplete.length === 0) {
      return {
        exitCode: 1,
        lines: [
          {
            stream: "stderr",
            text: "shutdown: waiting for session activity — explore first.",
          },
        ],
      };
    }

    return success(
      [
        ...stdout("Shutdown scheduled."),
        ...stdout("Syncing filesystems..."),
      ],
      { chapterComplete: 10, shutdown: true },
    );
  },
};
