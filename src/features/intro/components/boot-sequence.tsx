"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

import { INTRO_CAMERA } from "@/features/intro/constants";
import { BootRenderer } from "@/features/intro/components/boot-renderer";
import { CameraRig } from "@/features/intro/components/camera-rig";
import { ComputerScene } from "@/features/intro/components/computer-scene";
import { disposeObject3D, disposeWebGLRenderer } from "@/features/intro/lib/dispose-scene";
import type { CameraRigState } from "@/features/intro/types";

interface SceneContentProps {
  reveal: number;
  ledOn: boolean;
  crtOn: boolean;
  flicker: number;
  bootLines: string[];
  showCursor: boolean;
  cameraRig: CameraRigState;
  onTextureReady: (texture: THREE.CanvasTexture) => void;
  onPowerClick?: () => void;
  onDispose: () => void;
}

function SceneContent({
  reveal,
  ledOn,
  crtOn,
  flicker,
  bootLines,
  showCursor,
  cameraRig,
  onTextureReady,
  onPowerClick,
  onDispose,
}: SceneContentProps) {
  const { scene, gl } = useThree();
  const [screenTexture, setScreenTexture] = useState<THREE.CanvasTexture | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const handleLocalTexture = useCallback(
    (texture: THREE.CanvasTexture) => {
      screenTextureRef.current = texture;
      setScreenTexture(texture);
      onTextureReady(texture);
    },
    [onTextureReady],
  );

  useEffect(() => {
    return () => {
      disposeObject3D(scene);
      screenTextureRef.current?.dispose();
      screenTextureRef.current = null;
      disposeWebGLRenderer(gl);
      onDispose();
    };
  }, [gl, onDispose, scene]);

  return (
    <>
      <color attach="background" args={["#030303"]} />
      <CameraRig rig={cameraRig} />
      <ComputerScene
        reveal={reveal}
        ledOn={ledOn}
        crtOn={crtOn}
        flicker={flicker}
        screenTexture={screenTexture}
        onPowerClick={onPowerClick}
      />
      <Sparkles count={24} scale={[5, 3, 2]} size={1.2} speed={0.12} opacity={0.18 * reveal} color="#9dff9d" />
      <BootRenderer
        lines={bootLines}
        showCursor={showCursor}
        onTextureReady={handleLocalTexture}
      />
    </>
  );
}

interface BootSequenceProps {
  active: boolean;
  reveal: number;
  ledOn: boolean;
  crtOn: boolean;
  flicker: number;
  bootLines: string[];
  showCursor: boolean;
  cameraRig: CameraRigState;
  onTextureReady: (texture: THREE.CanvasTexture) => void;
  onPowerClick?: () => void;
  onDispose: () => void;
}

export function BootSequence({
  active,
  reveal,
  ledOn,
  crtOn,
  flicker,
  bootLines,
  showCursor,
  cameraRig,
  onTextureReady,
  onPowerClick,
  onDispose,
}: BootSequenceProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--bg-void)]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: INTRO_CAMERA.initial.position,
          fov: INTRO_CAMERA.initial.fov,
          near: 0.01,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            reveal={reveal}
            ledOn={ledOn}
            crtOn={crtOn}
            flicker={flicker}
            bootLines={bootLines}
            showCursor={showCursor}
            cameraRig={cameraRig}
            onTextureReady={onTextureReady}
            onPowerClick={onPowerClick}
            onDispose={onDispose}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
