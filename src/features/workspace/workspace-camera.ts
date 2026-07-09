import gsap from "gsap";

import type { ModuleBounds, WorkspaceCamera } from "@/types/workspace";

export function animateCameraTo(
  camera: WorkspaceCamera,
  target: Partial<WorkspaceCamera>,
  onUpdate: (cam: WorkspaceCamera) => void,
  duration = 0.65,
): gsap.core.Tween {
  const proxy = { ...camera };

  return gsap.to(proxy, {
    x: target.x ?? camera.x,
    y: target.y ?? camera.y,
    scale: target.scale ?? camera.scale,
    duration,
    ease: "power2.inOut",
    onUpdate: () => {
      onUpdate({ x: proxy.x, y: proxy.y, scale: proxy.scale });
    },
  });
}

export function computeFocusCamera(
  bounds: ModuleBounds,
  scale: number,
  viewportW: number,
  viewportH: number,
  chromeOffset = 80,
): WorkspaceCamera {
  return {
    x: -(bounds.x + bounds.width / 2) * scale + viewportW / 2,
    y: -(bounds.y + bounds.height / 2) * scale + (viewportH - chromeOffset) / 2,
    scale,
  };
}

export function computeOverviewCamera(
  workspaceW: number,
  workspaceH: number,
  viewportW: number,
  viewportH: number,
  chromeOffset = 80,
): WorkspaceCamera {
  const scale = Math.min(
    (viewportW - 48) / workspaceW,
    (viewportH - chromeOffset - 48) / workspaceH,
    1,
  );
  return {
    x: (viewportW - workspaceW * scale) / 2,
    y: (viewportH - chromeOffset - workspaceH * scale) / 2,
    scale,
  };
}
