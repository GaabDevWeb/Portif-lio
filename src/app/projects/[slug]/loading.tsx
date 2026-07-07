export default function ProjectLoading() {
  return (
    <div
      className="min-h-dvh bg-[var(--bg-void)] pt-[var(--hud-height)]"
      aria-busy
      aria-label="Loading project"
    >
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-24 md:px-8">
        <div className="h-64 border border-[var(--ui-border)] bg-[var(--bg-panel)]/30" />
        <div className="mt-12 h-8 w-2/3 bg-[var(--bg-panel)]/40" />
        <div className="mt-4 h-4 w-full bg-[var(--bg-panel)]/20" />
      </div>
    </div>
  );
}
