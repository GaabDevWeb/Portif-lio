"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { SCREEN_TARGET } from "@/features/intro/constants";
import {
  crtScreenFragmentShader,
  crtScreenVertexShader,
} from "@/features/intro/shaders/crt-screen-shader";

interface CRTScreenProps {
  crtOn: boolean;
  flicker: number;
  screenTexture: THREE.Texture | null;
}

export function CRTScreen({ crtOn, flicker, screenTexture }: CRTScreenProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uFlicker.value = flicker;
    materialRef.current.uniforms.uPower.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uPower.value,
      crtOn ? 1 : 0,
      0.08,
    );
    if (screenTexture) {
      materialRef.current.uniforms.uTexture.value = screenTexture;
      materialRef.current.uniforms.uHasTexture.value = true;
    }
  });

  return (
    <mesh position={SCREEN_TARGET.position} rotation={SCREEN_TARGET.rotation}>
      <planeGeometry args={[SCREEN_TARGET.size[0], SCREEN_TARGET.size[1]]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={crtScreenVertexShader}
        fragmentShader={crtScreenFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uFlicker: { value: 0 },
          uPower: { value: 0 },
          uScanlineIntensity: { value: 0.1 },
          uChromatic: { value: 0.6 },
          uTexture: { value: null },
          uHasTexture: { value: false },
        }}
      />
    </mesh>
  );
}
