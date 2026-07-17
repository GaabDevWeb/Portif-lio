/**
 * Snapping API stub — snap to grid / guides / object edges.
 */

export interface SnapTarget {
  kind: "grid" | "guide" | "object-edge" | "object-center";
  x?: number;
  y?: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snapped: boolean;
  targets: SnapTarget[];
}

export interface SnappingController {
  enabled: boolean;
  gridSize: number;
  setEnabled(enabled: boolean): void;
  snap(x: number, y: number): SnapResult;
}

export function createSnappingStub(enabled = true, gridSize = 1): SnappingController {
  let on = enabled;
  return {
    get enabled() {
      return on;
    },
    gridSize,
    setEnabled(v) {
      on = v;
    },
    snap(x, y): SnapResult {
      if (!on) return { x, y, snapped: false, targets: [] };
      const sx = Math.round(x / gridSize) * gridSize;
      const sy = Math.round(y / gridSize) * gridSize;
      return {
        x: sx,
        y: sy,
        snapped: sx !== x || sy !== y,
        targets: [{ kind: "grid", x: sx, y: sy }],
      };
    },
  };
}
