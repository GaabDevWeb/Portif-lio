import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const contactCommand: CommandDefinition = {
  name: "contact",
  aliases: ["mail"],
  description: "Navigate to contact form",
  usage: "contact",
  category: "portfolio",
  chapter: 9,
  execute() {
    return success(
      [
        ...stdout("HTTP/1.1 200 OK"),
        ...stdout("Content-Type: application/json"),
        ...stdout(""),
        ...stdout("$ mail --compose"),
      ],
      { gotoSection: "contact", chapterComplete: 9 },
    );
  },
};
