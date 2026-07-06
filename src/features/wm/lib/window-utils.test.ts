import { describe, expect, it } from "vitest";

import {
  createDefaultWindow,
  cycleFocusApp,
  getNextFocusedApp,
} from "@/features/wm/lib/window-utils";

describe("window-utils", () => {
  it("creates cascaded windows", () => {
    const w0 = createDefaultWindow("profile", 10, 0);
    const w1 = createDefaultWindow("projects", 11, 1);
    expect(w1.x).toBeGreaterThan(w0.x);
    expect(w1.y).toBeGreaterThan(w0.y);
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
