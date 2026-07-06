"use client";

import { useRef } from "react";
import * as THREE from "three";

import { LED_POSITION } from "@/features/intro/constants";

interface PowerLEDProps {
  ledOn: boolean;
  onClick?: () => void;
}

export function PowerLED({ ledOn, onClick }: PowerLEDProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  return (
    <group position={LED_POSITION}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          ref={matRef}
          color={ledOn ? "#ffb347" : "#2a1a08"}
          emissive={ledOn ? "#ffb347" : "#000000"}
          emissiveIntensity={ledOn ? 4 : 0}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {onClick && (
        <mesh position={[0, 0, 0.015]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      )}
    </group>
  );
}
