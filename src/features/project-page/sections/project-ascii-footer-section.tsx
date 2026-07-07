"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { ProjectFooterDetail } from "@/features/project-page/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

interface ProjectAsciiFooterSectionProps {
  footerAscii: string;
  footer: ProjectFooterDetail;
}

export function ProjectAsciiFooterSection({
  footerAscii,
  footer,
}: ProjectAsciiFooterSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <footer ref={sectionRef} className="border-t border-[var(--ui-border)]">
      {footer.links && footer.links.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <nav
            className="flex flex-wrap gap-4 font-mono text-xs"
            aria-label="Project links"
          >
            {footer.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="cursor-pointer text-[var(--phosphor-dim)] transition-colors hover:text-[var(--phosphor-primary)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <pre
        className="block w-full max-w-none overflow-hidden whitespace-pre font-mono text-[clamp(3px,0.48vw,8px)] leading-[1.05] text-[var(--phosphor-dim)] selection:bg-[var(--phosphor-primary)] selection:text-[var(--bg-void)]"
        aria-hidden
      >
        {footerAscii}
      </pre>
    </footer>
  );
}
