import type { SessionPhase } from "@/types/root-os";

export type BootStage =
  | "blackout"
  | "cinema"
  | "post"
  | "login"
  | "complete";

export interface BootInitOptions {
  fastbootStored: boolean;
  fastbootQuery: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
}

export function resolveInitialPhase(options: BootInitOptions): SessionPhase {
  if (options.fastbootStored || options.fastbootQuery) {
    return "SHELL";
  }
  if (options.reducedMotion || options.coarsePointer) {
    return "BOOT";
  }
  return "BLACKOUT";
}

export function resolveBootStage(phase: SessionPhase): BootStage | null {
  switch (phase) {
    case "BLACKOUT":
      return "blackout";
    case "BOOT":
      return "post";
    case "LOGIN":
      return "login";
    case "SHELL":
    case "APP_OPEN":
      return "complete";
    default:
      return null;
  }
}

export function shouldUseReducedBoot(options: BootInitOptions): boolean {
  return options.reducedMotion || options.coarsePointer;
}

export function shouldSkipCinema(options: BootInitOptions): boolean {
  return (
    options.fastbootStored ||
    options.fastbootQuery ||
    shouldUseReducedBoot(options)
  );
}
