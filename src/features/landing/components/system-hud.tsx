"use client";

import { Terminal } from "lucide-react";

import { SECTION_IDS, SECTION_LABELS } from "@/features/sync/section-map";
import { scrollToSectionId } from "@/features/landing/components/lenis-provider";
import { RootMediaHud } from "@/features/landing/components/root-media-hud";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/providers/session-store";
import type { SectionId } from "@/types/root-os";

export function SystemHud() {
  const activeSection = useSessionStore((s) => s.activeSection);
  const toggleTerminal = useSessionStore((s) => s.toggleTerminal);
  const setActiveSection = useSessionStore((s) => s.setActiveSection);
  const terminalOpen = useSessionStore((s) => s.openApps.includes("terminal"));
  const emitSync = useSessionStore((s) => s.emitSync);

  const navigate = (section: SectionId) => {
    setActiveSection(section);
    scrollToSectionId(section);
    emitSync({ type: "section.enter", origin: "landing", section });
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 border-b border-[var(--ui-border)] bg-[var(--ui-chrome)]/95 backdrop-blur-[2px]"
      style={{ height: "var(--hud-height)" }}
    >
      <nav
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-4 md:px-8"
        aria-label="Section navigation"
      >
        <span className="hidden font-mono text-xs text-[var(--phosphor-primary)] sm:inline">
          ROOT OS
        </span>
        <ul className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {SECTION_IDS.filter((id) => id !== "footer").map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => navigate(id)}
                className={cn(
                  "min-h-11 cursor-pointer px-2 font-mono text-[11px] whitespace-nowrap transition-colors md:px-3 md:text-xs",
                  activeSection === id
                    ? "text-[var(--phosphor-primary)] underline decoration-[var(--phosphor-primary)] underline-offset-4"
                    : "text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
                )}
              >
                {SECTION_LABELS[id]}
              </button>
            </li>
          ))}
        </ul>
        <RootMediaHud />
        <button
          type="button"
          onClick={() => toggleTerminal("landing")}
          aria-pressed={terminalOpen}
          aria-label={terminalOpen ? "Close terminal" : "Open terminal"}
          className={cn(
            "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border px-2 font-mono text-xs transition-colors",
            terminalOpen
              ? "border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
              : "border-[var(--ui-border)] text-[var(--phosphor-dim)] hover:text-[var(--ui-text)]",
          )}
        >
          <Terminal className="h-4 w-4" aria-hidden />
          <span className="ml-1 hidden md:inline">Term</span>
        </button>
      </nav>
    </header>
  );
}
