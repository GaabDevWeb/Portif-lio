import {
  formatManPage,
  getManPage,
  getManPageNames,
} from "@/features/terminal/man/man-pages";
import type { CommandDefinition } from "@/types/root-os";
import { error, misuse, success } from "../shared";

export const manCommand: CommandDefinition = {
  name: "man",
  description: "Display manual pages for commands",
  usage: "man <command>",
  category: "navigation",
  execute(_ctx, argv) {
    const target = argv[0];

    if (!target) {
      return misuse("What manual page do you want?");
    }

    const page = getManPage(target);
    if (!page) {
      return error(`No manual entry for ${target}`);
    }

    const lines = formatManPage(page).map((text) => ({
      stream: "stdout" as const,
      text,
    }));

    return success(lines);
  },
  autocomplete(_ctx, partial) {
    return getManPageNames().filter((name) => name.startsWith(partial));
  },
};
