"use client";

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    body: [
      "1. Open Convert (images) or Animate (GIFs).",
      "2. Upload a file.",
      "3. Adjust charset, dithering, colors, and quality.",
      "4. Preview in real time.",
      "5. Export TXT, PNG, SVG, JSON, GIF, or ZIP.",
    ],
  },
  {
    id: "presets",
    title: "Presets",
    body: [
      "Convert includes smart presets and Auto Optimize.",
      "Presets change pipeline options only — never your source file.",
      "Use Undo/Redo while sculpting conversion quality.",
    ],
  },
  {
    id: "exports",
    title: "Exports",
    body: [
      "Images: TXT, PNG (incl. transparent), SVG, JSON.",
      "Animation: GIF, ZIP (frame sequence), TXT sequence, sprite sheet.",
      "Export matches the preview matrix (same cell geometry).",
    ],
  },
  {
    id: "gif-pipeline",
    title: "GIF Pipeline",
    body: [
      "Animate uses a Temporal ASCII Pipeline — frames are a coherent sequence.",
      "Enable Temporal Smoothing, Character Persistence, Motion Detection,",
      "Region Reuse, Temporal Dithering, Adaptive FPS, ROI, and more.",
      "Toggle features independently to compare stability vs. classic convert.",
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    body: [
      "Q: Is ASCII Engine an editor?",
      "A: No. It is a professional media → ASCII converter.",
      "",
      "Q: Where did Edit / Studio / Playground go?",
      "A: Removed from the product. Code lives in src/legacy/ for reference.",
      "",
      "Q: What belongs in the product?",
      "A: Anything that improves conversion quality or the convert→export loop.",
      "",
      "Q: Library?",
      "A: Icons + Gallery — explore ASCII without uploading first.",
    ],
  },
] as const;

/** Minimal in-product documentation — converter focus only. */
export function DocsPanel() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-void)] px-6 py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="border-b border-[var(--ui-border)] pb-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--amber-led)]">
            Documentation
          </p>
          <h1 className="mt-1 font-mono text-sm uppercase tracking-widest text-[var(--phosphor-primary)]">
            ASCII Engine Docs
          </h1>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-[var(--ui-text-dim)]">
            Convert media to ASCII with maximum quality. Upload → Adjust → Preview → Export.
          </p>
        </header>

        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="space-y-2">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-[var(--amber-led)]">
              {section.title}
            </h2>
            <div className="space-y-1 font-mono text-[11px] leading-relaxed text-[var(--ui-text)]">
              {section.body.map((line, i) => (
                <p key={`${section.id}-${i}`} className={line === "" ? "h-2" : undefined}>
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
