import { BOOT_MODULES } from "@/constants/boot";

export const CRT_MONITOR_MODEL_PATH = "/models/crt-monitor.glb";

/** Glass plane aligned to CRT_Monitor_monitor_glass_0 (model space). */
export const SCREEN_TARGET = {
  position: [0, 0.015, 0.208] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  size: [0.298, 0.224] as [number, number],
};

/** Power LED on lower-right bezel (model space). */
export const LED_POSITION: [number, number, number] = [0.14, -0.21, 0.11];

export const INTRO_TIMING = {
  blackoutMs: 450,
  revealMs: 3200,
  ledDelayMs: 380,
  crtFlickerMs: 900,
  postLineMs: 160,
  moduleLineMs: 120,
  bootPauseMs: 600,
  loginTypeMs: 80,
  scrollHintMs: 1200,
  cameraTransitionMs: 3200,
  disposeDelayMs: 200,
} as const;

export const INTRO_POST_LINES = [
  "ROOT OS BIOS v0.1.0",
  "Checking Memory... 8192 OK",
  "Initializing Hardware...",
] as const;

export const INTRO_BOOT_MODULES = [
  { label: "Loading Renderer", detail: "Next.js App Router" },
  { label: "Loading Motion Engine", detail: "GSAP + Motion" },
  { label: "Loading Terminal", detail: "xterm.js + parser" },
  { label: "Loading Window Manager", detail: "WM + focus stack" },
  { label: "Loading Projects", detail: "/content/projects" },
  { label: "Starting ROOT OS", detail: "session store" },
] as const;

export const INTRO_CAMERA = {
  initial: {
    position: [0, 0.02, 0.95] as [number, number, number],
    fov: 36,
    lookAt: [0, 0.01, 0.05] as [number, number, number],
  },
  transitionEnd: {
    position: [0, 0.015, 0.165] as [number, number, number],
    fov: 24,
    lookAt: [0, 0.015, 0.38] as [number, number, number],
  },
} as const;

/** Re-export for parity with masterplan module list. */
export const LEGACY_BOOT_MODULES = BOOT_MODULES;
