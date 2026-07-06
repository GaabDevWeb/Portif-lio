"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RootOSIntro } from "@/features/intro/components/root-os-intro";
import { SkipHint, useSkipBoot } from "@/features/boot/components/skip-hint";
import { shouldShowCinema } from "@/features/boot/state/boot-controller";
import { track } from "@/lib/analytics/track";
import { useCoarsePointer, useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSessionStore } from "@/providers/session-store";

interface CinemaOverlayProps {
  fastbootQuery: boolean;
  cinemaQuery: boolean;
}

export function CinemaOverlay({ fastbootQuery, cinemaQuery }: CinemaOverlayProps) {
  const reducedMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const fastbootStored = useSessionStore((s) => s.fastboot);
  const cinemaSeen = useSessionStore((s) => s.flags.cinemaSeen);
  const markCinemaSeen = useSessionStore((s) => s.markCinemaSeen);
  const setPhase = useSessionStore((s) => s.setPhase);

  const [active, setActive] = useState(false);
  const terminalOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = shouldShowCinema({
      fastbootStored,
      fastbootQuery,
      cinemaQuery,
      reducedMotion,
      coarsePointer,
      cinemaSeen,
    });
    setActive(show);
    if (show) setPhase("CINEMA");
  }, [
    cinemaQuery,
    cinemaSeen,
    coarsePointer,
    fastbootQuery,
    fastbootStored,
    reducedMotion,
    setPhase,
  ]);

  const finishCinema = useCallback(() => {
    track("boot_complete");
    markCinemaSeen();
    setPhase("LANDING");
    setActive(false);
  }, [markCinemaSeen, setPhase]);

  const skipCinema = useCallback(() => {
    track("fastboot_skip");
    markCinemaSeen();
    setPhase("LANDING");
    setActive(false);
  }, [markCinemaSeen, setPhase]);

  const skipVisible = useSkipBoot(active, skipCinema);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50">
      <RootOSIntro
        reduced={reducedMotion || coarsePointer}
        terminalOverlayRef={terminalOverlayRef}
        onIntroComplete={finishCinema}
      />
      <SkipHint visible={skipVisible} onSkip={skipCinema} />
    </div>
  );
}
