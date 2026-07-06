import type { SessionPhase } from "@/types/root-os";

export type BootStage = "cinema" | "complete";

export interface BootInitOptions {
  fastbootStored: boolean;
  fastbootQuery: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
}

export interface CinemaOptions extends BootInitOptions {
  cinemaQuery: boolean;
  cinemaSeen: boolean;
}

export function resolveInitialPhase(options: BootInitOptions): SessionPhase {
  if (options.fastbootStored || options.fastbootQuery) {
    return "LANDING";
  }
  return "LANDING";
}

export function shouldShowCinema(options: CinemaOptions): boolean {
  if (options.fastbootStored || options.fastbootQuery) return false;
  if (options.cinemaSeen && !options.cinemaQuery) return false;
  if (options.cinemaQuery) return true;
  if (options.reducedMotion || options.coarsePointer) return false;
  return !options.cinemaSeen;
}

export function resolveBootStage(phase: SessionPhase): BootStage | null {
  if (phase === "CINEMA") return "cinema";
  if (phase === "LANDING" || phase === "APP_OPEN" || phase === "SHELL") return "complete";
  return null;
}

/** @deprecated */
export function shouldUseReducedBoot(options: BootInitOptions): boolean {
  return options.reducedMotion || options.coarsePointer;
}

/** @deprecated alias */
export function shouldSkipCinema(options: BootInitOptions): boolean {
  return options.fastbootStored || options.fastbootQuery || shouldUseReducedBoot(options);
}
