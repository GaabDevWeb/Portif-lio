import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectPageLayout } from "@/features/project-page";
import { getAllProjectSlugs, loadProjectPage } from "@/lib/content/project-detail";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = loadProjectPage(slug);
  if (!page) return { title: "Project not found" };

  return {
    title: page.meta.title,
    description: page.detail.hero.subtitle,
    openGraph: {
      title: page.meta.title,
      description: page.detail.hero.subtitle,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const data = loadProjectPage(slug);
  if (!data) notFound();

  return <ProjectPageLayout data={data} />;
}
