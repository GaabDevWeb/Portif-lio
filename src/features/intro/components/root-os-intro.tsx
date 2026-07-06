"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { INTRO_TIMING } from "@/features/intro/constants";
import { BootSequence } from "@/features/intro/components/boot-sequence";
import { useIntroController } from "@/features/intro/hooks/use-intro-controller";
import {
  createCameraTransitionTimeline,
  createTerminalRevealTween,
} from "@/features/intro/timelines/intro-timelines";

interface RootOSIntroProps {
  reduced: boolean;
  terminalOverlayRef: React.RefObject<HTMLElement | null>;
  onIntroComplete: () => void;
}

export function RootOSIntro({
  reduced,
  terminalOverlayRef,
  onIntroComplete,
}: RootOSIntroProps) {
  const [webglActive, setWebglActive] = useState(true);
  const transitionStartedRef = useRef(false);

  const controller = useIntroController({ reduced });

  const {
    chapter,
    reveal,
    ledOn,
    crtOn,
    flicker,
    bootLines,
    showCursor,
    cameraRig,
    setCameraRig,
    handleTextureReady,
    runPowerOn,
    setChapter,
  } = controller;

  const runCameraTransition = useCallback(() => {
    if (transitionStartedRef.current) return;
    transitionStartedRef.current = true;
    setChapter("transition");

    let finished = false;
    const finishTransition = () => {
      if (finished) return;
      finished = true;
      window.setTimeout(() => {
        setWebglActive(false);
        setChapter("complete");
        onIntroComplete();
      }, INTRO_TIMING.disposeDelayMs);
    };

    createCameraTransitionTimeline(cameraRig, setCameraRig, finishTransition);
    window.setTimeout(finishTransition, INTRO_TIMING.cameraTransitionMs + 400);

    if (terminalOverlayRef.current) {
      createTerminalRevealTween(terminalOverlayRef.current);
    }
  }, [cameraRig, onIntroComplete, setCameraRig, setChapter, terminalOverlayRef]);

  useEffect(() => {
    if (chapter !== "scroll-wait") return;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;
      event.preventDefault();
      runCameraTransition();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        runCameraTransition();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [chapter, runCameraTransition]);

  useEffect(() => {
    if (chapter !== "power") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        runPowerOn();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chapter, runPowerOn]);

  useEffect(() => {
    document.body.style.overflow = chapter === "complete" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [chapter]);

  if (reduced) return null;

  return (
    <div data-intro-chapter={chapter}>
      {chapter === "blackout" && (
        <div className="fixed inset-0 z-[70] bg-[var(--bg-void)]" aria-hidden />
      )}

      <BootSequence
        active={webglActive && chapter !== "blackout" && chapter !== "complete"}
        reveal={reveal}
        ledOn={ledOn}
        crtOn={crtOn}
        flicker={flicker}
        bootLines={bootLines}
        showCursor={showCursor}
        cameraRig={cameraRig}
        onTextureReady={handleTextureReady}
        onPowerClick={chapter === "power" ? runPowerOn : undefined}
        onDispose={() => {}}
      />

      {chapter === "power" && !ledOn && (
        <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[65] flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={runPowerOn}
            className="pointer-events-auto cursor-pointer rounded-sm border border-[var(--ui-border)] bg-[var(--ui-chrome)] px-4 py-2 font-mono text-xs text-[var(--phosphor-primary)] hover:brightness-110"
          >
            POWER ON — click or Enter
          </button>
        </div>
      )}

      {chapter === "scroll-wait" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[65] flex justify-center">
          <p className="animate-pulse font-mono text-xs text-[var(--phosphor-dim)]">
            Scroll to enter ROOT OS ↓
          </p>
        </div>
      )}
    </div>
  );
}
