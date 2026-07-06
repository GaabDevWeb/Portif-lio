"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { animateSkipFade } from "@/animations/boot/boot-timeline";
import { BootLogin } from "@/features/boot/components/boot-login";
import { BootPostSequence } from "@/features/boot/components/boot-post-sequence";
import { SkipHint, useSkipBoot } from "@/features/boot/components/skip-hint";
import { shouldUseReducedBoot } from "@/features/boot/state/boot-controller";
import { RootOSIntro } from "@/features/intro/components/root-os-intro";
import { track } from "@/lib/analytics/track";
import { useCoarsePointer, useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSessionStore } from "@/providers/session-store";
import type { SessionPhase } from "@/types/root-os";

interface BootExperienceProps {
  initialPhase: SessionPhase;
  fastbootQuery: boolean;
  terminalOverlayRef: React.RefObject<HTMLElement | null>;
}

type BootView = "intro" | "post" | "login" | "done";

export function BootExperience({
  initialPhase,
  fastbootQuery,
  terminalOverlayRef,
}: BootExperienceProps) {
  const reducedMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const setPhase = useSessionStore((s) => s.setPhase);
  const setUser = useSessionStore((s) => s.setUser);
  const markChapterComplete = useSessionStore((s) => s.markChapterComplete);

  const reducedBoot = shouldUseReducedBoot({
    fastbootStored: false,
    fastbootQuery,
    reducedMotion,
    coarsePointer,
  });

  const [view, setView] = useState<BootView>(() => {
    if (initialPhase === "SHELL") return "done";
    if (initialPhase === "LOGIN") return "login";
    if (initialPhase === "BOOT") return "post";
    return reducedBoot ? "post" : "intro";
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const skipEnabled = view === "intro" || view === "post";

  const enterShell = useCallback(() => {
    setUser("guest");
    markChapterComplete(1);
    markChapterComplete(2);
    setPhase("SHELL");
    setView("done");
  }, [markChapterComplete, setPhase, setUser]);

  const finishIntro = useCallback(() => {
    track("boot_complete");
    track("login_guest", { user: "guest" });
    enterShell();
  }, [enterShell]);

  const finishBoot = useCallback(() => {
    track("boot_complete");
    markChapterComplete(1);
    setPhase("LOGIN");
    setView("login");
  }, [markChapterComplete, setPhase]);

  const finishLogin = useCallback(
    (username: string) => {
      track("login_guest", { user: username });
      setUser(username);
      markChapterComplete(2);
      setPhase("SHELL");
      setView("done");
    },
    [markChapterComplete, setPhase, setUser],
  );

  const skipToShell = useCallback(() => {
    const runSkip = () => {
      track("fastboot_skip");
      markChapterComplete(1);
      markChapterComplete(2);
      setUser("guest");
      setPhase("SHELL");
      setView("done");
    };

    if (containerRef.current) {
      animateSkipFade(containerRef.current).eventCallback("onComplete", runSkip);
      return;
    }
    runSkip();
  }, [markChapterComplete, setPhase, setUser]);

  const skipVisible = useSkipBoot(skipEnabled, skipToShell);

  if (view === "done") return null;

  return (
    <div ref={containerRef} className="boot-experience">
      {view === "intro" && !reducedBoot && (
        <RootOSIntro
          reduced={false}
          terminalOverlayRef={terminalOverlayRef}
          onIntroComplete={finishIntro}
        />
      )}

      {view === "post" && (
        <BootPostSequence instant={reducedBoot} onComplete={finishBoot} />
      )}

      {view === "login" && <BootLogin onLogin={finishLogin} />}

      <SkipHint visible={skipVisible} onSkip={skipToShell} />
    </div>
  );
}
