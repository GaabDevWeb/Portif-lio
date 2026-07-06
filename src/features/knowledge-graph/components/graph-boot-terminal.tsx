"use client";

import { cn } from "@/lib/utils";

const BOOT_LINES = [
  "index --knowledge",
  "Scanning repository...",
  "Resolving dependencies...",
  "Rendering graph...",
] as const;

interface GraphBootTerminalProps {
  lineIndex: number;
  visible: boolean;
  className?: string;
}

export function GraphBootTerminal({ lineIndex, visible, className }: GraphBootTerminalProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "border-b border-[var(--ui-border)] bg-[var(--bg-terminal)] px-4 py-3 font-mono text-xs",
        className,
      )}
      aria-live="polite"
      aria-label="Knowledge graph boot sequence"
    >
      <p className="text-[var(--phosphor-dim)]">guest@devbox:~$</p>
      {BOOT_LINES.map((line, index) => (
        <p
          key={line}
          className={cn(
            "mt-1 transition-opacity duration-150",
            index <= lineIndex
              ? "text-[var(--phosphor-primary)] opacity-100"
              : "opacity-0",
          )}
        >
          {index === 0 ? line : `  ${line}`}
        </p>
      ))}
    </div>
  );
}

export { BOOT_LINES };
