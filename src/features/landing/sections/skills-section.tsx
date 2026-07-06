"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MetricBar } from "@/features/landing/components/project-card";
import { ModulePanel } from "@/features/landing/components/module-panel";
import { loadSkills } from "@/lib/content/skills";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function SkillsSection() {
  const skills = loadSkills().sort((a, b) => b.level - a.level);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const fills = document.querySelectorAll("#skills .metric-bar-fill");
    fills.forEach((fill) => {
      const el = fill as HTMLElement;
      const target = el.style.width;
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: target,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#skills",
            start: "top 75%",
          },
        },
      );
    });
  }, [reducedMotion, skills]);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8" style={{ paddingBlock: "var(--section-padding-y)" }}>
      <div data-reveal>
        <ModulePanel id="skills" code="MOD-SKILLS" title="top — skills monitor">
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <MetricBar
                key={skill.name}
                label={skill.name}
                value={skill.level}
                process={skill.process}
              />
            ))}
          </div>
        </ModulePanel>
      </div>
    </div>
  );
}
