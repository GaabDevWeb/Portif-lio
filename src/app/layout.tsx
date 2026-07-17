import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

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

export const metadata: Metadata = {
  title: {
    default: "ASCII Engine",
    template: "%s · ASCII Engine",
  },
  description:
    "ASCII Engine — conversão, edição, animação e playground profissional de arte ASCII",
  keywords: ["ascii", "ascii art", "converter", "gif", "editor", "terminal"],
  robots: { index: true, follow: true },
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
      <body className="min-h-dvh bg-[var(--bg-void)] text-[var(--phosphor-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
