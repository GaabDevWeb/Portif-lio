"use client";

import { useCallback, useState } from "react";
import {
  charsetPackManifest,
  charsetPackModule,
  defaultPluginHost,
  type CharsetEntry,
} from "@/features/ascii-engine/plugins";
import { PanelButton, PanelSection } from "@/studio/ui/controls";

interface PluginsPanelProps {
  onCharsetsChange?: (charsets: CharsetEntry[]) => void;
}

/**
 * Studio: carrega o plugin exemplo charset pack (same-origin, sem rebuild).
 */
export function PluginsPanel({ onCharsetsChange }: PluginsPanelProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadedIds, setLoadedIds] = useState<string[]>(() =>
    defaultPluginHost.list().map((p) => p.manifest.id),
  );

  const loadCharsetPack = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      await defaultPluginHost.load(charsetPackManifest, charsetPackModule);
      const ids = defaultPluginHost.list().map((p) => p.manifest.id);
      setLoadedIds(ids);
      onCharsetsChange?.(defaultPluginHost.charsets.list());
      const added = charsetPackManifest.contributes.charsets?.join(", ") ?? "";
      setStatus(`Loaded ${charsetPackManifest.id} · ${added}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha ao carregar plugin.");
    } finally {
      setBusy(false);
    }
  }, [onCharsetsChange]);

  const already = defaultPluginHost.isLoaded(charsetPackManifest.id);

  return (
    <div className="space-y-4 px-4 py-3">
      <PanelSection title="Plugins">
        <p className="mb-2 font-mono text-[9px] text-[var(--ui-text-dim)]">
          Same-origin ES modules · sandbox iframe ainda não (P9).
        </p>
        <PanelButton disabled={busy} className="w-full" onClick={() => void loadCharsetPack()}>
          {already ? "Reload charset pack" : "Load charset pack"}
        </PanelButton>
        {loadedIds.length > 0 ? (
          <ul className="mt-2 space-y-0.5 font-mono text-[9px] text-[var(--ui-text-dim)]">
            {loadedIds.map((id) => (
              <li key={id}>· {id}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 font-mono text-[9px] text-[var(--ui-text-dim)]">Nenhum plugin carregado.</p>
        )}
        {status ? (
          <p className="mt-2 font-mono text-[9px] text-[var(--phosphor-primary)]">{status}</p>
        ) : null}
      </PanelSection>
    </div>
  );
}
