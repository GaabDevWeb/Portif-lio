import gsap from "gsap";

import { MOTION_IDS } from "@/animations/motion-ids";
import {
  TERMINAL_DOCK_DURATION,
  WINDOW_OPEN_DURATION,
} from "@/constants/window-manager";

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function animateWindowOpen(element: HTMLElement): gsap.core.Tween {
  if (REDUCED_MOTION) {
    return gsap.set(element, { opacity: 1, scaleY: 1 });
  }
  return gsap.fromTo(
    element,
    { scaleY: 0, opacity: 0, transformOrigin: "top center" },
    {
      id: MOTION_IDS.windowOpen,
      scaleY: 1,
      opacity: 1,
      duration: WINDOW_OPEN_DURATION,
      ease: "power2.out",
    },
  );
}

export function animateWindowClose(
  element: HTMLElement,
  onComplete: () => void,
): gsap.core.Tween {
  if (REDUCED_MOTION) {
    onComplete();
    return gsap.set(element, { opacity: 0 });
  }
  return gsap.to(element, {
    scaleY: 0,
    opacity: 0,
    duration: WINDOW_OPEN_DURATION * 0.75,
    ease: "power2.in",
    transformOrigin: "top center",
    onComplete,
  });
}

export function animateTerminalDock(
  element: HTMLElement,
  expanded: boolean,
): gsap.core.Tween {
  const targetHeight = expanded ? "min(420px, 50dvh)" : "min(260px, 32dvh)";
  if (REDUCED_MOTION) {
    return gsap.set(element, { height: targetHeight });
  }
  return gsap.to(element, {
    height: targetHeight,
    duration: TERMINAL_DOCK_DURATION,
    ease: "power2.inOut",
  });
}

export function animateProfileReveal(element: HTMLElement): gsap.core.Tween {
  if (REDUCED_MOTION) {
    return gsap.set(element, { opacity: 1, y: 0 });
  }
  return gsap.fromTo(
    element,
    { opacity: 0, y: 12 },
    {
      id: MOTION_IDS.profileOpen,
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: "power2.out",
    },
  );
}
