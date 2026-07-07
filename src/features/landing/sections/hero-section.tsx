"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ArrowDown, Github, Linkedin } from "lucide-react";

import { AsciiInteractionEngine } from "@/features/ascii-interaction";
import { HERO_ASCII_INTERACTION_CONFIG } from "@/features/ascii-interaction/config";
import { HudReadout } from "@/features/landing/components/module-panel";
import { computeHeroTelemetry } from "@/features/landing/lib/hero-telemetry";
import { loadProfileContent } from "@/features/vfs/content-loader";
import { heroAsciiArt } from "@/content-data/hero-ascii";
import { SYSTEM } from "@/constants/system";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroSection() {
  const profile = loadProfileContent();
  const telemetry = computeHeroTelemetry();
  const reducedMotion = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (reducedMotion || !titleRef.current) return;
    const lines = titleRef.current.querySelectorAll("[data-hero-line]");
    gsap.fromTo(
      lines,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.15 },
    );
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      className="scanline-hero relative flex min-h-dvh flex-col justify-center px-4 py-24 md:px-8"
      style={{ paddingTop: "var(--section-padding-y)" }}
      aria-labelledby="hero-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <AsciiInteractionEngine
          source={heroAsciiArt}
          config={HERO_ASCII_INTERACTION_CONFIG}
          className="h-full w-full opacity-90"
          interactive={!reducedMotion}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--phosphor-dim)]">
          <span className="inline-flex items-center gap-1.5 border border-[var(--ui-border)] px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber-led)] animate-pulse" />
            ONLINE
          </span>
          <span className="border border-[var(--ui-border)] px-2 py-1">
            {SYSTEM.name} {SYSTEM.version}
          </span>
          <span className="border border-[var(--ui-border)] px-2 py-1">
            {profile.location}
          </span>
        </div>

        <h1
          id="hero-title"
          ref={titleRef}
          className="max-w-4xl text-4xl font-semibold tracking-tight text-[var(--ui-text)] md:text-6xl"
        >
          <span data-hero-line className="block font-mono text-sm text-[var(--phosphor-primary)] md:text-base">
            guest@devbox:~$
          </span>
          <span data-hero-line className="mt-2 block">
            {profile.name}
          </span>
          <span data-hero-line className="mt-3 block text-xl font-normal text-[var(--ui-text-dim)] md:text-2xl">
            {profile.role}
          </span>
        </h1>

        <p data-reveal className="mt-6 max-w-2xl text-base text-[var(--ui-text-dim)] md:text-lg">
          {profile.tagline}
        </p>

        <div
          data-reveal
          className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          <HudReadout label="Projects" value={telemetry.projects} />
          <HudReadout label="Commits" value={telemetry.commits} />
          <HudReadout label="Years" value={telemetry.years} />
          <HudReadout label="Stacks" value={telemetry.stacks} />
          <HudReadout label="Nodes" value={telemetry.nodes} />
          <HudReadout label="Experiments" value={telemetry.experiments} />
        </div>

        <div data-reveal className="mt-8 flex flex-wrap gap-3 pointer-events-auto">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[var(--phosphor-primary)] bg-[var(--bg-panel)] px-4 font-mono text-sm text-[var(--phosphor-primary)] transition-[filter] hover:brightness-110"
          >
            <Github className="h-4 w-4" aria-hidden />
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[var(--ui-border)] px-4 font-mono text-sm text-[var(--ui-text)] transition-colors hover:border-[var(--phosphor-dim)]"
          >
            <Linkedin className="h-4 w-4" aria-hidden />
            LinkedIn
          </a>
          <a
            href="#projects"
            className="inline-flex min-h-11 cursor-pointer items-center border border-[var(--ui-border)] px-4 font-mono text-sm text-[var(--accent-data)] transition-colors hover:border-[var(--accent-data)]"
          >
            View projects →
          </a>
        </div>
      </div>

      {!reducedMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--phosphor-dim)]"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <ArrowDown className="h-5 w-5" />
        </motion.div>
      )}
    </section>
  );
}
