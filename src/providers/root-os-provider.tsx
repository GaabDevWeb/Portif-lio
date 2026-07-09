"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { CinemaOverlay } from "@/features/shell/components/cinema-overlay";
import { RootOSShell } from "@/features/shell/components/root-os-shell";
import { ShutdownExperience } from "@/features/shutdown/components/shutdown-experience";
import { useSessionStore } from "@/providers/session-store";

function readQueryFlag(name: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}

function AppGate() {
  const [ready, setReady] = useState(false);
  const [fastbootQuery] = useState(() => readQueryFlag("fastboot"));
  const [cinemaQuery] = useState(() => readQueryFlag("cinema"));
  const phase = useSessionStore((s) => s.phase);
  const initializedRef = useRef(false);

  useEffect(() => {
    void useSessionStore.persist.rehydrate();

    if (!initializedRef.current) {
      initializedRef.current = true;
      const current = useSessionStore.getState().phase;
      if (
        current === "BLACKOUT" ||
        current === "BOOT" ||
        current === "LOGIN" ||
        current === "SHELL"
      ) {
        useSessionStore.getState().setPhase("LANDING");
      }
    }

    setReady(true);
  }, []);

  if (!ready) {
    return <div className="min-h-dvh bg-[var(--bg-void)]" aria-hidden />;
  }

  const showShell = phase !== "SHUTDOWN";
  const showShutdown = phase === "SHUTDOWN";

  return (
    <>
      {showShell && <RootOSShell />}
      {showShutdown && <ShutdownExperience />}
      <CinemaOverlay fastbootQuery={fastbootQuery} cinemaQuery={cinemaQuery} />
    </>
  );
}

function useIsLabRoute(): boolean | null {
  const [isLab, setIsLab] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLab(window.location.pathname.startsWith("/labs"));
  }, []);

  return isLab;
}

export function RootOSProvider({ children }: { children?: React.ReactNode }) {
<<<<<<< Updated upstream
  const pathname = usePathname();
  const isProjectRoute = pathname?.startsWith("/projects/");
  const isLabRoute = pathname?.startsWith("/labs/");

  if (isProjectRoute || isLabRoute) {
=======
  const isLab = useIsLabRoute();

  if (isLab === null) {
    return <div className="min-h-dvh bg-[var(--bg-void)]" aria-hidden />;
  }

  if (isLab) {
>>>>>>> Stashed changes
    return <>{children}</>;
  }

  return <AppGate />;
}
