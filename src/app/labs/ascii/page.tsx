import type { Metadata } from "next";

import { AsciiLab } from "@/labs/ascii/AsciiLab";

export const metadata: Metadata = {
  title: "ASCII Engine",
  description: "ASCII Engine — conversão, animação, playground e física interativa",
  robots: { index: false, follow: false },
};

export default function AsciiEnginePage() {
  return <AsciiLab />;
}
