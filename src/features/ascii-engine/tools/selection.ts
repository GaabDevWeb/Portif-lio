export interface CellRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Selection model — object ids + optional cell region.
 * Keeps a local copy; sync with SceneDocument.selectedObjectIds via apply/sync.
 */
export class SelectionModel {
  private objectIds: string[] = [];
  private cellRegion: CellRegion | null = null;

  getObjectIds(): string[] {
    return [...this.objectIds];
  }

  getCellRegion(): CellRegion | null {
    return this.cellRegion ? { ...this.cellRegion } : null;
  }

  setObjectIds(ids: string[]): void {
    this.objectIds = [...ids];
  }

  setCellRegion(region: CellRegion | null): void {
    this.cellRegion = region ? { ...region } : null;
  }

  clear(): void {
    this.objectIds = [];
    this.cellRegion = null;
  }

  hasObjects(): boolean {
    return this.objectIds.length > 0;
  }

  syncFromScene(ids: string[]): void {
    this.objectIds = [...ids];
  }
}
