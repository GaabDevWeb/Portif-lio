"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  animateCrtOff,
  animateLedOff,
  animateProcessKill,
  INSERT_COIN_MS,
  sleep,
} from "@/animations/shutdown/shutdown-sequence";
import { track } from "@/lib/analytics/track";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSessionStore } from "@/providers/session-store";

type ShutdownPhase = "kill" | "sync" | "crt" | "coin" | "halted";

export function ShutdownExperience() {
  const reducedMotion = useReducedMotion();
  const openApps = useSessionStore((s) => s.openApps);
  const closeApp = useSessionStore((s) => s.closeApp);
  const rebootFromShutdown = useSessionStore((s) => s.rebootFromShutdown);

  const overlayRef = useRef<HTMLDivElement>(null);
  const crtRef = useRef<HTMLDivElement>(null);
  const ledRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<ShutdownPhase>("kill");
  const [status, setStatus] = useState("Stopping processes...");
  const [showCoin, setShowCoin] = useState(false);
  const [halted, setHalted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    async function runShutdown() {
      setPhase("kill");
      setStatus("Stopping processes...");

      const apps = [...useSessionStore.getState().openApps].reverse();
      for (const appId of apps) {
        if (cancelled) return;
        await animateProcessKill(appId, reducedMotion);
        closeApp(appId);
        await sleep(reducedMotion ? 0 : 100);
      }

      setPhase("sync");
      setStatus("Syncing filesystems...");
      await sleep(reducedMotion ? 200 : 800);

      setPhase("crt");
      setStatus("Powering off display...");
      if (crtRef.current) {
        await animateCrtOff(crtRef.current, reducedMotion);
      }

      if (ledRef.current) {
        await animateLedOff(ledRef.current, reducedMotion);
      }

      setPhase("coin");
      setShowCoin(true);
      setStatus("");
      await sleep(reducedMotion ? 400 : INSERT_COIN_MS);
      setShowCoin(false);

      setPhase("halted");
      setHalted(true);
      setStatus("System halted.");
      track("shutdown_complete");

      if (overlayRef.current && !reducedMotion) {
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.4 });
      }
    }

    void runShutdown();

    return () => {
      cancelled = true;
    };
  }, [closeApp, reducedMotion]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-void)]"
      role="dialog"
      aria-label="System shutdown"
      aria-live="polite"
    >
      <div
        ref={crtRef}
        className="crt-screen pointer-events-none absolute inset-0 bg-[var(--bg-terminal)] opacity-90"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--phosphor-dim)]">
          <span
            ref={ledRef}
            className="inline-flex h-2 w-2 rounded-full bg-[var(--amber-led)]"
            aria-hidden
          />
          <span>ROOT OS</span>
        </div>

        {!halted && status && (
          <p className="font-mono text-sm text-[var(--phosphor-primary)]">{status}</p>
        )}

        {showCoin && (
          <p className="animate-pulse font-mono text-lg tracking-widest text-[var(--phosphor-dim)]">
            INSERT COIN
          </p>
        )}

        {halted && (
          <div className="space-y-4">
            <p className="font-mono text-sm text-[var(--phosphor-dim)]">
              {status}
            </p>
            <p className="font-mono text-xs text-[var(--phosphor-dim)]">
              Thank you for exploring ROOT OS.
            </p>
            <button
              type="button"
              onClick={() => rebootFromShutdown()}
              className="cursor-pointer rounded-sm border border-[var(--ui-border)] px-4 py-2 font-mono text-sm text-[var(--phosphor-primary)] hover:border-[var(--phosphor-primary)]"
            >
              Power on
            </button>
          </div>
        )}

        {phase === "kill" && openApps.length > 0 && (
          <p className="font-mono text-xs text-[var(--phosphor-dim)]">
            {openApps.length} process(es) remaining
          </p>
        )}
      </div>
    </div>
  );
}
