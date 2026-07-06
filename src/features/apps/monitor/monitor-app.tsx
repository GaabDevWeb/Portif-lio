"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { loadSkills } from "@/lib/content/skills";
import { MOTION_IDS } from "@/animations/motion-ids";

export function MonitorApp() {
  const skills = loadSkills();
  const barsRef = useRef<HTMLDivElement>(null);
  const [levels, setLevels] = useState(skills.map((s) => s.level));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLevels(
        skills.map((s) =>
          Math.max(10, Math.min(99, s.level + Math.floor(Math.random() * 11) - 5)),
        ),
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [skills]);

  useEffect(() => {
    if (!barsRef.current) return;
    gsap.to(barsRef.current.querySelectorAll(".cpu-bar"), {
      id: MOTION_IDS.topCpuBars,
      duration: 0.6,
      ease: "sine.inOut",
    });
  }, [levels]);

  return (
    <div className="p-4 font-mono text-sm">
      <header className="mb-4 border-b border-[var(--ui-border)] pb-2">
        <p className="text-[var(--phosphor-primary)]">top — ROOT OS skills monitor</p>
        <p className="text-xs text-[var(--phosphor-dim)]">
          Tasks: {skills.length} total · 1 running · load average: 0.42
        </p>
      </header>
      <div ref={barsRef} className="space-y-3">
        {skills.map((skill, index) => (
          <div key={skill.name}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[var(--ui-text)]">
                {skill.process} ({skill.name})
              </span>
              <span className="text-[var(--phosphor-dim)]">{levels[index]}%</span>
            </div>
            <div className="h-2 border border-[var(--ui-border)] bg-[var(--bg-void)]">
              <div
                className="cpu-bar h-full bg-[var(--phosphor-primary)] transition-all duration-500"
                style={{ width: `${levels[index]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
