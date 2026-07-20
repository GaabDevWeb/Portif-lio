import { describe, expect, it } from "vitest";

import {
  applyWeightsToCharset,
  orderCharsetByWeight,
  weightForChar,
} from "@/features/ascii-interaction/image-pipeline/char-weights";

describe("char-weights", () => {
  it("orders light to solid", () => {
    const ordered = orderCharsetByWeight("@.%█", {
      ".": 10,
      "%": 50,
      "@": 80,
      "█": 100,
    });
    expect(ordered).toBe(".%@█");
  });

  it("applyWeightsToCharset returns usable charset", () => {
    const out = applyWeightsToCharset("█▓▒░", {
      "░": 40,
      "▒": 60,
      "▓": 80,
      "█": 100,
    });
    expect(out[0]).toBe("░");
    expect(out.at(-1)).toBe("█");
    expect(weightForChar("█")).toBe(100);
  });
});
