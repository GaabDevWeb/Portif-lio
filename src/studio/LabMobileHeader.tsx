"use client";

import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";

interface LabMobileHeaderProps {
  title?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  trailing?: ReactNode;
}

export function LabMobileHeader({
  title = "ASCII Engine",
  sidebarOpen,
  onToggleSidebar,
  trailing,
}: LabMobileHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--ui-border)] px-3 py-2 md:hidden">
      <button
        type="button"
        aria-label={sidebarOpen ? "Fechar painel" : "Abrir painel"}
        onClick={onToggleSidebar}
        className="cursor-pointer rounded border border-[var(--ui-border)] p-1.5 text-[var(--phosphor-primary)]"
      >
        {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
      </button>
      <h1 className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-widest text-[var(--phosphor-primary)]">
        {title}
      </h1>
      {trailing}
    </div>
  );
}
