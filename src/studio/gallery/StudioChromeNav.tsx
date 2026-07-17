"use client";

import Link from "next/link";

interface StudioNavLinkProps {
  href: string;
  label: string;
  active?: boolean;
}

/** Link de navegação Studio ↔ Gallery (phosphor mono). */
export function StudioNavLink({ href, label, active }: StudioNavLinkProps) {
  return (
    <Link
      href={href}
      className={`cursor-pointer rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
        active
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10 text-[var(--phosphor-primary)]"
          : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)] hover:text-[var(--phosphor-dim)]"
      }`}
    >
      {label}
    </Link>
  );
}

export function StudioChromeNav({ active }: { active: "studio" | "gallery" }) {
  return (
    <nav className="flex items-center gap-1.5" aria-label="ASCII Engine sections">
      <StudioNavLink href="/" label="Studio" active={active === "studio"} />
      <StudioNavLink href="/gallery" label="Gallery" active={active === "gallery"} />
    </nav>
  );
}
