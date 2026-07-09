import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import { blendMatrices } from "./blend-matrix";
import type { OnionSkinLayer } from "./onion-skin";

/**
 * Demo composite: fold onion layers into the current matrix via weighted luminance blend.
 * Not a true multi-layer canvas — enough for Animate-tab preview.
 */
export function composeOnionPreview(
  current: AsciiMatrix,
  layers: OnionSkinLayer[],
): AsciiMatrix {
  if (layers.length === 0) return current;

  let result = current;
  for (const layer of layers) {
    const t = Math.min(1, Math.max(0, layer.opacity));
    // Blend toward ghost: result = lerp(currentComposite, ghost, opacity)
    result = blendMatrices(result, layer.matrix, t, result.charset);
  }
  return result;
}
