import type { Metadata } from "next";

import { AsciiLab } from "@/studio/AsciiLab";

export const metadata: Metadata = {
  title: "ASCII Engine",
  description:
    "Professional media → ASCII converter. Upload images or GIFs, adjust quality, preview, export.",
};

export default function HomePage() {
  return <AsciiLab />;
}
