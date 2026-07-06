"use client";

import { useRef } from "react";
import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { crtFragmentShader, crtVertexShader } from "@/features/boot/shaders/crt-shader";

interface CrtSceneProps {
  ledOn: boolean;
  flicker: number;
  cameraZ: number;
  showParticles: boolean;
  onPowerClick?: () => void;
}

function CrtScreen({ flicker }: { flicker: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uFlicker.value = flicker;
  });

  return (
    <mesh position={[0, 0.35, 0.16]}>
      <planeGeometry args={[2.4, 1.6, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={crtVertexShader}
        fragmentShader={crtFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uFlicker: { value: 0 },
          uScanlineIntensity: { value: 0.12 },
          uTexture: { value: null },
          uHasTexture: { value: false },
        }}
      />
    </mesh>
  );
}

function MonitorBody() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 2.4, 0.35]} />
        <meshStandardMaterial color="#141414" roughness={0.85} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.35, 0.02]}>
        <boxGeometry args={[2.55, 1.7, 0.08]} />
        <meshStandardMaterial color="#050805" roughness={0.95} />
      </mesh>
    </group>
  );
}

function PowerLed({ ledOn }: { ledOn: boolean }) {
  return (
    <mesh position={[1.35, -0.95, 0.2]}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial
        color={ledOn ? "#ffb347" : "#3a2a10"}
        emissive={ledOn ? "#ffb347" : "#000000"}
        emissiveIntensity={ledOn ? 2.5 : 0}
      />
    </mesh>
  );
}

export function CrtScene({
  ledOn,
  flicker,
  cameraZ,
  showParticles,
  onPowerClick,
}: CrtSceneProps) {
  useFrame(({ camera }) => {
    camera.position.z = cameraZ;
    camera.lookAt(0, 0.2, 0);
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 1.5, 2]} intensity={ledOn ? 0.8 : 0.05} color="#ffb347" />
      <MonitorBody />
      <CrtScreen flicker={flicker} />
      <PowerLed ledOn={ledOn} />
      {showParticles && (
        <Sparkles count={30} scale={[8, 5, 2]} size={1.5} speed={0.15} opacity={0.25} color="#9dff9d" />
      )}
      {onPowerClick && (
        <mesh
          position={[1.35, -0.95, 0.25]}
          onClick={(event) => {
            event.stopPropagation();
            onPowerClick();
          }}
        >
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </>
  );
}
