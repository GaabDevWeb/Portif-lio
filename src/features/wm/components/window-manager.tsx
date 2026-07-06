"use client";

import { useEffect } from "react";

import { subscribePointerTracker } from "@/features/wm/lib/pointer-tracker";
import { WindowFrame } from "@/features/wm/components/window-frame";
import { useSessionStore } from "@/providers/session-store";

export function WindowManager() {
  const openApps = useSessionStore((s) => s.openApps);
  const cycleFocus = useSessionStore((s) => s.cycleFocus);

  useEffect(() => subscribePointerTracker(), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "Tab") {
        event.preventDefault();
        cycleFocus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycleFocus]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {openApps.map((appId) => (
        <WindowFrame key={appId} appId={appId} />
      ))}
    </div>
  );
}
