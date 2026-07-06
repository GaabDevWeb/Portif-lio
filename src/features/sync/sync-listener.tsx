"use client";

import { useEffect } from "react";

import { registerScrollToSection, registerTerminalWriter } from "@/features/sync/sync-bus";
import { scrollToSectionId } from "@/features/landing/components/lenis-provider";
import { useSessionStore } from "@/providers/session-store";
import type { SectionId } from "@/types/root-os";

export function SyncBusListener() {
  const setActiveSection = useSessionStore((s) => s.setActiveSection);

  useEffect(() => {
    const unregisterScroll = registerScrollToSection((section: SectionId) => {
      setActiveSection(section);
      scrollToSectionId(section);
    });

    const onSync = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail || detail.origin === "terminal") return;
    };

    window.addEventListener("rootos:sync", onSync);
    return () => {
      unregisterScroll();
      window.removeEventListener("rootos:sync", onSync);
    };
  }, [setActiveSection]);

  return null;
}

export function TerminalSyncBridge({
  writeln,
}: {
  writeln: (lines: string[]) => void;
}) {
  useEffect(() => registerTerminalWriter(writeln), [writeln]);
  return null;
}
