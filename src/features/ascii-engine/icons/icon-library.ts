export const ICON_CATEGORIES = [
  "ui",
  "tech",
  "social",
  "linux",
  "gaming",
  "files",
  "animals",
  "space",
  "brands",
  "terminal",
  "os",
  "anime",
  "tools",
] as const;

export const ICON_STYLES = [
  "solid",
  "outline",
  "matrix",
  "crt",
  "dense",
  "terminal",
  "ansi",
  "unicode",
] as const;

export type IconCategory = (typeof ICON_CATEGORIES)[number];
export type IconStyle = (typeof ICON_STYLES)[number];

export interface AsciiIcon {
  id: string;
  name: string;
  category: IconCategory;
  style: IconStyle;
  ascii: string;
  tags: string[];
}

export const ASCII_ICONS: AsciiIcon[] = [
  {
    id: "folder",
    name: "Folder",
    category: "files",
    style: "solid",
    tags: ["directory", "files", "open"],
    ascii: `  ________
 /        \\
|  FOLDER  |
|__________|
    |  |
   _|  |_`,
  },
  {
    id: "file",
    name: "File",
    category: "files",
    style: "outline",
    tags: ["document", "text", "page"],
    ascii: `  _______
 /       \\
|  FILE   |
|         |
|_________|`,
  },
  {
    id: "github",
    name: "GitHub",
    category: "brands",
    style: "solid",
    tags: ["git", "code", "octocat"],
    ascii: `   .---.
  /     \\
 |  o o  |
 |   >   |
 |  ___  |
  \\_____/`,
  },
  {
    id: "react",
    name: "React",
    category: "tech",
    style: "outline",
    tags: ["javascript", "frontend", "atom"],
    ascii: `    (())
   /    \\
  |  <>  |
   \\    /
    (())`,
  },
  {
    id: "tux",
    name: "Tux",
    category: "linux",
    style: "solid",
    tags: ["linux", "penguin", "os"],
    ascii: `   .---.
  / o o \\
 |   ^   |
 |  \\_/  |
  \\_____/`,
  },
  {
    id: "heart",
    name: "Heart",
    category: "ui",
    style: "solid",
    tags: ["love", "like", "favorite"],
    ascii: `  ***   ***
 ***** *****
  *********
   *******
    *****
     ***
      *`,
  },
  {
    id: "star",
    name: "Star",
    category: "ui",
    style: "outline",
    tags: ["rating", "favorite", "spark"],
    ascii: `    *
   * *
  *****
 *  *  *
*       *`,
  },
  {
    id: "terminal",
    name: "Terminal",
    category: "terminal",
    style: "terminal",
    tags: ["shell", "cli", "console"],
    ascii: `+----------+
| >_       |
|          |
| $ echo   |
| ascii    |
+----------+`,
  },
  {
    id: "rocket",
    name: "Rocket",
    category: "space",
    style: "solid",
    tags: ["launch", "ship", "space"],
    ascii: `    /\\
   /  \\
  |    |
  |    |
 /|    |\\
/ |    | \\
  \\    /
   \\  /
    \\/`,
  },
  {
    id: "gamepad",
    name: "Gamepad",
    category: "gaming",
    style: "solid",
    tags: ["controller", "play", "games"],
    ascii: `  .-------.
 /  O   O  \\
|     +    |
 \\   ___  /
  '-------'`,
  },
  {
    id: "wifi",
    name: "WiFi",
    category: "tech",
    style: "outline",
    tags: ["network", "wireless", "signal"],
    ascii: `    (
   ( )
  (   )
 (     )
  \\___/`,
  },
  {
    id: "docker",
    name: "Docker",
    category: "tech",
    style: "outline",
    tags: ["container", "whale", "devops"],
    ascii: `  _______
 | [][][] |
 | [][][] |~
 |_______|~~
    ~~~~~~`,
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "tech",
    style: "solid",
    tags: ["javascript", "runtime", "server"],
    ascii: `   /\\
  /  \\
 / JS \\
 \\    /
  \\  /
   \\/`,
  },
  {
    id: "python",
    name: "Python",
    category: "tech",
    style: "solid",
    tags: ["language", "snake", "script"],
    ascii: `  .---.
 /  ~  \\
|   ~   |
 \\  ~  /
  '---'`,
  },
  {
    id: "cat",
    name: "Cat",
    category: "animals",
    style: "unicode",
    tags: ["pet", "animal", "kitty"],
    ascii: ` /\\_/\\
( o.o )
 > ^ <`,
  },
  {
    id: "dog",
    name: "Dog",
    category: "animals",
    style: "solid",
    tags: ["pet", "animal", "puppy"],
    ascii: `  / \\__
 (    @\\___
 /         O
/   (_____/
/_____/   U`,
  },
  {
    id: "moon",
    name: "Moon",
    category: "space",
    style: "outline",
    tags: ["night", "crescent", "sky"],
    ascii: `     ___
   /     \\
  |       |
  |       |
   \\     /
     ---`,
  },
  {
    id: "sun",
    name: "Sun",
    category: "space",
    style: "solid",
    tags: ["day", "light", "star"],
    ascii: ` \\ | /
--(O)--
 / | \\`,
  },
  {
    id: "windows",
    name: "Windows",
    category: "os",
    style: "outline",
    tags: ["microsoft", "desktop", "os"],
    ascii: `+---+---+
|   |   |
+---+---+
|   |   |
+---+---+`,
  },
  {
    id: "apple",
    name: "Apple",
    category: "os",
    style: "solid",
    tags: ["macos", "fruit", "brand"],
    ascii: `   ,-.
  /   \\
 |     |
  \\   /
   '-'`,
  },
  {
    id: "discord",
    name: "Discord",
    category: "social",
    style: "solid",
    tags: ["chat", "community", "voice"],
    ascii: `  .-----.
 /  o   \\
|   __   |
 \\      /
  '----'`,
  },
  {
    id: "twitter",
    name: "Twitter",
    category: "social",
    style: "outline",
    tags: ["x", "bird", "social"],
    ascii: `    \\
     \\
   ___\\
  (   @>
   \\___/`,
  },
  {
    id: "naruto",
    name: "Naruto",
    category: "anime",
    style: "dense",
    tags: ["ninja", "headband", "anime"],
    ascii: `  .---.
 | @ @ |
 |  ^  |
 | --- |
  \\___/`,
  },
  {
    id: "skull",
    name: "Skull",
    category: "gaming",
    style: "matrix",
    tags: ["danger", "death", "rpg"],
    ascii: `  .-----.
 / o   o \\
|   >   |
 \\  --- /
  '-----'`,
  },
  {
    id: "lock",
    name: "Lock",
    category: "ui",
    style: "outline",
    tags: ["secure", "password", "private"],
    ascii: `  .---.
  |   |
 +-----+
 |     |
 |     |
 +-----+`,
  },
  {
    id: "check",
    name: "Check",
    category: "ui",
    style: "solid",
    tags: ["done", "ok", "success"],
    ascii: `      *
     *
    *
   *
  *
 *`,
  },
  {
    id: "server",
    name: "Server",
    category: "tech",
    style: "crt",
    tags: ["host", "rack", "backend"],
    ascii: `+--------+
| [=][=] |
| [=][=] |
| [=][=] |
+--------+`,
  },
  {
    id: "mail",
    name: "Mail",
    category: "social",
    style: "outline",
    tags: ["email", "message", "inbox"],
    ascii: ` _______
|  ___  |
| |___| |
|_______|`,
  },
  {
    id: "database",
    name: "Database",
    category: "tech",
    style: "solid",
    tags: ["db", "sql", "storage"],
    ascii: ` .-----.
| ===== |
| ===== |
| ===== |
 '-----'`,
  },
  {
    id: "linux",
    name: "Linux",
    category: "os",
    style: "solid",
    tags: ["penguin", "gnu", "kernel"],
    ascii: `  (o.o)
 <(   )>
  /   \\`,
  },
  {
    id: "bug",
    name: "Bug",
    category: "tech",
    style: "ansi",
    tags: ["debug", "insect", "error"],
    ascii: ` \\   /
  \\o/
 --O--
  / \\
 /   \\`,
  },
];

export interface ListIconsOptions {
  category?: IconCategory;
  style?: IconStyle;
  search?: string;
}

export function listIcons(options: ListIconsOptions = {}): AsciiIcon[] {
  const { category, style, search } = options;
  let result = [...ASCII_ICONS];

  if (category) {
    result = result.filter((icon) => icon.category === category);
  }

  if (style) {
    result = result.filter((icon) => icon.style === style);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (icon) =>
          icon.name.toLowerCase().includes(q) ||
          icon.id.includes(q) ||
          icon.category.includes(q) ||
          icon.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
  }

  return result;
}

export function getIcon(id: string): AsciiIcon | undefined {
  return ASCII_ICONS.find((icon) => icon.id === id);
}
