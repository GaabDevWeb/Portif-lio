import { ProjectTitleAscii } from "@/features/project-page/components/project-title-ascii";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { ProjectMeta } from "@/types/root-os";
import type { ProjectQuickFact } from "@/features/project-page/types";

interface ProjectMetaStripProps {
  meta: ProjectMeta;
  titleAscii: string;
  asciiConfig?: Partial<AsciiInteractionConfig>;
  subtitle: string;
  quickFacts: ProjectQuickFact[];
}

export function ProjectMetaStrip({
  meta,
  titleAscii,
  asciiConfig,
  subtitle,
  quickFacts,
}: ProjectMetaStripProps) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[var(--phosphor-dim)]">
        <span className="border border-[var(--ui-border)] px-2 py-1">
          CASE/{meta.slug}
        </span>
        <span className="border border-[var(--ui-border)] px-2 py-1">
          {meta.year}
        </span>
      </div>

      <div>
        <h1 id="project-hero-title" className="sr-only">
          {meta.title}
        </h1>
        <ProjectTitleAscii source={titleAscii} asciiConfig={asciiConfig} />
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--ui-text-dim)] md:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {meta.stack.map((tech) => (
          <span
            key={tech}
            className="border border-[var(--ui-border)] px-2 py-1 font-mono text-[10px] text-[var(--phosphor-dim)]"
          >
            {tech}
          </span>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickFacts.map((fact) => (
          <div key={fact.label} className="border border-[var(--ui-border)] bg-[var(--bg-panel)]/40 p-3">
            <dt className="font-mono text-[9px] text-[var(--phosphor-dim)]">{fact.label}</dt>
            <dd className="mt-1 font-mono text-xs text-[var(--phosphor-primary)]">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {(meta.links?.demo || meta.links?.repo) && (
        <div className="flex flex-wrap gap-3 font-mono text-xs">
          {meta.links.demo && (
            <a
              href={meta.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer border border-[var(--ui-border)] px-3 py-2 text-[var(--phosphor-primary)] transition-colors hover:bg-[var(--bg-panel)]"
            >
              demo →
            </a>
          )}
          {meta.links.repo && (
            <a
              href={meta.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer border border-[var(--ui-border)] px-3 py-2 text-[var(--ui-text-dim)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--ui-text)]"
            >
              repo →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
