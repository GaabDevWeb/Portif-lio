"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ModulePanel } from "@/features/landing/components/module-panel";
import { loadTimeline } from "@/lib/content/timeline";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function TimelineSection() {
  const commits = loadTimeline();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const rows = document.querySelectorAll("#timeline [data-commit]");
    gsap.fromTo(
      rows,
      { opacity: 0, x: -12 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#timeline",
          start: "top 78%",
        },
      },
    );
  }, [commits, reducedMotion]);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8" style={{ paddingBlock: "var(--section-padding-y)" }}>
      <div data-reveal>
        <ModulePanel id="timeline" code="MOD-TIMELINE" title="git log --oneline">
          <ul className="space-y-3 font-mono text-sm">
            {commits.map((commit) => (
              <li
                key={commit.hash}
                data-commit
                className="flex flex-col gap-1 border-l-2 border-[var(--phosphor-dim)] pl-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="text-[var(--amber-led)]">{commit.hash}</span>
                <span className="text-[var(--ui-text)]">{commit.message}</span>
                <span className="text-xs text-[var(--phosphor-dim)] sm:ml-auto">
                  {commit.date}
                </span>
              </li>
            ))}
          </ul>
        </ModulePanel>
      </div>
    </div>
  );
}
