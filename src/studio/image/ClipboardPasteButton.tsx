"use client";

import { useCallback, useState } from "react";
import { ClipboardPaste } from "lucide-react";

import { readClipboardImageItem } from "@/features/ascii-engine/converters";
import { loadImageElement } from "@/features/ascii-interaction/image-pipeline";

interface ClipboardPasteButtonProps {
  onImageLoaded: (image: HTMLImageElement, previewUrl: string) => void;
  disabled?: boolean;
}

/**
 * MVP clipboard: lê imagem do clipboard (navigator.clipboard.read) e carrega no Convert.
 * Alternativa: Ctrl+V na zona de upload (ImageUploadZone).
 */
export function ClipboardPasteButton({ onImageLoaded, disabled }: ClipboardPasteButtonProps) {
  const [state, setState] = useState<"idle" | "busy" | "error" | "empty">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handlePaste = useCallback(async () => {
    if (disabled) return;
    setState("busy");
    setMessage(null);
    try {
      const item = await readClipboardImageItem();
      if (!item) {
        setState("empty");
        setMessage("Sem imagem no clipboard — copie uma imagem ou use Ctrl+V.");
        return;
      }

      let blob: Blob | null = null;
      for (const type of item.types) {
        if (!type.startsWith("image/")) continue;
        blob = await item.getType(type);
        break;
      }
      if (!blob) {
        setState("error");
        setMessage("Clipboard sem tipo image/* suportado.");
        return;
      }

      const previewUrl = URL.createObjectURL(blob);
      const image = await loadImageElement(blob);
      onImageLoaded(image, previewUrl);
      setState("idle");
      setMessage(null);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Falha ao ler clipboard.");
    }
  }, [disabled, onImageLoaded]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={disabled || state === "busy"}
        onClick={() => void handlePaste()}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-[var(--ui-border)] px-2 py-1.5 font-mono text-[10px] text-[var(--phosphor-primary)] hover:border-[var(--phosphor-dim)] disabled:opacity-50"
      >
        <ClipboardPaste size={12} aria-hidden />
        {state === "busy" ? "A ler clipboard…" : "Colar imagem do clipboard"}
      </button>
      {message ? (
        <p
          className={`text-[9px] ${
            state === "error" ? "text-[var(--stderr)]" : "text-[var(--ui-text-dim)]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
