"use client";

import { useEffect, useState } from "react";

import { BOOT_TIMING } from "@/constants/boot";

interface SkipHintProps {
  visible: boolean;
  onSkip: () => void;
}

export function SkipHint({ visible, onSkip }: SkipHintProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onSkip}
      className="fixed bottom-6 right-6 z-[70] cursor-pointer rounded-sm border border-[var(--ui-border)] bg-[var(--ui-chrome)] px-3 py-1.5 font-mono text-xs text-[var(--phosphor-dim)] hover:text-[var(--phosphor-primary)]"
    >
      Skip boot — Esc
    </button>
  );
}

export function useSkipBoot(enabled: boolean, onSkip: () => void): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => setVisible(true), BOOT_TIMING.skipAvailableAfter);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onSkip, visible]);

  return visible;
}
