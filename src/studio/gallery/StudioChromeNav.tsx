"use client";

import { ProductNav, type ProductTab } from "@/studio/ProductNav";

/** Shared chrome nav for standalone /gallery route — mirrors product sitemap. */
export function StudioChromeNav({
  active,
}: {
  active: ProductTab | "studio" | "gallery";
}) {
  const current: ProductTab =
    active === "studio" ? "convert" : active === "gallery" ? "gallery" : active;

  return <ProductNav active={current} onChange={() => undefined} mode="links" />;
}

export function StudioNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`cursor-pointer rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
        active
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10 text-[var(--phosphor-primary)]"
          : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)] hover:text-[var(--phosphor-dim)]"
      }`}
    >
      {label}
    </a>
  );
}
