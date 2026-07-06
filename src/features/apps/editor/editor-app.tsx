"use client";

import { manifestoContent } from "@/content-data/manifesto";
import { useSessionStore } from "@/providers/session-store";

function renderMarkdownPreview(source: string): string {
  return source
    .replace(/^# (.+)$/gm, '<h2 class="text-lg text-[var(--phosphor-primary)]">$1</h2>')
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/^(.+)$/gm, (line) =>
      line.startsWith("<h2") ? line : `<p class='mt-2 text-[var(--ui-text)]'>${line}</p>`,
    );
}

export function EditorApp() {
  const editorFile = useSessionStore((s) => s.editorFile);
  const label = editorFile ?? "~/manifesto.md";
  const content = manifestoContent;

  return (
    <div className="flex h-full min-h-[280px] flex-col md:flex-row">
      <div className="flex-1 overflow-auto border-b border-[var(--ui-border)] p-3 md:border-b-0 md:border-r">
        <p className="mb-2 font-mono text-xs text-[var(--phosphor-dim)]">{label} — raw</p>
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--phosphor-primary)]">
          {content}
        </pre>
      </div>
      <div
        className="flex-1 overflow-auto p-3"
        dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
      />
    </div>
  );
}
