export const BOOT_MODULES = [
  { label: "Loading Renderer", detail: "Next.js App Router" },
  { label: "Loading Animation Engine", detail: "GSAP + Motion" },
  { label: "Loading Window Manager", detail: "WM + focus stack" },
  { label: "Loading Terminal", detail: "xterm + parser" },
  { label: "Loading Shader Pipeline", detail: "R3F (boot only)" },
  { label: "Loading Projects", detail: "/content/projects" },
  { label: "Loading Filesystem", detail: "VFS layer" },
  { label: "Loading Experience", detail: "session store" },
] as const;

export const BOOT_TIMING = {
  blackoutHold: 2000,
  ledOn: 400,
  crtFlicker: 800,
  cameraPush: 2200,
  postIntro: 1200,
  moduleLine: 50,
  skipFade: 300,
  skipAvailableAfter: 3000,
  loginFade: 400,
} as const;

export const BOOT_POST_LINES = [
  "ROOT OS BIOS v0.1.0",
  "Checking memory... 8192 OK",
  "Detecting primary master... ROOT_DRIVE",
  "ROOT OS v0.1.0 — personal kernel space",
] as const;
