"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { AsciiAnimationHero, AsciiInteractionSurface } from "@/features/ascii-interaction";
import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import { PROJECT_ASCII_DEFAULTS } from "@/features/project-page/config/motion-presets";
import { ProjectMetaStrip } from "@/features/project-page/components/project-meta-strip";
import type { ProjectPageData } from "@/features/project-page/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ProjectHeroSectionProps {
  data: ProjectPageData;
}

export function ProjectHeroSection({ data }: ProjectHeroSectionProps) {
  const { meta, detail, titleAscii, heroVisualAscii } = data;
  const reducedMotion = useReducedMotion();
  const metaRef = useRef<HTMLDivElement>(null);
  const heroAsciiAnimation = detail.hero.heroAsciiAnimation;
  const heroVideo = detail.hero.heroVideo;
  const heroGif = detail.hero.heroGif;
  const heroMedia = heroAsciiAnimation ?? heroVideo ?? heroGif;

  const asciiConfig = mergeAsciiConfig({
    ...PROJECT_ASCII_DEFAULTS,
    ...detail.hero.asciiConfig,
  });

  useEffect(() => {
    if (reducedMotion || !metaRef.current) return;
    gsap.fromTo(
      metaRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 },
    );
  }, [reducedMotion]);

  return (
    <section className="relative flex min-h-dvh flex-col" aria-labelledby="project-hero-title">
      {/* Zona visual — full-bleed, largura máxima da página */}
      <div
        className={
          heroMedia
            ? "relative w-full overflow-hidden"
            : "relative min-h-[calc(100dvh-var(--hud-height)-14rem)] w-full flex-1 md:min-h-[calc(100dvh-var(--hud-height)-12rem)]"
        }
      >
        {heroMedia ? (
          <div className="relative w-full">
            {heroAsciiAnimation ? (
              <AsciiAnimationHero
                basePath={heroAsciiAnimation}
                className="block h-auto w-full max-w-none opacity-90"
              />
            ) : heroVideo ? (
              <video
                src={heroVideo}
                className="block h-auto w-full max-w-none opacity-90"
                autoPlay={!reducedMotion}
                loop
                muted
                playsInline
                aria-hidden
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroGif}
                alt=""
                className="block h-auto w-full max-w-none opacity-90"
                decoding="async"
                aria-hidden
              />
            )}
            <div
              className="pointer-events-none absolute inset-0 grid-overlay opacity-20"
              aria-hidden
            />
          </div>
        ) : heroVisualAscii ? (
          <AsciiInteractionSurface
            source={heroVisualAscii}
            layout="hero"
            config={asciiConfig}
          />
        ) : null}

        {!heroMedia && (
          <>
            <div className="pointer-events-none absolute inset-0 grid-overlay opacity-25" aria-hidden />
            <div className="pointer-events-none absolute inset-0 scanline-hero" aria-hidden />
          </>
        )}
      </div>

      {/* Zona de descrição — título ASCII + meta */}
      <div
        ref={metaRef}
        className="relative z-10 mx-auto w-full max-w-6xl border-t border-[var(--ui-border)] bg-[var(--bg-void)] px-4 py-10 md:px-8 md:py-14"
      >
        <ProjectMetaStrip
          meta={meta}
          titleAscii={titleAscii}
          asciiConfig={asciiConfig}
          subtitle={detail.hero.subtitle}
          quickFacts={detail.hero.quickFacts}
        />
      </div>
    </section>
  );
}
