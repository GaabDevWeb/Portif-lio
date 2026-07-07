"use client";

import dynamic from "next/dynamic";

import { LenisProvider } from "@/features/landing/components/lenis-provider";
import { ProjectArchitectureSection } from "@/features/project-page/sections/project-architecture-section";
import { ProjectAsciiFooterSection } from "@/features/project-page/sections/project-ascii-footer-section";
import { ProjectHeroSection } from "@/features/project-page/sections/project-hero-section";
import type { ProjectPageData } from "@/features/project-page/types";

const SystemHud = dynamic(
  () => import("@/features/landing/components/system-hud").then((m) => m.SystemHud),
  { ssr: false },
);

interface ProjectPageLayoutProps {
  data: ProjectPageData;
}

export function ProjectPageLayout({ data }: ProjectPageLayoutProps) {
  return (
    <LenisProvider>
      <SystemHud />
      <main id="main-content" className="bg-[var(--bg-void)] pt-[var(--hud-height)]">
        <ProjectHeroSection data={data} />
        <ProjectArchitectureSection panels={data.detail.architecture.panels} />
        <ProjectAsciiFooterSection
          footerAscii={data.footerAscii}
          footer={data.detail.footer}
        />
      </main>
    </LenisProvider>
  );
}
