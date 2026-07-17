/** Command pattern para histórico de edição (SSOT §3.3). */

export interface EditorCommand {
  readonly label: string;
  execute(): void;
  undo(): void;
}

/**
 * Stack undo/redo com limite (default 64, mínimo útil ≥20).
 * Cada comando executado limpa o futuro (redo).
 */
export class CommandHistory {
  private past: EditorCommand[] = [];
  private future: EditorCommand[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 64) {
    this.maxSize = Math.max(1, maxSize);
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  get undoDepth(): number {
    return this.past.length;
  }

  get redoDepth(): number {
    return this.future.length;
  }

  /** Executa o comando e empilha no past. */
  push(command: EditorCommand): void {
    command.execute();
    this.past.push(command);
    if (this.past.length > this.maxSize) this.past.shift();
    this.future = [];
  }

  undo(): boolean {
    const cmd = this.past.pop();
    if (!cmd) return false;
    cmd.undo();
    this.future.push(cmd);
    return true;
  }

  redo(): boolean {
    const cmd = this.future.pop();
    if (!cmd) return false;
    cmd.execute();
    this.past.push(cmd);
    if (this.past.length > this.maxSize) this.past.shift();
    return true;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}
