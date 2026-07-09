declare module "gifuct-js" {
  export interface GifFrame {
    dims: { width: number; height: number; left: number; top: number };
    patch: Uint8ClampedArray;
    delay: number;
    disposalType: number;
  }

  export interface ParsedGif {
    lsd: { width: number; height: number };
    loopCount?: number;
  }

  export function parseGIF(buffer: ArrayBuffer): ParsedGif;
  export function decompressFrames(gif: ParsedGif, buildPatch: boolean): GifFrame[];
}
