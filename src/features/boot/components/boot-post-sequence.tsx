"use client";

import { useEffect, useRef, useState } from "react";

import { BOOT_MODULES, BOOT_POST_LINES, BOOT_TIMING } from "@/constants/boot";

interface BootPostSequenceProps {
  instant?: boolean;
  onComplete: () => void;
}

export function BootPostSequence({ instant = false, onComplete }: BootPostSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;

    const allLines = [
      ...BOOT_POST_LINES,
      "",
      ...BOOT_MODULES.map(
        (mod) => `[ ok ] ${mod.label.padEnd(28, ".")} ${mod.detail}`,
      ),
      "",
      "ROOT OS v0.1.0 ready.",
    ];

    if (instant) {
      setLines(allLines);
      completedRef.current = true;
      onComplete();
      return;
    }

    let index = 0;
    const pushNext = () => {
      if (index >= allLines.length) {
        completedRef.current = true;
        window.setTimeout(onComplete, BOOT_TIMING.postIntro / 2);
        return;
      }
      setLines((prev) => [...prev, allLines[index]]);
      index += 1;
      window.setTimeout(pushNext, index <= BOOT_POST_LINES.length ? 180 : BOOT_TIMING.moduleLine);
    };

    window.setTimeout(pushNext, BOOT_TIMING.postIntro / 2);
    return () => {
      completedRef.current = true;
    };
  }, [instant, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-[var(--bg-void)] p-6"
      data-motion-id="M-005"
    >
      <div className="crt-screen w-full max-w-3xl overflow-hidden rounded-sm border border-[var(--ui-border)] bg-[var(--bg-terminal)] p-6 font-mono text-sm text-[var(--phosphor-primary)] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} className="whitespace-pre-wrap leading-relaxed">
            {line || "\u00A0"}
          </div>
        ))}
        {!instant && lines.length < BOOT_POST_LINES.length + BOOT_MODULES.length + 2 && (
          <span className="inline-block h-4 w-2 animate-pulse bg-[var(--phosphor-primary)]" aria-hidden />
        )}
      </div>
    </div>
  );
}
