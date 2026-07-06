"use client";

import { APP_TITLES } from "@/constants/window-manager";
import { renderApp } from "@/features/apps/app-registry";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/providers/session-store";

interface MobileAppDrawerProps {
  open: boolean;
}

export function MobileAppDrawer({ open }: MobileAppDrawerProps) {
  const focusedApp = useSessionStore((s) => s.focusedApp);
  const openApps = useSessionStore((s) => s.openApps);
  const closeApp = useSessionStore((s) => s.closeApp);
  const focusApp = useSessionStore((s) => s.focusApp);

  if (!open || openApps.length === 0) return null;

  const activeApp = focusedApp ?? openApps[openApps.length - 1];

  return (
    <section
      className="flex flex-col border-t border-[var(--ui-border)] bg-[var(--ui-chrome)]"
      style={{ height: "40dvh" }}
      aria-label="Application drawer"
    >
      <header className="flex items-center justify-between border-b border-[var(--ui-border)] px-3 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {openApps.map((appId) => (
            <button
              key={appId}
              type="button"
              onClick={() => focusApp(appId)}
              className={cn(
                "min-h-11 cursor-pointer rounded-sm px-3 py-2 font-mono text-xs",
                activeApp === appId
                  ? "bg-[var(--bg-terminal)] text-[var(--phosphor-primary)]"
                  : "text-[var(--phosphor-dim)]",
              )}
            >
              {APP_TITLES[appId]}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Close application"
          onClick={() => activeApp && closeApp(activeApp)}
          className="min-h-11 min-w-11 cursor-pointer px-3 font-mono text-sm text-[var(--stderr)]"
        >
          X
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto bg-[var(--bg-void)]">
        {activeApp && renderApp(activeApp)}
      </div>
    </section>
  );
}

interface MobileToolbarProps {
  onRun: (command: string) => void;
}

const QUICK_COMMANDS = [
  { label: "help", cmd: "help" },
  { label: "ls", cmd: "ls" },
  { label: "projects", cmd: "projects" },
  { label: "contact", cmd: "contact" },
] as const;

export function MobileToolbar({ onRun }: MobileToolbarProps) {
  return (
    <div
      className="flex items-center justify-around gap-2 border-t border-[var(--ui-border)] bg-[var(--ui-chrome)] px-2 py-2"
      role="toolbar"
      aria-label="Quick commands"
    >
      {QUICK_COMMANDS.map(({ label, cmd }) => (
        <button
          key={cmd}
          type="button"
          onClick={() => onRun(cmd)}
          className="min-h-11 min-w-11 flex-1 cursor-pointer rounded-sm border border-[var(--ui-border)] px-2 py-2 font-mono text-xs text-[var(--phosphor-primary)] active:bg-[var(--bg-terminal)]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function injectMobileCommand(command: string): void {
  window.dispatchEvent(new CustomEvent("rootos:run-command", { detail: command }));
}
