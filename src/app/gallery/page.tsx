import { redirect } from "next/navigation";

/** Gallery lives inside the product shell at /?tab=gallery */
export default function GalleryPage() {
  redirect("/?tab=gallery");
}
