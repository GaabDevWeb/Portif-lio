"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/providers/session-store";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export function useKonamiCode() {
  const setVisualEffect = useSessionStore((s) => s.setVisualEffect);
  const markEasterEgg = useSessionStore((s) => s.markEasterEgg);

  useEffect(() => {
    let index = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === KONAMI[index]) {
        index += 1;
        if (index === KONAMI.length) {
          index = 0;
          markEasterEgg("konami");
          setVisualEffect("konami");
          document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
          window.setTimeout(() => {
            document.documentElement.style.filter = "";
            setVisualEffect(null);
          }, 2000);
        }
        return;
      }
      index = event.code === KONAMI[0] ? 1 : 0;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [markEasterEgg, setVisualEffect]);
}
