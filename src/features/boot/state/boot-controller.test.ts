import { describe, expect, it } from "vitest";

import {
  resolveInitialPhase,
  shouldSkipCinema,
  shouldUseReducedBoot,
} from "@/features/boot/state/boot-controller";

describe("boot-controller", () => {
  const base = {
    fastbootStored: false,
    fastbootQuery: false,
    reducedMotion: false,
    coarsePointer: false,
  };

  it("starts at BLACKOUT by default", () => {
    expect(resolveInitialPhase(base)).toBe("BLACKOUT");
  });

  it("fastboot goes to SHELL", () => {
    expect(resolveInitialPhase({ ...base, fastbootStored: true })).toBe("SHELL");
    expect(resolveInitialPhase({ ...base, fastbootQuery: true })).toBe("SHELL");
  });

  it("reduced motion starts at BOOT text sequence", () => {
    expect(resolveInitialPhase({ ...base, reducedMotion: true })).toBe("BOOT");
  });

  it("coarse pointer uses reduced boot", () => {
    expect(shouldUseReducedBoot({ ...base, coarsePointer: true })).toBe(true);
    expect(shouldSkipCinema({ ...base, coarsePointer: true })).toBe(true);
  });
});
