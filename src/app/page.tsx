import type { Metadata } from "next";

import { AsciiLab } from "@/studio/AsciiLab";

export const metadata: Metadata = {
  title: "Studio",
  description: "ASCII Engine Studio — convert, animate, edit, playground",
};

export default function HomePage() {
  return <AsciiLab />;
}
