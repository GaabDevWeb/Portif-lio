import { formatGitLog, loadTimeline } from "@/lib/content/timeline";
import type { CommandDefinition } from "@/types/root-os";
import { success, stdout } from "../shared";

export const timelineCommand: CommandDefinition = {
  name: "timeline",
  description: "Open Timeline.app with commit history graph",
  usage: "timeline",
  category: "portfolio",
  chapter: 7,
  opensApp: "timeline",
  execute() {
    const commits = loadTimeline();
    const lines = formatGitLog(commits).flatMap((block) => stdout(block));
    return success(lines, {
      openApp: "timeline",
      chapterComplete: 7,
    });
  },
};
