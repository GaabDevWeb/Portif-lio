"use client";

import { useEffect, useRef, useState } from "react";

import { BootExperience } from "@/features/boot/components/boot-experience";
import { resolveInitialPhase } from "@/features/boot/state/boot-controller";
import { Desktop } from "@/features/desktop/components/desktop";
import { ShutdownExperience } from "@/features/shutdown/components/shutdown-experience";
import { useCoarsePointer, useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSessionStore } from "@/providers/session-store";
import type { SessionPhase } from "@/types/root-os";

function readFastbootQuery(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("fastboot") === "1";
}

function BootGate() {
  const [ready, setReady] = useState(false);
  const [fastbootQuery] = useState(() => readFastbootQuery());
  const reducedMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const fastbootStored = useSessionStore((s) => s.fastboot);
  const phase = useSessionStore((s) => s.phase);
  const setPhase = useSessionStore((s) => s.setPhase);
  const [initialPhase, setInitialPhase] = useState<SessionPhase>("BLACKOUT");
  const initializedRef = useRef(false);
  const terminalOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void useSessionStore.persist.rehydrate();
    const resolved = resolveInitialPhase({
      fastbootStored,
      fastbootQuery,
      reducedMotion,
      coarsePointer,
    });
    setInitialPhase(resolved);

    if (!initializedRef.current) {
      initializedRef.current = true;
      const currentPhase = useSessionStore.getState().phase;
      if (currentPhase === "BLACKOUT") {
        setPhase(resolved);
      }
    }

    setReady(true);
  }, [coarsePointer, fastbootStored, fastbootQuery, reducedMotion, setPhase]);

  if (!ready) {
    return <div className="min-h-dvh bg-[var(--bg-void)]" aria-hidden />;
  }

  const showDesktop =
    phase === "SHELL" || phase === "APP_OPEN" || phase === "SHUTDOWN";
  const showBoot = phase === "BLACKOUT" || phase === "BOOT" || phase === "LOGIN";
  const showShutdown = phase === "SHUTDOWN";
  const introMode = showBoot && phase === "BLACKOUT";

  return (
    <>
      {(showDesktop || introMode) && (
        <Desktop introMode={introMode} terminalOverlayRef={terminalOverlayRef} />
      )}
      {showShutdown && <ShutdownExperience />}
      {showBoot && (
        <BootExperience
          initialPhase={initialPhase}
          fastbootQuery={fastbootQuery}
          terminalOverlayRef={terminalOverlayRef}
        />
      )}
    </>
  );
}

export function RootOSProvider({ children }: { children?: React.ReactNode }) {
  void children;
  return <BootGate />;
}
