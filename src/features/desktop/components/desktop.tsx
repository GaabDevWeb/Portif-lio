"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Power } from "lucide-react";
import { motion } from "motion/react";

import { CHROME, SYSTEM } from "@/constants/system";
import { APP_TITLES } from "@/constants/window-manager";
import { animateTerminalDock } from "@/animations/wm/window-transitions";
import { MatrixOverlay } from "@/features/effects/matrix-overlay";
import { MobileAppDrawer, MobileToolbar } from "@/features/mobile/mobile-shell";
import { TerminalShell } from "@/features/terminal/components/terminal-shell";
import { WindowManager } from "@/features/wm/components/window-manager";
import { useKonamiCode } from "@/hooks/use-konami-code";
import { useMobileLayout } from "@/hooks/use-mobile-layout";
import { injectMobileCommand } from "@/features/mobile/mobile-shell";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/providers/session-store";
import type { AppId } from "@/types/root-os";

function PowerLed({ active = true }: { active?: boolean }) {
  const markEasterEgg = useSessionStore((s) => s.markEasterEgg);
  const [clicks, setClicks] = useState(0);
  const [morseFlash, setMorseFlash] = useState(false);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 5) {
      setClicks(0);
      markEasterEgg("led-morse");
      setMorseFlash(true);
      window.setTimeout(() => setMorseFlash(false), 1200);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-1.5 rounded-sm px-1"
      aria-label="System power indicator — click 5 times for a surprise"
    >
      <span
        className={cn(
          "relative flex h-2 w-2 transition-opacity duration-200",
          morseFlash && "animate-pulse",
        )}
        style={{ opacity: active ? 1 : 0.15 }}
      >
        {active && (
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[var(--amber-led)] opacity-60" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--amber-led)]" />
      </span>
      <Power className="h-3 w-3 text-[var(--phosphor-dim)]" aria-hidden />
      {morseFlash && (
        <span className="sr-only">Morse: HI</span>
      )}
    </button>
  );
}

function Taskbar({ compact = false }: { compact?: boolean }) {
  const phase = useSessionStore((s) => s.phase);
  const openApps = useSessionStore((s) => s.openApps);
  const focusedApp = useSessionStore((s) => s.focusedApp);
  const windows = useSessionStore((s) => s.windows);
  const focusApp = useSessionStore((s) => s.focusApp);
  const restoreApp = useSessionStore((s) => s.restoreApp);

  const handleTaskbarClick = (appId: AppId) => {
    const win = windows[appId];
    if (win?.minimized) {
      restoreApp(appId);
    }
    focusApp(appId);
  };

  return (
    <footer
      className="relative z-30 flex items-center justify-between border-t border-[var(--ui-border)] bg-[var(--ui-chrome)] px-3"
      style={{ height: CHROME.taskbarHeight }}
      role="toolbar"
      aria-label="Taskbar"
    >
      <div className="flex items-center gap-2 overflow-x-auto text-xs text-[var(--ui-text)]">
        <PowerLed active={phase !== "SHUTDOWN"} />
        <span className="font-mono">{SYSTEM.name}</span>
        {!compact &&
          openApps.map((appId) => (
            <motion.button
              key={appId}
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => handleTaskbarClick(appId)}
              className={cn(
                "min-h-11 cursor-pointer rounded-sm px-2 py-1 font-mono",
                focusedApp === appId
                  ? "bg-[var(--bg-terminal)] text-[var(--phosphor-primary)]"
                  : "text-[var(--phosphor-dim)]",
                windows[appId]?.minimized && "opacity-50",
              )}
            >
              {APP_TITLES[appId]}
            </motion.button>
          ))}
      </div>
      <time className="font-mono text-xs text-[var(--phosphor-dim)]" suppressHydrationWarning>
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </time>
    </footer>
  );
}

export function Desktop({
  introMode = false,
  terminalOverlayRef,
}: {
  introMode?: boolean;
  terminalOverlayRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const openApps = useSessionStore((s) => s.openApps);
  const mobile = useMobileLayout();
  useKonamiCode();

  useEffect(() => {
    if (!terminalOverlayRef?.current || mobile || introMode) return;
    animateTerminalDock(terminalOverlayRef.current, openApps.length === 0);
  }, [introMode, mobile, openApps.length, terminalOverlayRef]);

  const terminalHeight = mobile
    ? openApps.length > 0
      ? "60dvh"
      : "calc(100dvh - var(--taskbar-height) - 56px)"
    : "min(420px, 50dvh)";

  const handleMobileCommand = useCallback((cmd: string) => {
    injectMobileCommand(cmd);
  }, []);

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col bg-[var(--bg-void)]",
        introMode && "pointer-events-none",
      )}
      aria-hidden={introMode}
    >
      <MatrixOverlay />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {!mobile && <WindowManager />}
        <div
          className={cn(
            "relative z-10 flex flex-1 flex-col",
            mobile ? "justify-stretch p-2" : "justify-end p-4",
          )}
        >
          <div
            ref={terminalOverlayRef}
            className="overflow-hidden rounded-sm border border-[var(--ui-border)] bg-[var(--bg-terminal)] p-1"
            style={{
              height: terminalHeight,
              opacity: introMode ? 0 : 1,
              visibility: introMode ? "hidden" : "visible",
            }}
          >
            <TerminalShell className="h-full w-full" mobile={mobile} />
          </div>
        </div>
        {mobile && <MobileAppDrawer open={openApps.length > 0} />}
      </main>
      {mobile && <MobileToolbar onRun={handleMobileCommand} />}
      <Taskbar compact={mobile} />
    </div>
  );
}
