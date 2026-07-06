"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { loadTimeline } from "@/lib/content/timeline";
import { MOTION_IDS } from "@/animations/motion-ids";

export function TimelineApp() {
  const graphRef = useRef<SVGSVGElement>(null);
  const commits = loadTimeline();

  useEffect(() => {
    if (!graphRef.current) return;
    const dots = graphRef.current.querySelectorAll(".timeline-dot");
    const lines = graphRef.current.querySelectorAll(".timeline-line");

    gsap.fromTo(
      lines,
      { scaleY: 0, transformOrigin: "top center" },
      {
        id: MOTION_IDS.gitGraphDraw,
        scaleY: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      },
    );

    gsap.fromTo(
      dots,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        stagger: 0.12,
        delay: 0.2,
        ease: "back.out(1.4)",
      },
    );
  }, []);

  return (
    <div className="flex h-full min-h-[280px]">
      <div className="w-24 shrink-0 border-r border-[var(--ui-border)] p-3">
        <svg
          ref={graphRef}
          viewBox="0 0 40 200"
          className="h-full w-full"
          aria-hidden
        >
          {commits.map((_, index) => {
            if (index === commits.length - 1) return null;
            return (
              <line
                key={`line-${index}`}
                className="timeline-line stroke-[var(--phosphor-dim)]"
                x1={20}
                y1={index * 40 + 10}
                x2={20}
                y2={(index + 1) * 40 + 10}
                strokeWidth={2}
              />
            );
          })}
          {commits.map((commit, index) => (
            <circle
              key={commit.hash}
              className="timeline-dot fill-[var(--phosphor-primary)]"
              cx={20}
              cy={index * 40 + 10}
              r={5}
            />
          ))}
        </svg>
      </div>
      <ul className="flex-1 divide-y divide-[var(--ui-border)] overflow-auto">
        {commits.map((commit) => (
          <li key={commit.hash} className="px-4 py-3 font-mono text-sm">
            <p className="text-[var(--phosphor-primary)]">
              <span className="text-[var(--phosphor-dim)]">{commit.hash}</span>{" "}
              {commit.message}
            </p>
            <p className="mt-1 text-xs text-[var(--phosphor-dim)]">
              {commit.date} · {commit.branch}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
