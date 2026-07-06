export type IntroChapter =
  | "blackout"
  | "reveal"
  | "power"
  | "post"
  | "boot"
  | "scroll-wait"
  | "transition"
  | "complete";

export interface IntroState {
  chapter: IntroChapter;
  ledOn: boolean;
  crtOn: boolean;
  crtFlicker: number;
  bootLines: string[];
  bootLineIndex: number;
  loginComplete: boolean;
  webglActive: boolean;
}

export interface ScreenTarget {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}

export interface CameraRigState {
  position: [number, number, number];
  fov: number;
  lookAt: [number, number, number];
}
