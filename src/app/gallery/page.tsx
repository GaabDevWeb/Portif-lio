import type { Metadata } from "next";

import { GalleryApp } from "@/studio/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "ASCII Engine Gallery — browse, favorite, remix and export mock arts",
};

export default function GalleryPage() {
  return <GalleryApp />;
}
