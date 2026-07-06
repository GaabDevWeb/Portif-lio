import {
  formatKnowledgeIndexOutput,
  getGraphStats,
  loadKnowledgeGraph,
} from "@/lib/content/knowledge-graph";
import type { CommandDefinition } from "@/types/root-os";
import { success, stderr, stdout } from "../shared";

export const knowledgeCommand: CommandDefinition = {
  name: "knowledge",
  aliases: ["graph"],
  description: "Navigate to knowledge graph and show index stats",
  usage: "knowledge",
  category: "portfolio",
  chapter: 6,
  execute() {
    const stats = getGraphStats();
    const lines = formatKnowledgeIndexOutput().flatMap((text) => stdout(text));
    lines.push(...stdout(""));
    lines.push(
      ...stdout(
        `[graph] ${stats.nodes} nodes · ${stats.edges} edges · rendering map`,
      ),
    );
    return success(lines, {
      gotoSection: "knowledge",
      chapterComplete: 6,
    });
  },
};

export const indexKnowledgeCommand: CommandDefinition = {
  name: "index",
  description: "Index portfolio knowledge graph",
  usage: "index --knowledge",
  category: "portfolio",
  execute(_ctx, argv) {
    if (argv[0] !== "--knowledge") {
      return {
        exitCode: 1,
        lines: [{ stream: "stderr", text: "index: use --knowledge" }],
      };
    }

    const boot = [
      "index --knowledge",
      "Scanning repository...",
      "Resolving dependencies...",
      "Rendering graph...",
    ];

    const lines = boot.flatMap((text) => stdout(text));
    const stats = getGraphStats(loadKnowledgeGraph());
    lines.push(...stdout(`OK — ${stats.nodes} nodes, ${stats.edges} edges indexed.`));

    return success(lines, { gotoSection: "knowledge" });
  },
};

export const skillsCommand: CommandDefinition = {
  name: "skills",
  description: "Deprecated — use knowledge. Navigates to knowledge graph.",
  usage: "skills",
  category: "portfolio",
  execute() {
    const lines = [
      ...stderr("skills: deprecated — use `knowledge` or `index --knowledge`"),
      ...formatKnowledgeIndexOutput().flatMap((text) => stdout(text)),
    ];
    return success(lines, { gotoSection: "knowledge" });
  },
};
