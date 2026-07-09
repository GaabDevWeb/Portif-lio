"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectDocument } from "@/features/ascii-engine/document";
import {
  defaultProjectStore,
  downloadProjectZip,
  importProjectZip,
} from "@/features/ascii-engine/storage";
import { PanelButton, PanelSection } from "@/labs/ascii/ui/controls";

interface ProjectPanelProps {
  document: ProjectDocument;
  onDocumentChange: (doc: ProjectDocument) => void;
}

export function ProjectPanel({ document, onDocumentChange }: ProjectPanelProps) {
  const [name, setName] = useState(document.getMeta().name);
  const [savedList, setSavedList] = useState<Array<{ id: string; name: string; updatedAt: string }>>(
    [],
  );
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshList = useCallback(async () => {
    try {
      const list = await defaultProjectStore.list();
      setSavedList(list);
    } catch {
      setSavedList([]);
    }
  }, []);

  useEffect(() => {
    setName(document.getMeta().name);
  }, [document]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const saveIdb = async () => {
    setBusy(true);
    setStatus(null);
    try {
      document.setMeta({ name: name || "Untitled Project" });
      await defaultProjectStore.put(document);
      setStatus("Projeto guardado no IndexedDB.");
      await refreshList();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha ao guardar.");
    } finally {
      setBusy(false);
    }
  };

  const exportZip = async () => {
    setBusy(true);
    setStatus(null);
    try {
      document.setMeta({ name: name || "Untitled Project" });
      await downloadProjectZip(document);
      setStatus("Download .ascii-project.zip iniciado.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha no export.");
    } finally {
      setBusy(false);
    }
  };

  const loadIdb = async (id: string) => {
    setBusy(true);
    setStatus(null);
    try {
      const loaded = await defaultProjectStore.get(id);
      if (!loaded) {
        setStatus("Projeto não encontrado.");
        return;
      }
      onDocumentChange(loaded);
      setName(loaded.getMeta().name);
      setStatus(`Carregado: ${loaded.getMeta().name}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha ao carregar.");
    } finally {
      setBusy(false);
    }
  };

  const onImportFile = async (file: File) => {
    setBusy(true);
    setStatus(null);
    try {
      const { document: imported } = await importProjectZip(file);
      onDocumentChange(imported);
      setName(imported.getMeta().name);
      setStatus(`Importado: ${imported.getMeta().name}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "ZIP inválido.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3">
      <PanelSection title="Project">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1 font-mono text-[10px]"
          placeholder="Nome do projeto"
        />
        <p className="mb-2 font-mono text-[9px] text-[var(--ui-text-dim)]">
          id: {document.id.slice(0, 8)}… · v{document.toJSON().version}
        </p>
        <div className="flex flex-wrap gap-1">
          <PanelButton disabled={busy} className="flex-1" onClick={() => void saveIdb()}>
            Save IDB
          </PanelButton>
          <PanelButton disabled={busy} className="flex-1" onClick={() => void exportZip()}>
            Export ZIP
          </PanelButton>
          <PanelButton
            disabled={busy}
            className="flex-1"
            onClick={() => fileRef.current?.click()}
          >
            Import ZIP
          </PanelButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,.ascii-project.zip,application/zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onImportFile(file);
            e.target.value = "";
          }}
        />
        {status ? (
          <p className="mt-2 font-mono text-[9px] text-[var(--phosphor-primary)]">{status}</p>
        ) : null}
      </PanelSection>

      <PanelSection title="Saved (IndexedDB)">
        {savedList.length === 0 ? (
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">Nenhum projeto guardado.</p>
        ) : (
          <ul className="space-y-1">
            {savedList.map((row) => (
              <li key={row.id}>
                <PanelButton
                  disabled={busy}
                  className="w-full text-left"
                  onClick={() => void loadIdb(row.id)}
                >
                  <span className="block truncate">{row.name}</span>
                  <span className="block text-[8px] text-[var(--ui-text-dim)]">
                    {new Date(row.updatedAt).toLocaleString()}
                  </span>
                </PanelButton>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>
    </div>
  );
}
