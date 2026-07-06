import { SYSTEM } from "@/constants/system";
import type { CommandDefinition } from "@/types/root-os";
import { getManPageNames } from "@/features/terminal/man/man-pages";
import { loadProfileContent } from "@/features/vfs/content-loader";
import { misuse, success, stdout } from "../shared";

export const echoCommand: CommandDefinition = {
  name: "echo",
  description: "Print arguments",
  usage: "echo [args...]",
  category: "system",
  execute(_ctx, argv) {
    return success(stdout(argv.join(" ")));
  },
};

export const uptimeCommand: CommandDefinition = {
  name: "uptime",
  description: "Show session uptime",
  usage: "uptime",
  category: "system",
  execute() {
    return success(stdout("up 42 min,  1 user,  load average: 0.42, 0.38, 0.35"));
  },
};

export const dateCommand: CommandDefinition = {
  name: "date",
  description: "Print date and time",
  usage: "date [-R]",
  category: "system",
  execute(_ctx, argv) {
    const now = new Date();
    const isDec28 = now.getMonth() === 11 && now.getDate() === 28;
    const lines = [...stdout(now.toString())];
    if (isDec28) {
      lines.push(...stdout("Happy ROOT OS anniversary! (Dec 28 easter egg)"));
    }
    if (argv.includes("-R")) {
      lines.push(...stdout(now.toUTCString()));
    }
    return success(lines, isDec28 ? { easterEgg: "date-dec28" } : {});
  },
};

export const unameCommand: CommandDefinition = {
  name: "uname",
  description: "Print system information",
  usage: "uname [-a]",
  category: "system",
  execute(_ctx, argv) {
    const base = "ROOT-OS";
    if (argv.includes("-a")) {
      return success(
        stdout(`${base} devbox 0.1.0 #1 SMP personal-kernel-space x86_64 GNU/Linux`),
      );
    }
    return success(stdout(base));
  },
};

export const hostnameCommand: CommandDefinition = {
  name: "hostname",
  description: "Print hostname",
  usage: "hostname",
  category: "system",
  execute() {
    return success(stdout(SYSTEM.hostname));
  },
};

export const idCommand: CommandDefinition = {
  name: "id",
  description: "Print user identity",
  usage: "id",
  category: "system",
  execute(ctx) {
    const uid = ctx.isRoot ? 0 : 1000;
    return success(stdout(`uid=${uid}(${ctx.user}) gid=${uid}(${ctx.user}) groups=${uid}(${ctx.user})`));
  },
};

export const dfCommand: CommandDefinition = {
  name: "df",
  description: "Disk space (fake)",
  usage: "df [-h]",
  category: "system",
  execute() {
    return success([
      ...stdout("Filesystem      Size  Used Avail Use% Mounted on"),
      ...stdout("/dev/root        42G   12G   30G  29% /"),
      ...stdout("tmpfs           2.0G  4.0M  2.0G   1% /tmp"),
    ]);
  },
};

export const freeCommand: CommandDefinition = {
  name: "free",
  description: "Memory usage (fake)",
  usage: "free [-m]",
  category: "system",
  execute() {
    return success([
      ...stdout("              total        used        free"),
      ...stdout("Mem:           8192        2048        6144"),
      ...stdout("Swap:          2048           0        2048"),
    ]);
  },
};

export const calCommand: CommandDefinition = {
  name: "cal",
  description: "Calendar",
  usage: "cal [month] [year]",
  category: "system",
  execute() {
    const now = new Date();
    return success(stdout(now.toLocaleString("en-US", { month: "long", year: "numeric" })));
  },
};

export const psCommand: CommandDefinition = {
  name: "ps",
  description: "Process snapshot",
  usage: "ps aux",
  category: "system",
  execute() {
    return success([
      ...stdout("USER       PID  %CPU %MEM    VSZ   RSS COMMAND"),
      ...stdout("guest     1001   2.0  1.2  42000  8192 terminal"),
      ...stdout("guest     1002   0.5  0.8  32000  4096 wm"),
    ]);
  },
};

export const whichCommand: CommandDefinition = {
  name: "which",
  description: "Locate command",
  usage: "which cmd",
  category: "system",
  execute(_ctx, argv) {
    const cmd = argv[0];
    if (!cmd) return misuse("which: missing argument");
    return success(stdout(`/usr/bin/${cmd}`));
  },
};

export const aproposCommand: CommandDefinition = {
  name: "apropos",
  description: "Search man pages",
  usage: "apropos keyword",
  category: "system",
  execute(_ctx, argv) {
    const keyword = argv[0]?.toLowerCase();
    if (!keyword) return misuse("apropos: missing keyword");
    const matches = getManPageNames().filter((name) => name.includes(keyword));
    if (matches.length === 0) return success(stdout(`${keyword}: nothing appropriate.`));
    return success(matches.flatMap((m) => stdout(`${m} (1) - ROOT OS command`)));
  },
};

export const aboutCommand: CommandDefinition = {
  name: "about",
  description: "Short bio",
  usage: "about",
  category: "portfolio",
  execute() {
    return success(
      [
        ...stdout("Creative developer building diegetic web experiences."),
        ...stdout("Type 'whoami' for the full profile."),
      ],
      { openApp: "profile" },
    );
  },
};

export const socialCommand: CommandDefinition = {
  name: "social",
  description: "Social links",
  usage: "social",
  category: "portfolio",
  execute() {
    const profile = loadProfileContent();
    return success([
      ...stdout(`github:   ${profile.github}`),
      ...stdout(`linkedin: ${profile.linkedin}`),
      ...stdout(`mail:     ${profile.email}`),
    ]);
  },
};

export const rebootCommand: CommandDefinition = {
  name: "reboot",
  description: "Restart session (fast boot)",
  usage: "reboot",
  category: "system",
  execute() {
    return success(stdout("Rebooting... (use Power on after shutdown for full boot)"));
  },
};

export const SYSTEM_COMMANDS: CommandDefinition[] = [
  echoCommand,
  uptimeCommand,
  dateCommand,
  unameCommand,
  hostnameCommand,
  idCommand,
  dfCommand,
  freeCommand,
  calCommand,
  psCommand,
  whichCommand,
  aproposCommand,
  aboutCommand,
  socialCommand,
  rebootCommand,
];
