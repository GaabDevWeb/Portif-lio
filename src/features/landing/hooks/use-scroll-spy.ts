"use client";

import { useEffect } from "react";

import { SECTION_IDS } from "@/features/sync/section-map";
import { useSessionStore } from "@/providers/session-store";
import type { SectionId } from "@/types/root-os";

export function useScrollSpy(rootMargin = "-40% 0px -50% 0px") {
  const setActiveSection = useSessionStore((s) => s.setActiveSection);
  const emitSync = useSessionStore((s) => s.emitSync);
  const activeSection = useSessionStore((s) => s.activeSection);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;

        const section = visible.target.id as SectionId;
        if (section === activeSection) return;

        setActiveSection(section);
        emitSync({ type: "section.enter", origin: "landing", section });
      },
      { rootMargin, threshold: [0.15, 0.35, 0.55] },
    );

    for (const el of sections) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [activeSection, emitSync, rootMargin, setActiveSection]);
}
