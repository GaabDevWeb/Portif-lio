import { BOOT_MODULES } from "@/constants/boot";

export const COMPUTER_MODEL_PATH = "/models/computer.glb";

/** Screen plane aligned to pack_1 monitor mesh (model space). */
export const SCREEN_TARGET = {
  position: [0, 0.12, 0.2] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  size: [0.62, 0.46] as [number, number],
};

export const INTRO_TIMING = {
  blackoutMs: 450,
  revealMs: 2800,
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
    position: [0, 0.08, 2.35] as [number, number, number],
    fov: 42,
    lookAt: [0, 0.1, 0] as [number, number, number],
  },
  transitionEnd: {
    position: [0, 0.12, 0.04] as [number, number, number],
    fov: 28,
    lookAt: [0, 0.12, 0.2] as [number, number, number],
  },
} as const;

/** Re-export for parity with masterplan module list. */
export const LEGACY_BOOT_MODULES = BOOT_MODULES;
