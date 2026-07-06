"use client";

import { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { COMPUTER_MODEL_PATH } from "@/features/intro/constants";
import { CRTScreen } from "@/features/intro/components/crt-screen";
import { PowerLED } from "@/features/intro/components/power-led";

useGLTF.preload(COMPUTER_MODEL_PATH);

interface ComputerSceneProps {
  reveal: number;
  ledOn: boolean;
  crtOn: boolean;
  flicker: number;
  screenTexture: THREE.Texture | null;
  onPowerClick?: () => void;
}

export function ComputerScene({
  reveal,
  ledOn,
  crtOn,
  flicker,
  screenTexture,
  onPowerClick,
}: ComputerSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(COMPUTER_MODEL_PATH);

  const cloned = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = mesh.material;
      if (!source || Array.isArray(source)) return;
      if (!(source instanceof THREE.MeshStandardMaterial)) return;
      const mat = source.clone();
      mat.metalness = Math.min(source.metalness, 0.25);
      mat.roughness = Math.max(source.roughness, 0.75);
      mat.transparent = true;
      mat.opacity = 0;
      mesh.material = mat;
    });
    return root;
  }, [scene]);

  useFrame(() => {
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, reveal, 0.06);
          mat.transparent = reveal < 0.99;
        }
      }
    });
  });

  return (
    <group ref={groupRef} scale={2.2} position={[0, -0.35, 0]}>
      <primitive object={cloned} />

      <CRTScreen crtOn={crtOn} flicker={flicker} screenTexture={screenTexture} />
      <PowerLED ledOn={ledOn} onClick={onPowerClick} />

      {/* Rim light — extremely subtle */}
      <pointLight
        position={[-1.5, 0.8, 1.2]}
        intensity={0.04 * reveal}
        color="#4a6a4a"
      />
      <pointLight
        position={[0.3, 0.2, 0.35]}
        intensity={ledOn ? 0.35 * reveal : 0.02 * reveal}
        color="#ffb347"
        distance={2.5}
      />
      <pointLight
        position={[0, 0.12, 0.25]}
        intensity={crtOn ? 0.35 * reveal : 0}
        color="#9dff9d"
        distance={1.2}
      />
      <ambientLight intensity={0.04 * reveal} />
    </group>
  );
}
