"use client";

import { LenisProvider } from "@/features/landing/components/lenis-provider";
import { SystemHud } from "@/features/landing/components/system-hud";
import { useScrollSpy } from "@/features/landing/hooks/use-scroll-spy";
import { useSectionReveal, useStaggerReveal } from "@/features/landing/hooks/use-section-reveal";
import { ContactSection } from "@/features/landing/sections/contact-section";
import { FooterSection } from "@/features/landing/sections/footer-section";
import { HeroSection } from "@/features/landing/sections/hero-section";
import { ManifestoSection } from "@/features/landing/sections/manifesto-section";
import { ProcessSection } from "@/features/landing/sections/process-section";
import { ProjectsSection } from "@/features/landing/sections/projects-section";
import { KnowledgeGraphSection } from "@/features/knowledge-graph/components/knowledge-graph-section";
import { TimelineSection } from "@/features/landing/sections/timeline-section";

export function LandingPage() {
  useScrollSpy();
  useSectionReveal();
  useStaggerReveal("#projects-grid", ":scope > button");

  return (
    <LenisProvider>
      <SystemHud />
      <main id="main-content" className="pt-[var(--hud-height)]">
        <HeroSection />
        <ManifestoSection />
        <ProjectsSection />
        <ProcessSection />
        <KnowledgeGraphSection />
        <TimelineSection />
        <ContactSection />
        <FooterSection />
      </main>
    </LenisProvider>
  );
}
