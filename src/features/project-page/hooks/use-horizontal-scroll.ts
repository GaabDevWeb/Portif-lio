"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

interface UseHorizontalScrollOptions {
  enabled?: boolean;
}

/**
 * Mapeia scroll vertical → deslocamento horizontal no track pinado.
 * Fallback: sem pin quando reduced-motion.
 */
export function useHorizontalScroll({ enabled = true }: UseHorizontalScrollOptions = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track || !enabled || reducedMotion) return;

      const getDistance = () => Math.max(0, track.scrollWidth - section.offsetWidth);

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.setProperty(
                "--progress",
                `${(self.progress * 100).toFixed(1)}%`,
              );
            }
          },
        },
      });

      const panels = track.querySelectorAll("[data-arch-panel]");
      panels.forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0.35, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left 85%",
              end: "left 55%",
              scrub: 1,
            },
          },
        );
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [enabled, reducedMotion] },
  );

  return { sectionRef, trackRef, progressRef, reducedMotion };
}
