"use client";

import { isProjectAppId } from "@/lib/app-id";
import type { AppId } from "@/types/root-os";
import { EditorApp } from "@/features/apps/editor/editor-app";
import { MailApp } from "@/features/apps/mail/mail-app";
import { MonitorApp } from "@/features/apps/monitor/monitor-app";
import { ProfileApp } from "@/features/apps/profile/profile-app";
import { ProjectApp } from "@/features/apps/project/project-app";
import { ProjectsApp } from "@/features/apps/projects/projects-app";
import { TimelineApp } from "@/features/apps/timeline/timeline-app";
import { TerminalShell } from "@/features/terminal/components/terminal-shell";

export function renderApp(appId: AppId) {
  if (isProjectAppId(appId)) {
    return <ProjectApp appId={appId} />;
  }

  switch (appId) {
    case "terminal":
      return <TerminalShell className="h-full w-full" />;
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
    case "resume":
      return (
        <div className="p-4 font-mono text-sm text-[var(--ui-text)]">
          <p>Resume viewer — use wget resume.pdf from footer.</p>
        </div>
      );
    case "architecture":
      return (
        <div className="p-4 font-mono text-sm text-[var(--ui-text)]">
          <p>Stack architecture diagram — run `stack` in terminal.</p>
        </div>
      );
    case "help":
      return (
        <div className="p-4 font-mono text-sm text-[var(--ui-text)]">
          <p>Man pages — run `man &lt;cmd&gt;` in terminal.</p>
        </div>
      );
    case "finder":
      return (
        <div className="p-4 font-mono text-sm text-[var(--ui-text)]">
          <p>Finder — use `ls` and `cd` in terminal.</p>
        </div>
      );
    default:
      return (
        <p className="p-4 font-mono text-sm text-[var(--phosphor-dim)]">
          {appId}.app
        </p>
      );
  }
}
