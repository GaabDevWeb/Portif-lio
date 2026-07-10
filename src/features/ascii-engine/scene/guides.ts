/**
 * Guides API stub — user-placed alignment guides (Wave 5+).
 */

export type GuideOrientation = "horizontal" | "vertical";

export interface Guide {
  id: string;
  orientation: GuideOrientation;
  /** World cell position. */
  position: number;
  locked: boolean;
}

export interface GuidesController {
  list(): Guide[];
  add(orientation: GuideOrientation, position: number): Guide | null;
  remove(id: string): boolean;
  clear(): void;
}

export function createGuidesStub(): GuidesController {
  const guides: Guide[] = [];
  return {
    list: () => [...guides],
    add: () => null,
    remove: () => false,
    clear: () => {
      guides.length = 0;
    },
  };
}
