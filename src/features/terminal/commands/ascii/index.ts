import type { CommandDefinition } from "@/types/root-os";
import { ascii } from "@/features/ascii";
import { misuse, success, stdout } from "../shared";

export const asciiCommand: CommandDefinition = {
  name: "ascii",
  aliases: ["figlet"],
  description: "Generate ASCII banner text",
  usage: "ascii <text>",
  category: "system",
  execute(_ctx, argv) {
    const text = argv.join(" ").trim();
    if (!text) return misuse("ascii: missing <text>");
    const banner = ascii.banner(text);
    return success(banner.flatMap((l) => stdout(l)));
  },
};

