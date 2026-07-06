import { STORAGE_KEYS, TERMINAL } from "@/constants/system";
import { isBrowser } from "@/lib/utils";

export class CommandHistory {
  private entries: string[] = [];
  private index = -1;

  constructor(initial: string[] = []) {
    this.entries = [...initial];
  }

  static load(): CommandHistory {
    if (!isBrowser()) return new CommandHistory();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history);
      if (!raw) return new CommandHistory();
      const parsed = JSON.parse(raw) as string[];
      return new CommandHistory(parsed.slice(-TERMINAL.maxHistory));
    } catch {
      return new CommandHistory();
    }
  }

  add(entry: string): void {
    const trimmed = entry.trim();
    if (!trimmed) return;
    if (this.entries[this.entries.length - 1] === trimmed) return;
    this.entries.push(trimmed);
    if (this.entries.length > TERMINAL.maxHistory) {
      this.entries.shift();
    }
    this.index = this.entries.length;
    this.persist();
  }

  previous(): string | null {
    if (this.entries.length === 0) return null;
    this.index = Math.max(0, this.index - 1);
    return this.entries[this.index] ?? null;
  }

  next(): string | null {
    if (this.entries.length === 0) return null;
    if (this.index >= this.entries.length - 1) {
      this.index = this.entries.length;
      return "";
    }
    this.index += 1;
    return this.entries[this.index] ?? null;
  }

  resetNavigation(): void {
    this.index = this.entries.length;
  }

  list(): string[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.index = 0;
    this.persist();
  }

  private persist(): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(this.entries));
  }
}
