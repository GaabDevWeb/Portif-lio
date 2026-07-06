"use client";

import { SYSTEM } from "@/constants/system";
import { loadSiteConfig } from "@/lib/content/site";
import { useSessionStore } from "@/providers/session-store";

export function FooterSection() {
  const site = loadSiteConfig();
  const initiateShutdown = useSessionStore((s) => s.initiateShutdown);
  const emitSync = useSessionStore((s) => s.emitSync);

  const handleResume = () => {
    emitSync({ type: "resume.download", origin: "landing" });
    window.open("/resume.pdf", "_blank", "noopener,noreferrer");
  };

  return (
    <footer
      id="footer"
      className="border-t border-[var(--ui-border)] bg-[var(--ui-chrome)]"
      style={{ paddingBlock: "var(--section-padding-y)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-mono text-sm text-[var(--phosphor-primary)]">
            {SYSTEM.name} {SYSTEM.version}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--phosphor-dim)]">
            {site.tagline}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleResume}
            className="min-h-11 cursor-pointer border border-[var(--ui-border)] px-4 font-mono text-xs text-[var(--accent-data)] hover:border-[var(--accent-data)]"
          >
            wget resume.pdf
          </button>
          <button
            type="button"
            onClick={() => initiateShutdown()}
            className="min-h-11 cursor-pointer border border-[var(--ui-border)] px-4 font-mono text-xs text-[var(--phosphor-dim)] hover:text-[var(--stderr)]"
          >
            shutdown
          </button>
        </div>
        <p className="font-mono text-[10px] text-[var(--ui-text-dim)]">
          © {new Date().getFullYear()} {site.author.name}
        </p>
      </div>
    </footer>
  );
}
