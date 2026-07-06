"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, MapPin } from "lucide-react";

import { animateProfileReveal } from "@/animations/wm/window-transitions";
import { loadProfileContent } from "@/features/vfs/content-loader";

export function ProfileApp() {
  const ref = useRef<HTMLDivElement>(null);
  const profile = loadProfileContent();

  useEffect(() => {
    if (ref.current) animateProfileReveal(ref.current);
  }, []);

  return (
    <div ref={ref} className="space-y-4 p-4">
      <header>
        <h1 className="font-mono text-xl text-[var(--phosphor-primary)]">{profile.name}</h1>
        <p className="mt-1 text-sm text-[var(--ui-text)]">{profile.role}</p>
        <p className="mt-2 text-sm text-[var(--phosphor-dim)]">{profile.tagline}</p>
      </header>
      <dl className="grid gap-2 font-mono text-sm">
        <div className="flex items-center gap-2 text-[var(--phosphor-dim)]">
          <MapPin className="h-4 w-4" aria-hidden />
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt className="text-[var(--phosphor-dim)]">email</dt>
          <dd className="text-[var(--accent-link)]">{profile.email}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-1 font-mono text-sm text-[var(--accent-link)] hover:brightness-110"
        >
          github <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-1 font-mono text-sm text-[var(--accent-link)] hover:brightness-110"
        >
          linkedin <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
