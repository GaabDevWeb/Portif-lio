"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  INTRO_BOOT_MODULES,
  INTRO_CAMERA,
  INTRO_POST_LINES,
  INTRO_TIMING,
} from "@/features/intro/constants";
import {
  createCrtFlickerTimeline,
  createRevealTween,
} from "@/features/intro/timelines/intro-timelines";
import type { CameraRigState, IntroChapter } from "@/features/intro/types";

interface UseIntroControllerOptions {
  reduced: boolean;
}

export function useIntroController({ reduced }: UseIntroControllerOptions) {
  const [chapter, setChapter] = useState<IntroChapter>("blackout");
  const [reveal, setReveal] = useState(0);
  const [ledOn, setLedOn] = useState(false);
  const [crtOn, setCrtOn] = useState(false);
  const [flicker, setFlicker] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(false);
  const [loginComplete, setLoginComplete] = useState(false);
  const [screenTexture, setScreenTexture] = useState<THREE.Texture | null>(null);
  const [cameraRig, setCameraRig] = useState<CameraRigState>({
    position: [...INTRO_CAMERA.initial.position],
    fov: INTRO_CAMERA.initial.fov,
    lookAt: [...INTRO_CAMERA.initial.lookAt],
  });

  const powerStartedRef = useRef(false);

  const handleTextureReady = useCallback((texture: THREE.CanvasTexture) => {
    setScreenTexture(texture);
  }, []);

  const allBootLines = useMemo(() => {
    const moduleLines = INTRO_BOOT_MODULES.map(
      (mod) => `[ ok ] ${mod.label.padEnd(26, ".")} ${mod.detail}`,
    );
    return [...INTRO_POST_LINES, "", ...moduleLines, "", "ROOT OS v0.1.0 ready."];
  }, []);

  const runPowerOn = useCallback(() => {
    if (powerStartedRef.current || chapter !== "power") return;
    powerStartedRef.current = true;
    setLedOn(true);

    window.setTimeout(() => {
      const tl = createCrtFlickerTimeline(setFlicker, () => {
        setFlicker(0);
        setCrtOn(true);
        setChapter("post");
      });
      window.setTimeout(() => {
        setFlicker(0);
        setCrtOn(true);
        setChapter((current) => (current === "power" ? "post" : current));
        tl.kill();
      }, INTRO_TIMING.crtFlickerMs * 3 + 200);
    }, INTRO_TIMING.ledDelayMs);
  }, [chapter]);

  useEffect(() => {
    if (reduced || chapter !== "blackout") return;
    const timer = window.setTimeout(() => setChapter("reveal"), INTRO_TIMING.blackoutMs);
    return () => window.clearTimeout(timer);
  }, [chapter, reduced]);

  useEffect(() => {
    if (chapter !== "reveal") return;
    const tween = createRevealTween(setReveal);
    const timer = window.setTimeout(() => setChapter("power"), INTRO_TIMING.revealMs);
    tween.eventCallback("onComplete", () => {
      window.clearTimeout(timer);
      setChapter("power");
    });
    return () => {
      tween.kill();
      window.clearTimeout(timer);
    };
  }, [chapter]);

  useEffect(() => {
    if (chapter !== "post") return;

    let index = 0;
    let cancelled = false;
    setBootLines([]);
    setShowCursor(true);

    const pushNext = () => {
      if (cancelled) return;
      if (index >= allBootLines.length) {
        window.setTimeout(() => {
          if (!cancelled) setChapter("boot");
        }, INTRO_TIMING.bootPauseMs);
        return;
      }
      const line = allBootLines[index];
      setBootLines((prev) => [...prev, line]);
      index += 1;
      const delay =
        index <= INTRO_POST_LINES.length + 1
          ? INTRO_TIMING.postLineMs
          : INTRO_TIMING.moduleLineMs;
      window.setTimeout(pushNext, delay);
    };

    const startTimer = window.setTimeout(pushNext, INTRO_TIMING.bootPauseMs / 2);
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setChapter("boot");
    }, 8000);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [allBootLines, chapter]);

  useEffect(() => {
    if (chapter !== "boot") return;

    let cancelled = false;
    const loginSequence = [
      "",
      "devbox.local login:",
      "guest",
      "Last login: today on tty1",
      "Welcome, guest. Type 'help' to begin.",
      "guest@devbox.local:~$ ",
    ];

    let index = 0;

    const typeNext = () => {
      if (cancelled) return;
      if (index >= loginSequence.length) {
        setLoginComplete(true);
        window.setTimeout(() => {
          if (!cancelled) setChapter("scroll-wait");
        }, INTRO_TIMING.scrollHintMs);
        return;
      }
      const line = loginSequence[index];
      if (line) {
        setBootLines((prev) => {
          const postEnd = prev.findIndex((l) => l.includes("ROOT OS v0.1.0 ready"));
          const base = postEnd >= 0 ? prev.slice(0, postEnd + 1) : prev;
          const loginSoFar = loginSequence.slice(0, index + 1).filter(Boolean);
          return [...base, ...loginSoFar];
        });
      }
      index += 1;
      window.setTimeout(typeNext, INTRO_TIMING.loginTypeMs * 4);
    };

    const startTimer = window.setTimeout(typeNext, 400);
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setChapter("scroll-wait");
    }, 6000);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [chapter]);

  return {
    chapter,
    reveal,
    ledOn,
    crtOn,
    flicker,
    bootLines,
    showCursor,
    loginComplete,
    screenTexture,
    cameraRig,
    setCameraRig,
    handleTextureReady,
    runPowerOn,
    setChapter,
  };
}
