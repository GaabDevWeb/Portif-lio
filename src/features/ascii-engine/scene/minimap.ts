/**
 * MiniMap API stub — architecture ready; UI deferred.
 */

export interface MiniMapBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MiniMapSource {
  getSceneBounds(): MiniMapBounds;
  getViewportBounds(): MiniMapBounds;
  /** Optional thumbnail matrix hash / revision for cache. */
  getRevision(): number;
}

export interface MiniMapController {
  enabled: boolean;
  setEnabled(enabled: boolean): void;
  bind(source: MiniMapSource | null): void;
  getSource(): MiniMapSource | null;
}

export function createMiniMapStub(): MiniMapController {
  let enabled = false;
  let source: MiniMapSource | null = null;
  return {
    get enabled() {
      return enabled;
    },
    setEnabled(v) {
      enabled = v;
    },
    bind(s) {
      source = s;
    },
    getSource: () => source,
  };
}
