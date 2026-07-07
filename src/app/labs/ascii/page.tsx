import type { Metadata } from "next";

import { AsciiLab } from "@/labs/ascii/AsciiLab";

export const metadata: Metadata = {
  title: "ASCII Lab",
  description: "Laboratório isolado de desenvolvimento da ASCII Interaction Engine",
  robots: { index: false, follow: false },
};

export default function AsciiLabPage() {
  return <AsciiLab />;
}
