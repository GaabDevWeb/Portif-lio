import type { MetadataRoute } from "next";

import { getAllProjectSlugs } from "@/lib/content/project-detail";
import { getSiteUrl } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...getAllProjectSlugs().map((slug) => ({
      url: `${base}/projects/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
