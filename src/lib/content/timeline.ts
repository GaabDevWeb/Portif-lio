import timeline from "../../../content/timeline.json";

export interface TimelineCommit {
  hash: string;
  date: string;
  message: string;
  branch: string;
}

export function loadTimeline(): TimelineCommit[] {
  return timeline as TimelineCommit[];
}

export function formatGitLog(commits: TimelineCommit[]): string[] {
  return commits.map(
    (c) =>
      `\x1b[33mcommit ${c.hash}\x1b[0m (${c.branch})\nAuthor: guest <guest@devbox.local>\nDate:   ${c.date}\n\n    ${c.message}`,
  );
}
