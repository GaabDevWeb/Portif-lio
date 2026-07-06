export interface ManPage {
  name: string;
  synopsis: string;
  description: string;
  examples: string[];
  seeAlso: string[];
}

export const MAN_PAGES: Record<string, ManPage> = {
  help: {
    name: "help",
    synopsis: "help [command]",
    description: "Display help information for ROOT OS commands.",
    examples: ["$ help", "$ help ls"],
    seeAlso: ["man(1)", "apropos(1)"],
  },
  ls: {
    name: "ls",
    synopsis: "ls [-la] [path]",
    description: "List directory contents in the virtual filesystem.",
    examples: ["$ ls", "$ ls -la ~/projects"],
    seeAlso: ["cd(1)", "pwd(1)", "tree(1)"],
  },
  cd: {
    name: "cd",
    synopsis: "cd <path>",
    description: "Change the shell working directory.",
    examples: ["$ cd projects", "$ cd ~"],
    seeAlso: ["pwd(1)", "ls(1)"],
  },
  pwd: {
    name: "pwd",
    synopsis: "pwd",
    description: "Print name of current/working directory.",
    examples: ["$ pwd"],
    seeAlso: ["cd(1)"],
  },
  cat: {
    name: "cat",
    synopsis: "cat <file...>",
    description: "Concatenate and print files to standard output.",
    examples: ["$ cat manifesto.md"],
    seeAlso: ["less(1)", "open(1)"],
  },
  open: {
    name: "open",
    synopsis: "open <app|file>",
    description: "Open a GUI application or file in the window manager.",
    examples: ["$ open profile", "$ open projects"],
    seeAlso: ["close(1)"],
  },
  close: {
    name: "close",
    synopsis: "close [app]",
    description: "Close the focused or specified application window.",
    examples: ["$ close", "$ close projects"],
    seeAlso: ["open(1)"],
  },
  whoami: {
    name: "whoami",
    synopsis: "whoami",
    description: "Print effective user identity and open Profile.app.",
    examples: ["$ whoami"],
    seeAlso: ["profile(1)", "about(1)"],
  },
  projects: {
    name: "projects",
    synopsis: "projects [filter]",
    description: "List portfolio projects and open Projects.app.",
    examples: ["$ projects", "$ projects root"],
    seeAlso: ["cd(1)", "open(1)"],
  },
  contact: {
    name: "contact",
    synopsis: "contact",
    description: "Open Mail.app contact form.",
    examples: ["$ contact"],
    seeAlso: ["mail(1)"],
  },
  git: {
    name: "git",
    synopsis: "git log | git status",
    description: "Limited git interface for timeline exploration.",
    examples: ["$ git log", "$ git status"],
    seeAlso: ["timeline(1)"],
  },
  timeline: {
    name: "timeline",
    synopsis: "timeline",
    description: "Open Timeline.app with commit history graph.",
    examples: ["$ timeline"],
    seeAlso: ["git(1)"],
  },
  top: {
    name: "top",
    synopsis: "top [-b]",
    description: "Display skills as running processes. Opens Monitor.app.",
    examples: ["$ top"],
    seeAlso: ["skills(1)", "htop(1)"],
  },
  skills: {
    name: "skills",
    synopsis: "skills [--json]",
    description: "Show technical skills and open Monitor.app.",
    examples: ["$ skills", "$ skills --json"],
    seeAlso: ["top(1)"],
  },
  shutdown: {
    name: "shutdown",
    synopsis: "shutdown [-h now]",
    description: "Power off ROOT OS. Requires prior session activity.",
    examples: ["$ shutdown -h now"],
    seeAlso: ["reboot(1)", "poweroff(1)"],
  },
  fastboot: {
    name: "fastboot",
    synopsis: "fastboot [on|off]",
    description: "Toggle cinematic boot skip on next page load.",
    examples: ["$ fastboot on", "$ fastboot off"],
    seeAlso: ["reboot(1)"],
  },
  clear: {
    name: "clear",
    synopsis: "clear",
    description: "Clear the terminal screen.",
    examples: ["$ clear"],
    seeAlso: [],
  },
  tree: {
    name: "tree",
    synopsis: "tree [-L n] [path]",
    description: "Display directory tree structure.",
    examples: ["$ tree", "$ tree -L 2 ~/projects"],
    seeAlso: ["ls(1)"],
  },
  history: {
    name: "history",
    synopsis: "history [-c]",
    description: "Show or clear command history.",
    examples: ["$ history", "$ history -c"],
    seeAlso: [],
  },
};

export function formatManPage(page: ManPage): string[] {
  return [
    `NAME`,
    `    ${page.name} - ${page.description.split(".")[0]}.`,
    ``,
    `SYNOPSIS`,
    `    ${page.synopsis}`,
    ``,
    `DESCRIPTION`,
    `    ${page.description}`,
    ``,
    `EXAMPLES`,
    ...page.examples.map((ex) => `    ${ex}`),
    ``,
    ...(page.seeAlso.length
      ? [`SEE ALSO`, ...page.seeAlso.map((ref) => `    ${ref}`)]
      : []),
  ];
}

export function getManPage(name: string): ManPage | undefined {
  return MAN_PAGES[name];
}

export function getManPageNames(): string[] {
  return Object.keys(MAN_PAGES).sort();
}
