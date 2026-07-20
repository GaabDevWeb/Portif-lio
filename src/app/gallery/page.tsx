import { redirect } from "next/navigation";

/** Gallery lives inside Library at /?tab=library */
export default function GalleryPage() {
  redirect("/?tab=library");
}
