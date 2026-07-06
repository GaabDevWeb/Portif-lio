import { loadProfileContent } from "@/features/vfs/content-loader";
import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const whoamiCommand: CommandDefinition = {
  name: "whoami",
  description: "Print effective user identity",
  usage: "whoami",
  category: "system",
  chapter: 3,
  opensApp: "profile",
  execute(ctx) {
    const profile = loadProfileContent();

    return success(
      [
        ...stdout(ctx.user),
        ...stdout(""),
        ...stdout(`${profile.name} — ${profile.role}`),
        ...stdout(profile.tagline),
        ...stdout(""),
        ...stdout("hint: try 'open profile' or 'ls'"),
      ],
      { chapterComplete: 3, openApp: "profile" },
    );
  },
};
