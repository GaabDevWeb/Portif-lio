"use client";

import { useCallback, useEffect, useState } from "react";
import { Power, Terminal as TerminalIcon } from "lucide-react";

import { MatrixOverlay } from "@/features/effects/matrix-overlay";
import { LandingPage } from "@/features/landing/components/landing-page";
import {
  MobileAppDrawer,
  MobileToolbar,
} from "@/features/mobile/mobile-shell";
import { SyncBusListener } from "@/features/sync/sync-listener";
import { WindowManager } from "@/features/wm/components/window-manager";
import { subscribePointerTracker } from "@/features/wm/lib/pointer-tracker";
import { getAppTitle } from "@/lib/app-id";
import { useKonamiCode } from "@/hooks/use-konami-code";
import { useMobileLayout } from "@/hooks/use-mobile-layout";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/providers/session-store";
import type { AppId } from "@/types/root-os";
import { CHROME, SYSTEM } from "@/constants/system";

function PowerLed() {
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
      aria-label="System power indicator"
    >
      <span
        className={cn(
          "relative flex h-2 w-2",
          morseFlash && "animate-pulse",
        )}
      >
        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[var(--amber-led)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--amber-led)]" />
      </span>
      <Power className="h-3 w-3 text-[var(--phosphor-dim)]" aria-hidden />
    </button>
  );
}

function SystemTaskbar() {
  const openApps = useSessionStore((s) => s.openApps);
  const focusedApp = useSessionStore((s) => s.focusedApp);
  const windows = useSessionStore((s) => s.windows);
  const focusApp = useSessionStore((s) => s.focusApp);
  const restoreApp = useSessionStore((s) => s.restoreApp);
  const toggleTerminal = useSessionStore((s) => s.toggleTerminal);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const handleTaskbarClick = (appId: AppId) => {
    const win = windows[appId];
    if (win?.minimized) restoreApp(appId);
    focusApp(appId);
  };

  const terminalOpen = openApps.includes("terminal");

  return (
    <footer
      className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-between border-t border-[var(--ui-border)] bg-[var(--ui-chrome)] px-3"
      style={{ height: CHROME.taskbarHeight }}
      role="contentinfo"
    >
      <div className="flex items-center gap-2">
        <PowerLed />
        <span className="hidden font-mono text-[10px] text-[var(--phosphor-dim)] sm:inline">
          {SYSTEM.name} {SYSTEM.version}
        </span>
      </div>
      <div className="flex max-w-[60%] items-center gap-1 overflow-x-auto">
        {openApps.map((appId) => (
          <button
            key={appId}
            type="button"
            onClick={() => handleTaskbarClick(appId)}
            className={cn(
              "min-h-9 cursor-pointer px-2 font-mono text-[10px] whitespace-nowrap transition-colors",
              focusedApp === appId
                ? "border border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
                : "text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
            )}
          >
            {getAppTitle(appId)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleTerminal("landing")}
          aria-pressed={terminalOpen}
          className={cn(
            "inline-flex min-h-9 cursor-pointer items-center gap-1 px-2 font-mono text-[10px]",
            terminalOpen ? "text-[var(--phosphor-primary)]" : "text-[var(--phosphor-dim)]",
          )}
        >
          <TerminalIcon className="h-3 w-3" aria-hidden />
        </button>
        <time className="font-mono text-[10px] text-[var(--phosphor-dim)] tabular-nums">
          {clock}
        </time>
      </div>
    </footer>
  );
}

export function RootOSShell() {
  const isMobile = useMobileLayout();
  const openApps = useSessionStore((s) => s.openApps);
  const toggleTerminal = useSessionStore((s) => s.toggleTerminal);
  const [mobileDrawer, setMobileDrawer] = useState(false);

  useKonamiCode();

  useEffect(() => subscribePointerTracker(), []);

  const injectMobileCommand = useCallback((command: string) => {
    if (!useSessionStore.getState().openApps.includes("terminal")) {
      toggleTerminal("landing");
    }
    window.dispatchEvent(new CustomEvent("rootos:run-command", { detail: command }));
  }, [toggleTerminal]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        toggleTerminal("landing");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTerminal]);

  useEffect(() => {
    if (openApps.length > 0 && isMobile) setMobileDrawer(true);
    if (openApps.length === 0) setMobileDrawer(false);
  }, [isMobile, openApps.length]);

  return (
    <div className="relative min-h-dvh bg-[var(--bg-void)] pb-[var(--taskbar-height)]">
      <MatrixOverlay />
      <SyncBusListener />
      <LandingPage />
      {!isMobile && <WindowManager />}
      <SystemTaskbar />
      {isMobile && (
        <>
          <MobileAppDrawer open={mobileDrawer} />
          <MobileToolbar onRun={injectMobileCommand} />
        </>
      )}
    </div>
  );
}
