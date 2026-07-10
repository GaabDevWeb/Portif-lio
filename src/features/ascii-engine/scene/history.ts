import type { SceneDocument } from "@/features/ascii-engine/scene/scene-document";
import type { SceneDocumentData } from "@/features/ascii-engine/scene/types";

export interface SceneCommand {
  readonly label: string;
  execute(): void;
  undo(): void;
}

export class SceneHistory {
  private past: SceneCommand[] = [];
  private future: SceneCommand[] = [];
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

  get pastCount(): number {
    return this.past.length;
  }

  get futureCount(): number {
    return this.future.length;
  }

  push(cmd: SceneCommand): void {
    cmd.execute();
    this.past.push(cmd);
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
    return true;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}

/** Snapshot command — captures full scene before/after for complex ops. */
export class SceneSnapshotCommand implements SceneCommand {
  readonly label: string;
  private before: SceneDocumentData;
  private after: SceneDocumentData | null = null;

  constructor(
    private readonly scene: SceneDocument,
    label: string,
    private readonly mutate: () => void,
  ) {
    this.label = label;
    this.before = scene.toJSON();
  }

  execute(): void {
    if (this.after) {
      this.scene.replaceData(this.after);
      return;
    }
    this.mutate();
    this.after = this.scene.toJSON();
  }

  undo(): void {
    this.scene.replaceData(this.before);
  }
}

export function runWithHistory(
  history: SceneHistory,
  scene: SceneDocument,
  label: string,
  mutate: () => void,
): void {
  history.push(new SceneSnapshotCommand(scene, label, mutate));
}
