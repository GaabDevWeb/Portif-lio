"use client";

import { useCallback, useRef, useState } from "react";
import { Layers } from "lucide-react";

import {
  convertBatch,
  defaultConverterRegistry,
  type BatchConvertResult,
} from "@/features/ascii-engine/converters";

/**
 * Batch real (W3): File[] → conversão sequencial via adapters ready (image/gif/svg).
 * ZIP/pasta multi-ficheiro ainda futuro.
 */
export function BatchConvertStub() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<BatchConvertResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setBusy(true);
    setResult(null);
    setProgress({ completed: 0, total: files.length });
    try {
      const out = await convertBatch(files, {
        processReady: true,
        findAdapter: (file) => defaultConverterRegistry.findFor(file),
        onProgress: (completed, total) => setProgress({ completed, total }),
      });
      setResult(out);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, []);

  return (
    <div className="space-y-2">
      <div
        className={`rounded border border-dashed border-[var(--ui-border)] p-3 text-center ${
          busy ? "opacity-50" : "cursor-pointer hover:border-[var(--phosphor-dim)]"
        }`}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,.svg"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-1.5">
          <Layers size={14} className="text-[var(--phosphor-dim)]" aria-hidden />
          <p className="font-mono text-[10px] text-[var(--ui-text)]">
            {busy
              ? progress
                ? `A converter ${progress.completed}/${progress.total}…`
                : "A processar…"
              : "Selecionar vários ficheiros"}
          </p>
          <p className="text-[9px] text-[var(--ui-text-dim)]">
            Batch sequencial — image/gif/svg (ZIP futuro)
          </p>
        </div>
      </div>

      {result ? (
        <div className="space-y-1.5">
          <p className="font-mono text-[9px] text-[var(--amber-led)]">
            status: {result.status}
          </p>
          <p className="text-[9px] text-[var(--ui-text-dim)]">{result.message}</p>
          <ul className="max-h-32 space-y-1 overflow-y-auto">
            {result.items.map((item) => (
              <li
                key={`${item.name}-${item.status}`}
                className="flex justify-between gap-2 font-mono text-[9px]"
              >
                <span className="truncate text-[var(--ui-text)]" title={item.note}>
                  {item.name}
                </span>
                <span
                  className={`shrink-0 ${
                    item.status === "done"
                      ? "text-[var(--phosphor-primary)]"
                      : item.status === "error"
                        ? "text-[var(--stderr)]"
                        : "text-[var(--phosphor-dim)]"
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
