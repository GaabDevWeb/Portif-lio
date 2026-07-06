import { describe, expect, it } from "vitest";

import {
  resolveInitialPhase,
  shouldShowCinema,
} from "@/features/boot/state/boot-controller";

const base = {
  fastbootStored: false,
  fastbootQuery: false,
  reducedMotion: false,
  coarsePointer: false,
};

describe("boot-controller v2", () => {
  it("starts at LANDING by default", () => {
    expect(resolveInitialPhase(base)).toBe("LANDING");
  });

  it("fastboot goes to LANDING", () => {
    expect(resolveInitialPhase({ ...base, fastbootStored: true })).toBe("LANDING");
    expect(resolveInitialPhase({ ...base, fastbootQuery: true })).toBe("LANDING");
  });

  it("shows cinema on first visit", () => {
    expect(
      shouldShowCinema({
        ...base,
        cinemaQuery: false,
        cinemaSeen: false,
      }),
    ).toBe(true);
  });

  it("skips cinema when fastboot", () => {
    expect(
      shouldShowCinema({
        ...base,
        fastbootQuery: true,
        cinemaSeen: false,
        cinemaQuery: false,
      }),
    ).toBe(false);
  });

  it("skips cinema when already seen", () => {
    expect(
      shouldShowCinema({
        ...base,
        cinemaSeen: true,
        cinemaQuery: false,
      }),
    ).toBe(false);
  });
});
