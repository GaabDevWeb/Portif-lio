"use client";

import { useCallback, useRef, useState } from "react";
import { Film, Upload } from "lucide-react";

interface GifUploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

function isAnimationFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/gif" ||
    file.type === "image/webp" ||
    name.endsWith(".gif") ||
    name.endsWith(".webp")
  );
}

/** Upload zone for GIF and animated/static WEBP. */
export function GifUploadZone({ onFile, disabled }: GifUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (file: File) => {
      setError(null);
      if (!isAnimationFile(file)) {
        setError("Apenas GIF ou WEBP são suportados.");
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
        accept="image/gif,image/webp,.gif,.webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handle(file);
          e.target.value = "";
        }}
      />
      <Film className="mx-auto mb-2 h-6 w-6 text-[var(--phosphor-dim)]" aria-hidden />
      <p className="font-mono text-[10px] text-[var(--phosphor-primary)]">
        <Upload className="mr-1 inline h-3 w-3" aria-hidden />
        Drop GIF / WEBP or click
      </p>
      <p className="mt-1 font-mono text-[8px] text-[var(--ui-text-dim)]">
        Animated WEBP requires Chromium ImageDecoder
      </p>
      {error ? (
        <p className="mt-2 font-mono text-[9px] text-[var(--stderr)]">{error}</p>
      ) : null}
    </div>
  );
}
