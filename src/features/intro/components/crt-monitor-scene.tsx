"use client";

import { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { CRT_MONITOR_MODEL_PATH } from "@/features/intro/constants";
import { CRTScreen } from "@/features/intro/components/crt-screen";
import { PowerLED } from "@/features/intro/components/power-led";

useGLTF.preload(CRT_MONITOR_MODEL_PATH);

const GLASS_MESH_NAME = "CRT_Monitor_monitor_glass_0";

interface CrtMonitorSceneProps {
  reveal: number;
  ledOn: boolean;
  crtOn: boolean;
  flicker: number;
  screenTexture: THREE.Texture | null;
  onPowerClick?: () => void;
}

export function CrtMonitorScene({
  reveal,
  ledOn,
  crtOn,
  flicker,
  screenTexture,
  onPowerClick,
}: CrtMonitorSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(CRT_MONITOR_MODEL_PATH);

  const monitor = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      if (mesh.name === GLASS_MESH_NAME) {
        mesh.visible = false;
        return;
      }

      const source = mesh.material;
      if (!source || Array.isArray(source)) return;

      if (source instanceof THREE.MeshStandardMaterial) {
        const mat = source.clone();
        mat.metalness = Math.min(source.metalness, 0.15);
        mat.roughness = Math.max(source.roughness, 0.82);
        mat.transparent = true;
        mat.opacity = 0;
        mesh.material = mat;
      }
    });
    return root;
  }, [scene]);

  useFrame(() => {
    monitor.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, reveal, 0.045);
          mat.transparent = reveal < 0.99;
        }
      }
    });

    if (groupRef.current) {
      const targetScale = THREE.MathUtils.lerp(0.94, 1, reveal);
      groupRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={monitor} />

      <CRTScreen crtOn={crtOn} flicker={flicker} screenTexture={screenTexture} />
      <PowerLED ledOn={ledOn} onClick={onPowerClick} />

      {/* Rim light — soft silhouette */}
      <directionalLight
        position={[-0.8, 0.6, -0.6]}
        intensity={0.35 * reveal}
        color="#3d5c45"
      />
      <directionalLight
        position={[0.6, -0.2, -0.5]}
        intensity={0.12 * reveal}
        color="#1a2830"
      />

      {/* LED warmth */}
      <pointLight
        position={[0.14, -0.21, 0.14]}
        intensity={ledOn ? 0.45 * reveal : 0}
        color="#ffb347"
        distance={0.35}
        decay={2}
      />

      {/* Screen phosphor glow — only after power on */}
      <pointLight
        position={[0, 0.015, 0.24]}
        intensity={crtOn ? 0.55 * reveal : 0}
        color="#9dff9d"
        distance={0.5}
        decay={2}
      />

      <ambientLight intensity={0.025 * reveal} />
    </group>
  );
}
