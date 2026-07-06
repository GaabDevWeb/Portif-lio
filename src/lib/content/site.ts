import site from "../../../content/site.json";

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  author: {
    name: string;
    twitter: string;
  };
}

export function loadSiteConfig(): SiteConfig {
  return site as SiteConfig;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? loadSiteConfig().url;
}
