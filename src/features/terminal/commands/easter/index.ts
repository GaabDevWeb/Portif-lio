import type { CommandDefinition } from "@/types/root-os";
import {
  COW_ASCII,
  FORTUNES,
  NEOFETCH_LOGO,
  SL_TRAIN,
} from "@/lib/easter/content";
import { SYSTEM } from "@/constants/system";
import { error, misuse, success, stdout } from "../shared";

function egg(
  id: string,
  def: CommandDefinition,
  extra: Partial<CommandDefinition> = {},
): CommandDefinition {
  return {
    ...def,
    category: "easter",
    ...extra,
    execute(ctx, argv) {
      const result = def.execute(ctx, argv);
      if (result instanceof Promise) {
        return result.then((r) => ({ ...r, easterEgg: id }));
      }
      return { ...result, easterEgg: id };
    },
  };
}

export const cowsayCommand = egg("cowsay", {
  name: "cowsay",
  description: "Display a cow with a message",
  usage: "cowsay [message]",
  category: "easter",
  execute(_ctx, argv) {
    const msg = argv.join(" ") || "moo";
    const border = "-".repeat(msg.length + 2);
    return success([
      ...stdout(border),
      ...stdout(`< ${msg} >`),
      ...stdout(border),
      ...stdout(COW_ASCII),
    ]);
  },
});

export const fortuneCommand = egg("fortune", {
  name: "fortune",
  description: "Display a random fortune",
  usage: "fortune",
  category: "easter",
  execute() {
    const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    return success(stdout(quote));
  },
});

export const matrixCommand = egg("matrix", {
  name: "matrix",
  description: "Matrix rain overlay (8s)",
  usage: "matrix",
  category: "easter",
  execute() {
    return success(stdout("Wake up, guest..."), { visualEffect: "matrix" });
  },
});

export const slCommand = egg("sl", {
  name: "sl",
  description: "Steam locomotive",
  usage: "sl",
  category: "easter",
  execute() {
    return success([
      ...stdout("You typed 'sl' instead of 'ls'. Classic."),
      ...stdout(SL_TRAIN),
    ]);
  },
});

export const hackCommand = egg("hack", {
  name: "hack",
  description: "Fake hacking sequence",
  usage: "hack",
  category: "easter",
  execute() {
    return success([
      ...stdout("[=====>                    ] 23%"),
      ...stdout("[===================>      ] 78%"),
      ...stdout("[==========================] 100%"),
      ...stdout("access denied: nice try, guest."),
    ]);
  },
});

export const sudoCommand = egg("sudo", {
  name: "sudo",
  description: "Superuser do (cosmetic)",
  usage: "sudo [command]",
  category: "easter",
  execute(_ctx, argv) {
    if (argv[0] === "su") {
      return success(
        stdout("root@devbox: permission granted (cosmetic only)."),
        { isRoot: true, setUser: "root" },
      );
    }
    if (argv.join(" ") === "make sandwich") {
      return success(stdout("sandwich: command not found. Try 'make build'."));
    }
    return success(stdout("[sudo] password for guest: ******\nSorry, try again."));
  },
});

export const vimCommand = egg("vim", {
  name: "vim",
  description: "Fake vim modal",
  usage: "vim [file]",
  category: "easter",
  execute(_ctx, argv) {
    const file = argv[0] ?? "untitled";
    return success([
      ...stdout(`VIM - Vi IMproved (fake) — ${file}`),
      ...stdout("-- INSERT --"),
      ...stdout("Type :wq to quit. (just kidding, you're already out.)"),
    ]);
  },
});

export const emacsCommand = egg("emacs", {
  name: "emacs",
  description: "Emacs joke",
  usage: "emacs",
  category: "easter",
  execute() {
    return success(stdout("Emacs: Alt+F4 recommended. (Just use Editor.app.)"));
  },
});

export const asciiCommand = egg("ascii", {
  name: "logo",
  aliases: ["ascii-art"],
  description: "Random ASCII art",
  usage: "logo",
  category: "easter",
  execute() {
    return success(stdout(NEOFETCH_LOGO));
  },
});

export const bannerCommand = egg("banner", {
  name: "banner",
  description: "FIGlet-style banner",
  usage: "banner [text]",
  category: "easter",
  execute(_ctx, argv) {
    const text = (argv.join(" ") || "ROOT OS").toUpperCase();
    return success(stdout(`╔${"═".repeat(text.length + 2)}╗\n║ ${text} ║\n╚${"═".repeat(text.length + 2)}╝`));
  },
});

export const creditsCommand = egg("credits", {
  name: "credits",
  description: "Roll credits",
  usage: "credits",
  category: "easter",
  execute() {
    return success([
      ...stdout("ROOT OS — built with Next.js, GSAP, xterm.js, R3F"),
      ...stdout("Guest starring: you"),
      ...stdout("No pixels were harmed in the making of this portfolio."),
    ]);
  },
});

export const fourthWallCommand = egg("fourth-wall", {
  name: "fourth-wall",
  description: "Meta commentary",
  usage: "fourth-wall",
  category: "easter",
  execute() {
    return success(
      stdout("You're reading output rendered by React. The terminal is real. The OS is fiction."),
    );
  },
});

export const teaCommand = egg("tea", {
  name: "tea",
  description: "British joke",
  usage: "tea",
  category: "easter",
  execute() {
    return success(stdout("404: tea not found. Have you tried coffee?"));
  },
});

export const revCommand = egg("rev", {
  name: "rev",
  description: "Reverse a string",
  usage: "rev [text]",
  category: "easter",
  execute(_ctx, argv) {
    const text = argv.join(" ") || "guest";
    return success(stdout(text.split("").reverse().join("")));
  },
});

export const themeCommand = egg("theme", {
  name: "theme",
  description: "Cycle terminal themes (cosmetic message)",
  usage: "theme",
  category: "easter",
  execute() {
    const themes = ["phosphor", "amber", "mono"];
    const next = themes[Math.floor(Math.random() * themes.length)];
    return success(stdout(`theme: switched to '${next}' (visual only).`));
  },
});

export const volumeCommand = egg("volume", {
  name: "volume",
  description: "Volume joke",
  usage: "volume [0-100]",
  category: "easter",
  execute(_ctx, argv) {
    const level = argv[0] ?? "50";
    return success(stdout(`volume: ${level}% (this terminal has no speakers).`));
  },
});

export const muteCommand = egg("mute", {
  name: "mute",
  description: "Mute blips",
  usage: "mute",
  category: "easter",
  execute() {
    return success(stdout("muted. (there was never any sound.)"));
  },
});

export const telnetCommand = egg("telnet", {
  name: "telnet",
  description: "Fake MUD",
  usage: "telnet [host]",
  category: "easter",
  execute(_ctx, argv) {
    const host = argv[0] ?? "localhost";
    return success([
      ...stdout(`Trying ${host}...`),
      ...stdout("Connected to ROOT MUD v0.1"),
      ...stdout("You are in a dark terminal. Exits: north, south, help"),
      ...stdout("(type 'exit' to leave the MUD)"),
    ]);
  },
});

export const sshCommand = egg("ssh", {
  name: "ssh",
  description: "SSH joke",
  usage: "ssh [user@host]",
  category: "easter",
  execute(_ctx, argv) {
    const target = argv[0] ?? "root@devbox";
    return success([
      ...stdout(`ssh: connect to host ${target} port 22: Connection refused`),
      ...stdout("(this machine only accepts local guests.)"),
    ]);
  },
});

export const pingCommand = egg("ping", {
  name: "ping",
  description: "Fake ping",
  usage: "ping [-c n] host",
  category: "easter",
  execute(_ctx, argv) {
    const host = argv.find((a) => !a.startsWith("-")) ?? "devbox.local";
    return success([
      ...stdout(`PING ${host} (127.0.0.1): 56 data bytes`),
      ...stdout("64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms"),
      ...stdout("64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms"),
      ...stdout(`--- ${host} ping statistics ---`),
      ...stdout("2 packets transmitted, 2 received, 0% packet loss"),
    ]);
  },
});

export const makeCommand = egg("make", {
  name: "make",
  description: "Fake Makefile",
  usage: "make [target]",
  category: "easter",
  execute(_ctx, argv) {
    const target = argv[0] ?? "all";
    return success([
      ...stdout(`make: Nothing to be done for '${target}'.`),
      ...stdout("(ROOT OS ships pre-built.)"),
    ]);
  },
});

export const dockerCommand = egg("docker", {
  name: "docker",
  description: "Fake docker ps",
  usage: "docker ps",
  category: "easter",
  execute(_ctx, argv) {
    if (argv[0] !== "ps") return misuse("docker: try 'docker ps'");
    return success([
      ...stdout("CONTAINER ID   IMAGE              STATUS"),
      ...stdout("a1b2c3d4e5f6   root-os/guest      Up 42 minutes"),
      ...stdout("f6e5d4c3b2a1   root-os/terminal   Up 42 minutes"),
    ]);
  },
});

export const kubectlCommand = egg("kubectl", {
  name: "kubectl",
  description: "Kubernetes joke",
  usage: "kubectl [command]",
  category: "easter",
  execute() {
    return success(stdout("kubectl: cluster 'devbox' not found. Have you tried 'projects'?"));
  },
});

export const npmCommand = egg("npm", {
  name: "npm",
  description: "npm install joke",
  usage: "npm install",
  category: "easter",
  execute(_ctx, argv) {
    if (argv[0] !== "install") return misuse("npm: try 'npm install'");
    return success([
      ...stdout("npm WARN deprecated sanity@1.0.0"),
      ...stdout("added 999 packages in 0.001s"),
      ...stdout("(packages were already in node_modules.)"),
    ]);
  },
});

export const yarnCommand = egg("yarn", {
  name: "yarn",
  description: "yarn joke",
  usage: "yarn",
  category: "easter",
  execute() {
    return success(stdout("yarn: done in 0.00s. (nothing to install.)"));
  },
});

export const bunCommand = egg("bun", {
  name: "bun",
  description: "bun speed joke",
  usage: "bun install",
  category: "easter",
  execute() {
    return success(stdout("bun: installed 999 packages in 3ms. (probably.)"));
  },
});

export const nodeCommand = egg("node", {
  name: "node",
  description: "Fake node REPL",
  usage: "node",
  category: "easter",
  execute() {
    return success([
      ...stdout("> console.log('hello from ROOT OS')"),
      ...stdout("hello from ROOT OS"),
      ...stdout("> // press Ctrl+C to exit REPL"),
    ]);
  },
});

export const pythonCommand = egg("python", {
  name: "python",
  description: "Fake python REPL",
  usage: "python",
  category: "easter",
  execute() {
    return success([
      ...stdout('>>> print("hello from ROOT OS")'),
      ...stdout("hello from ROOT OS"),
      ...stdout(">>> # exit with Ctrl+D"),
    ]);
  },
});

export const curlCommand = egg("curl", {
  name: "curl",
  description: "Fake HTTP response",
  usage: "curl [url]",
  category: "easter",
  execute(_ctx, argv) {
    const url = argv[0] ?? "https://devbox.local";
    return success([
      ...stdout(`HTTP/1.1 200 OK`),
      ...stdout(`Content-Type: text/plain`),
      ...stdout(""),
      ...stdout(`<!-- fetched ${url} from imaginary network -->`),
      ...stdout("ROOT OS says hello."),
    ]);
  },
});

export const htopCommand = egg("htop", {
  name: "htop",
  description: "Colorful top easter egg",
  usage: "htop",
  category: "easter",
  execute() {
    return success(
      [
        ...stdout("\x1b[36m  PID USER   CPU% MEM%  COMMAND\x1b[0m"),
        ...stdout("\x1b[32m 1001 guest  42.0  12.0  gsap\x1b[0m"),
        ...stdout("\x1b[33m 1002 guest  38.0  10.0  react\x1b[0m"),
        ...stdout("\x1b[35m 1003 guest  20.0   8.0  xterm\x1b[0m"),
      ],
      { openApp: "monitor" },
    );
  },
});

export const neofetchCommand = egg("neofetch", {
  name: "neofetch",
  description: "System info with ASCII logo",
  usage: "neofetch",
  category: "easter",
  execute(ctx) {
    return success([
      ...stdout(NEOFETCH_LOGO),
      ...stdout(`Host: ${ctx.hostname}`),
      ...stdout(`User: ${ctx.user}`),
      ...stdout(`OS: ${SYSTEM.name} ${SYSTEM.version}`),
    ]);
  },
});

export const killCommand = egg("kill", {
  name: "kill",
  description: "Kill fake process",
  usage: "kill <pid>",
  category: "easter",
  execute(_ctx, argv) {
    const pid = argv[0];
    if (!pid) return misuse("kill: usage: kill <pid>");
    return success(stdout(`Process ${pid} terminated (not really).`));
  },
});

export const factorCommand = egg("factor", {
  name: "factor",
  description: "Factorize a number",
  usage: "factor [n]",
  category: "easter",
  execute(_ctx, argv) {
    const n = Number(argv[0] ?? 42);
    if (Number.isNaN(n)) return error("factor: invalid number");
    return success(stdout(`${n}: ${factorize(n).join(" ")}`));
  },
});

export const seqCommand = egg("seq", {
  name: "seq",
  description: "Print sequence",
  usage: "seq [n]",
  category: "easter",
  execute(_ctx, argv) {
    const n = Math.min(Number(argv[0] ?? 5), 20);
    const lines = Array.from({ length: n }, (_, i) => stdout(String(i + 1))).flat();
    return success(lines);
  },
});

export const rmCommand = egg("rm-rf", {
  name: "rm",
  description: "Remove files (safe simulation)",
  usage: "rm [-rf] path",
  category: "easter",
  execute(_ctx, argv) {
    const joined = argv.join(" ");
    if (joined.includes("-rf") && (joined.includes("/") || joined.endsWith("/"))) {
      return success([
        ...stdout("rm: initiating filesystem purge..."),
        ...stdout("rm: just kidding. Nothing was deleted."),
        ...stdout("rm: this is a portfolio, not production."),
      ]);
    }
    return error("rm: missing operand or permission denied");
  },
});

function factorize(n: number): number[] {
  const factors: number[] = [];
  let num = Math.abs(Math.floor(n));
  if (num < 2) return [num];
  for (let i = 2; i <= Math.sqrt(num); i++) {
    while (num % i === 0) {
      factors.push(i);
      num /= i;
    }
  }
  if (num > 1) factors.push(num);
  return factors;
}

export const EASTER_COMMANDS: CommandDefinition[] = [
  cowsayCommand,
  fortuneCommand,
  matrixCommand,
  slCommand,
  hackCommand,
  sudoCommand,
  vimCommand,
  emacsCommand,
  asciiCommand,
  bannerCommand,
  creditsCommand,
  fourthWallCommand,
  teaCommand,
  revCommand,
  themeCommand,
  volumeCommand,
  muteCommand,
  telnetCommand,
  sshCommand,
  pingCommand,
  makeCommand,
  dockerCommand,
  kubectlCommand,
  npmCommand,
  yarnCommand,
  bunCommand,
  nodeCommand,
  pythonCommand,
  curlCommand,
  htopCommand,
  neofetchCommand,
  killCommand,
  factorCommand,
  seqCommand,
  rmCommand,
];
