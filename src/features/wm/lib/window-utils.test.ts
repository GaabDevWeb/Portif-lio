import { describe, expect, it } from "vitest";

import {
  clampWindowPosition,
  createDefaultWindow,
  cycleFocusApp,
  getNextFocusedApp,
  placeWindowAtPointer,
} from "@/features/wm/lib/window-utils";

describe("window-utils", () => {
  it("creates cascaded windows near pointer", () => {
    const pointer = { x: 400, y: 300 };
    const w0 = createDefaultWindow("profile", 10, 0, pointer);
    const w1 = createDefaultWindow("projects", 11, 1, pointer);
    expect(w1.x).toBeGreaterThanOrEqual(w0.x);
    expect(w1.y).toBeGreaterThanOrEqual(w0.y);
  });

  it("creates terminal as a rectangular floating window", () => {
    const win = createDefaultWindow("terminal", 10, 0, { x: 500, y: 400 });
    expect(win.width).toBeLessThanOrEqual(720);
    expect(win.height).toBeGreaterThanOrEqual(360);
    expect(win.width / win.height).toBeLessThan(2);
  });

  it("clamps window position inside viewport", () => {
    const clamped = clampWindowPosition(-100, -100, 700, 520);
    expect(clamped.x).toBeGreaterThanOrEqual(8);
    expect(clamped.y).toBeGreaterThanOrEqual(48);
  });

  it("centers placement on pointer", () => {
    const placed = placeWindowAtPointer(700, 520, { x: 600, y: 400 }, 0);
    expect(placed.x).toBeGreaterThan(0);
    expect(placed.y).toBeGreaterThan(0);
  });

  it("resolves next focus after close", () => {
    expect(getNextFocusedApp(["profile", "projects"], "projects")).toBe(
      "profile",
    );
  });

  it("cycles focus with alt-tab logic", () => {
    expect(cycleFocusApp(["profile", "projects"], "profile")).toBe("projects");
    expect(cycleFocusApp(["profile", "projects"], "projects")).toBe("profile");
  });
});
