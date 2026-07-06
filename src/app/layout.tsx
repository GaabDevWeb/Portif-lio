import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { getSiteUrl, loadSiteConfig } from "@/lib/content/site";
import { RootOSProvider } from "@/providers/root-os-provider";

import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const site = loadSiteConfig();
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.author.name }],
  keywords: [
    "portfolio",
    "terminal",
    "creative developer",
    "frontend",
    "interactive",
    "ROOT OS",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: siteUrl,
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    creator: site.author.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#0a120a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body>
        <a href="#main-terminal" className="skip-link">
          Skip to terminal
        </a>
        <RootOSProvider>{children}</RootOSProvider>
      </body>
    </html>
  );
}
