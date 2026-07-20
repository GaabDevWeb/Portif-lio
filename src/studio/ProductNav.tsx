"use client";

export type ProductTab = "convert" | "animate" | "library" | "docs";

const TABS: { id: ProductTab; label: string; href: string }[] = [
  { id: "convert", label: "Convert", href: "/?tab=convert" },
  { id: "animate", label: "Animate", href: "/?tab=animate" },
  { id: "library", label: "Library", href: "/?tab=library" },
  { id: "docs", label: "Docs", href: "/?tab=docs" },
];

interface ProductNavProps {
  active: ProductTab;
  onChange?: (tab: ProductTab) => void;
  /** links = <a href>; buttons = in-shell tab switch */
  mode?: "links" | "buttons";
}

/** Primary product sitemap — converter-focused navigation only. */
export function ProductNav({ active, onChange, mode = "buttons" }: ProductNavProps) {
  return (
    <nav aria-label="ASCII Engine" className="flex flex-wrap items-center gap-1">
      {TABS.map((t) => {
        const isActive = active === t.id;
        const className = `cursor-pointer rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
          isActive
            ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10 text-[var(--phosphor-primary)]"
            : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)] hover:text-[var(--phosphor-dim)]"
        }`;

        if (mode === "links") {
          return (
            <a
              key={t.id}
              href={t.href}
              className={className}
              aria-current={isActive ? "page" : undefined}
            >
              {t.label}
            </a>
          );
        }

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange?.(t.id)}
            className={className}
            aria-pressed={isActive}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

export { TABS as PRODUCT_TABS };

/** Map legacy URL tabs to current product tabs. */
export function normalizeProductTab(raw: string | null): ProductTab | null {
  if (!raw) return null;
  if (raw === "icons" || raw === "gallery") return "library";
  if (TABS.some((t) => t.id === raw)) return raw as ProductTab;
  return null;
}
