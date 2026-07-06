import gsap from "gsap";

import { MOTION_IDS } from "@/animations/motion-ids";

const PROCESS_KILL_MS = 100;
const CRT_OFF_MS = 600;
const LED_OFF_MS = 200;
const INSERT_COIN_MS = 2000;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function animateProcessKill(
  appId: string,
  reducedMotion: boolean,
): Promise<void> {
  const el = document.querySelector(`[data-window-app="${appId}"]`);
  if (!el || reducedMotion) return;

  await gsap.to(el, {
    id: MOTION_IDS.shutdownProcessKill,
    opacity: 0,
    scale: 0.92,
    duration: PROCESS_KILL_MS / 1000,
    ease: "power2.in",
  });
}

export async function animateCrtOff(
  overlay: HTMLElement,
  reducedMotion: boolean,
): Promise<void> {
  if (reducedMotion) {
    overlay.style.opacity = "0";
    return;
  }

  await gsap.to(overlay, {
    id: MOTION_IDS.shutdownCrtOff,
    scaleY: 0.01,
    opacity: 0.4,
    transformOrigin: "center center",
    duration: CRT_OFF_MS / 1000,
    ease: "power4.in",
  });
}

export async function animateLedOff(
  led: HTMLElement,
  reducedMotion: boolean,
): Promise<void> {
  if (reducedMotion) {
    led.style.opacity = "0";
    return;
  }

  await gsap.to(led, {
    id: MOTION_IDS.shutdownLedOff,
    opacity: 0,
    duration: LED_OFF_MS / 1000,
    ease: "power2.out",
  });
}

export { PROCESS_KILL_MS, CRT_OFF_MS, LED_OFF_MS, INSERT_COIN_MS };
