import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-void)] px-4 text-center">
      <p className="font-mono text-sm text-[var(--phosphor-dim)]">ERR::PROJECT_NOT_FOUND</p>
      <h1 className="mt-4 font-mono text-2xl text-[var(--ui-text)]">Package not installed</h1>
      <Link
        href="/#projects"
        className="mt-8 cursor-pointer border border-[var(--ui-border)] px-4 py-2 font-mono text-sm text-[var(--phosphor-primary)] hover:bg-[var(--bg-panel)]"
      >
        ← back to ~/projects/
      </Link>
    </main>
  );
}
