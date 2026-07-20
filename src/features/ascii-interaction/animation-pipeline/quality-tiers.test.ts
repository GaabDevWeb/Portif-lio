import { describe, expect, it } from "vitest";

import { DEFAULT_ANIMATION_PIPELINE_OPTIONS } from "@/features/ascii-interaction/animation-pipeline/types";
import { applyAnimationQualityTier } from "@/features/ascii-interaction/animation-pipeline/quality-tiers";

describe("animation quality tiers", () => {
  it("performance enables adaptive FPS and caps width", () => {
    const out = applyAnimationQualityTier("performance", DEFAULT_ANIMATION_PIPELINE_OPTIONS);
    expect(out.qualityTier).toBe("performance");
    expect(out.temporal.adaptiveFps).toBe(true);
    expect(out.pipeline.width).toBeLessThanOrEqual(72);
  });

  it("maximum widens grid and disables adaptive skip", () => {
    const out = applyAnimationQualityTier("maximum", DEFAULT_ANIMATION_PIPELINE_OPTIONS);
    expect(out.qualityTier).toBe("maximum");
    expect(out.temporal.adaptiveFps).toBe(false);
    expect(out.pipeline.width).toBeGreaterThanOrEqual(140);
    expect(out.workerCount).toBe(1);
  });
});
