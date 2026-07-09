"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";

import {
  isSupportedImageMime,
  loadImageFromFile,
} from "@/features/ascii-interaction/image-pipeline";

interface ImageUploadZoneProps {
  onImageLoaded: (image: HTMLImageElement, previewUrl: string) => void;
  disabled?: boolean;
}

export function ImageUploadZone({ onImageLoaded, disabled }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const img = await loadImageFromFile(file);
        const previewUrl = URL.createObjectURL(file);
        onImageLoaded(img, previewUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar imagem.");
      }
    },
    [onImageLoaded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [disabled, handleFile],
  );

  const onPaste = useCallback(
    async (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (file && isSupportedImageMime(file.type)) {
          e.preventDefault();
          await handleFile(file);
          return;
        }
      }
    },
    [disabled, handleFile],
  );

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded border border-dashed p-4 text-center transition-colors ${
        dragging
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/5"
          : "border-[var(--ui-border)]"
      } ${disabled ? "opacity-50" : "cursor-pointer hover:border-[var(--phosphor-dim)]"}`}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 text-[var(--phosphor-dim)]">
          <Upload size={16} aria-hidden />
          <ImageIcon size={16} aria-hidden />
        </div>
        <p className="font-mono text-[10px] text-[var(--ui-text)]">
          Arraste, clique ou Ctrl+V
        </p>
        <p className="text-[9px] text-[var(--ui-text-dim)]">PNG · JPG · WEBP</p>
      </div>
      {error ? <p className="mt-2 text-[9px] text-[var(--stderr)]">{error}</p> : null}
    </div>
  );
}
