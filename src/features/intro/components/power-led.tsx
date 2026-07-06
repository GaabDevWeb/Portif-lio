"use client";

import { useRef } from "react";
import * as THREE from "three";

/** LED on pack_1 lower-right bezel (model space). */
const LED_POSITION: [number, number, number] = [0.34, -0.02, 0.24];

interface PowerLEDProps {
  ledOn: boolean;
  onClick?: () => void;
}

export function PowerLED({ ledOn, onClick }: PowerLEDProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  return (
    <group position={LED_POSITION} scale={2.2}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color={ledOn ? "#ffb347" : "#2a1a08"}
          emissive={ledOn ? "#ffb347" : "#000000"}
          emissiveIntensity={ledOn ? 3.5 : 0}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {onClick && (
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      )}
    </group>
  );
}
