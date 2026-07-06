"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { BOOT_TIMING } from "@/constants/boot";
import {
  animateCameraPush,
  animateFlicker,
  animateLedPulse,
} from "@/animations/boot/boot-timeline";
import { CrtScene } from "@/features/boot/components/crt-scene";

interface BootCinemaProps {
  onCinemaComplete: () => void;
}

export function BootCinema({ onCinemaComplete }: BootCinemaProps) {
  const [ledOn, setLedOn] = useState(false);
  const [flicker, setFlicker] = useState(0);
  const [cameraZ, setCameraZ] = useState(6);
  const [powerReady, setPowerReady] = useState(false);
  const ledRef = useRef<HTMLDivElement>(null);
  const cameraProxy = useRef({ position: { z: 6 } });
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setPowerReady(true), BOOT_TIMING.blackoutHold);
    return () => window.clearTimeout(timer);
  }, []);

  const runPowerSequence = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setLedOn(true);

    if (ledRef.current) {
      animateLedPulse(ledRef.current);
    }

    window.setTimeout(() => {
      animateFlicker(setFlicker, () => {
        cameraProxy.current.position.z = cameraZ;
        animateCameraPush(cameraProxy.current, 3.2);
        const interval = window.setInterval(() => {
          setCameraZ(cameraProxy.current.position.z);
        }, 16);

        window.setTimeout(() => {
          window.clearInterval(interval);
          onCinemaComplete();
        }, BOOT_TIMING.cameraPush);
      });
    }, BOOT_TIMING.ledOn);
  }, [cameraZ, onCinemaComplete]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (powerReady && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        runPowerSequence();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [powerReady, runPowerSequence]);

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--bg-void)]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, cameraZ], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <CrtScene
            ledOn={ledOn}
            flicker={flicker}
            cameraZ={cameraZ}
            showParticles
            onPowerClick={powerReady ? runPowerSequence : undefined}
          />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-3">
        <div
          ref={ledRef}
          className="h-3 w-3 rounded-full bg-[var(--amber-led)] opacity-20 shadow-[0_0_12px_var(--amber-led)]"
          aria-hidden
        />
        {powerReady && !startedRef.current && (
          <button
            type="button"
            onClick={runPowerSequence}
            className="pointer-events-auto cursor-pointer rounded-sm border border-[var(--ui-border)] bg-[var(--ui-chrome)] px-4 py-2 font-mono text-xs text-[var(--phosphor-primary)] hover:brightness-110"
          >
            POWER ON — click or Enter
          </button>
        )}
      </div>
    </div>
  );
}
