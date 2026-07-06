import type { CommandDefinition } from "@/types/root-os";
import { success } from "../shared";

export const clearCommand: CommandDefinition = {
  name: "clear",
  aliases: ["cls"],
  description: "Clear the terminal screen",
  usage: "clear",
  category: "navigation",
  execute() {
    return success([], { clearScreen: true });
  },
};
