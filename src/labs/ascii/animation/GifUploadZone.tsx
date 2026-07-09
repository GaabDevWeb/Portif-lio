"use client";

import { useCallback, useRef, useState } from "react";
import { Film, Upload } from "lucide-react";

interface GifUploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function GifUploadZone({ onFile, disabled }: GifUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (file: File) => {
      setError(null);
      if (file.type !== "image/gif" && !file.name.toLowerCase().endsWith(".gif")) {
        setError("Apenas ficheiros GIF são suportados.");
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handle(file);
      }}
      className={`rounded border border-dashed p-4 text-center transition-colors ${
        dragging
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/5"
          : "border-[var(--ui-border)]"
      } ${disabled ? "opacity-50" : "cursor-pointer hover:border-[var(--phosphor-dim)]"}`}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handle(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 text-[var(--phosphor-dim)]">
          <Upload size={16} aria-hidden />
          <Film size={16} aria-hidden />
        </div>
        <p className="font-mono text-[10px] text-[var(--ui-text)]">Upload GIF animado</p>
        <p className="text-[9px] text-[var(--ui-text-dim)]">Drag & drop ou clique</p>
      </div>
      {error ? <p className="mt-2 text-[9px] text-[var(--stderr)]">{error}</p> : null}
    </div>
  );
}
