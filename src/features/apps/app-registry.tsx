"use client";

import type { AppId } from "@/types/root-os";
import { EditorApp } from "@/features/apps/editor/editor-app";
import { MailApp } from "@/features/apps/mail/mail-app";
import { MonitorApp } from "@/features/apps/monitor/monitor-app";
import { ProfileApp } from "@/features/apps/profile/profile-app";
import { ProjectsApp } from "@/features/apps/projects/projects-app";
import { TimelineApp } from "@/features/apps/timeline/timeline-app";

export function renderApp(appId: AppId) {
  switch (appId) {
    case "profile":
      return <ProfileApp />;
    case "projects":
      return <ProjectsApp />;
    case "editor":
      return <EditorApp />;
    case "mail":
      return <MailApp />;
    case "timeline":
      return <TimelineApp />;
    case "monitor":
      return <MonitorApp />;
    default:
      return (
        <p className="p-4 font-mono text-sm text-[var(--phosphor-dim)]">
          {appId}.app — coming in a later phase.
        </p>
      );
  }
}
