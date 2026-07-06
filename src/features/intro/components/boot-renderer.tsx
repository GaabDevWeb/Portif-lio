"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const WIDTH = 1024;
const HEIGHT = 768;

interface BootRendererProps {
  lines: string[];
  showCursor: boolean;
  onTextureReady: (texture: THREE.CanvasTexture) => void;
}

export function BootRenderer({ lines, showCursor, onTextureReady }: BootRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const blinkRef = useRef(true);
  const onReadyRef = useRef(onTextureReady);
  onReadyRef.current = onTextureReady;

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;
    onReadyRef.current(texture);
  }, []);

  useEffect(() => {
    const blink = window.setInterval(() => {
      blinkRef.current = !blinkRef.current;
    }, 530);
    return () => window.clearInterval(blink);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#030a03";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.font = "22px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#9dff9d";
    ctx.textBaseline = "top";

    let y = 48;
    const lineHeight = 30;

    for (const line of lines) {
      ctx.fillText(line, 48, y);
      y += lineHeight;
    }

    if (showCursor && blinkRef.current) {
      const lastLine = lines.at(-1) ?? "";
      const cursorX = 48 + ctx.measureText(lastLine).width + 4;
      ctx.fillRect(cursorX, y - lineHeight + 4, 12, 22);
    }

    texture.needsUpdate = true;
  }, [lines, showCursor]);

  return null;
}
