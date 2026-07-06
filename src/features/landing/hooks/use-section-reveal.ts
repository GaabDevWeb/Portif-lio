"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function useSectionReveal(selector = "[data-reveal]") {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const elements = gsap.utils.toArray<HTMLElement>(selector);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [reducedMotion, selector]);
}

export function useStaggerReveal(containerSelector: string, childSelector: string) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    if (!children.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
          },
        },
      );
    });

    return () => ctx.revert();
  }, [childSelector, containerSelector, reducedMotion]);
}
