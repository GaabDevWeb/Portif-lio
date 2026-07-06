import { formatGitLog, loadTimeline } from "@/lib/content/timeline";
import type { CommandDefinition } from "@/types/root-os";
import { misuse, success, stdout } from "../shared";

export const gitCommand: CommandDefinition = {
  name: "git",
  description: "Limited git interface for timeline exploration",
  usage: "git log | git status",
  category: "portfolio",
  chapter: 7,
  opensApp: "timeline",
  execute(_ctx, argv) {
    const sub = argv[0];

    if (!sub) {
      return misuse("git: missing subcommand. Try 'git log' or 'git status'.");
    }

    if (sub === "log") {
      const commits = loadTimeline();
      const lines = formatGitLog(commits).flatMap((block) => stdout(block));
      lines.push({ stream: "stdout", text: "" });
      return success(lines, {
        openApp: "timeline",
        chapterComplete: 7,
      });
    }

    if (sub === "status") {
      return success([
        ...stdout("On branch main"),
        ...stdout("Your branch is up to date with 'origin/main'."),
        ...stdout(""),
        ...stdout("nothing to commit, working tree clean"),
      ], { chapterComplete: 7 });
    }

    return misuse(`git: '${sub}' is not a git command. See 'git log'.`);
  },
  autocomplete(_ctx, partial) {
    return ["log", "status"].filter((cmd) => cmd.startsWith(partial));
  },
};
