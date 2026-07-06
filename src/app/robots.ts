import { loadSiteConfig } from "@/lib/content/site";

export default function robots() {
  const site = loadSiteConfig();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
