import type { CommandDefinition } from "@/types/root-os";
import { catCommand } from "../commands/cat";
import { cdCommand, pwdCommand } from "../commands/cd";
import { clearCommand } from "../commands/clear";
import { exitCommand, shutdownCommand } from "../commands/shutdown";
import { contactCommand } from "../commands/contact";
import { fastbootCommand } from "../commands/fastboot";
import { gitCommand } from "../commands/git";
import { helpCommand } from "../commands/help";
import { historyCommand } from "../commands/history";
import { manCommand } from "../commands/man";
import { projectsCommand } from "../commands/projects";
import { skillsCommand } from "../commands/skills";
import { timelineCommand } from "../commands/timeline";
import { topCommand } from "../commands/top";
import { treeCommand } from "../commands/tree";
import { lsCommand } from "../commands/ls";
import { closeCommand, openCommand } from "../commands/open";
import { whoamiCommand } from "../commands/whoami";
import { EASTER_COMMANDS } from "../commands/easter";
import { SYSTEM_COMMANDS } from "../commands/system";

const DEFAULT_COMMANDS: CommandDefinition[] = [
  helpCommand,
  lsCommand,
  pwdCommand,
  cdCommand,
  catCommand,
  openCommand,
  closeCommand,
  clearCommand,
  whoamiCommand,
  exitCommand,
  shutdownCommand,
  fastbootCommand,
  projectsCommand,
  contactCommand,
  gitCommand,
  timelineCommand,
  topCommand,
  skillsCommand,
  manCommand,
  treeCommand,
  historyCommand,
  ...EASTER_COMMANDS,
  ...SYSTEM_COMMANDS,
];

export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();

  constructor(commands: CommandDefinition[] = DEFAULT_COMMANDS) {
    for (const command of commands) {
      this.register(command);
    }
  }

  register(command: CommandDefinition): void {
    this.commands.set(command.name, command);
    for (const alias of command.aliases ?? []) {
      this.commands.set(alias, command);
    }
  }

  resolve(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  list(): CommandDefinition[] {
    const unique = new Map<string, CommandDefinition>();
    for (const command of this.commands.values()) {
      unique.set(command.name, command);
    }
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  names(): string[] {
    return this.list().map((cmd) => cmd.name);
  }
}

let registryInstance: CommandRegistry | null = null;

export function getCommandRegistry(): CommandRegistry {
  if (!registryInstance) {
    registryInstance = new CommandRegistry();
  }
  return registryInstance;
}

export function resetCommandRegistry(): void {
  registryInstance = new CommandRegistry();
}

export function createCommandRegistry(
  commands?: CommandDefinition[],
): CommandRegistry {
  return new CommandRegistry(commands);
}
