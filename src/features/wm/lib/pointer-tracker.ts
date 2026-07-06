export interface PointerPosition {
  x: number;
  y: number;
}

const DEFAULT_POINTER: PointerPosition = { x: 480, y: 320 };

let lastPointer: PointerPosition = DEFAULT_POINTER;
let subscribed = false;

function handlePointerMove(event: PointerEvent) {
  lastPointer = { x: event.clientX, y: event.clientY };
}

export function getLastPointerPosition(): PointerPosition {
  return lastPointer;
}

export function subscribePointerTracker(): () => void {
  if (subscribed || typeof window === "undefined") {
    return () => undefined;
  }

  subscribed = true;
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerdown", handlePointerMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerdown", handlePointerMove);
    subscribed = false;
  };
}
