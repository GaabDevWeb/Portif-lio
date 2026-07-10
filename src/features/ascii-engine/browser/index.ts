/** Browser adapters — download e clipboard (extraíveis para @ascii-engine/browser). */

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined") {
    throw new Error("downloadBlob requer ambiente browser.");
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string, mime = "text/plain"): void {
  downloadBlob(new Blob([content], { type: `${mime};charset=utf-8` }), filename);
}

export type ClipboardWriteResult = "copied" | "unsupported" | "error";

export async function writeTextToClipboard(text: string): Promise<ClipboardWriteResult> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      /* fallback */
    }
  }

  if (typeof document === "undefined") return "unsupported";

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok ? "copied" : "unsupported";
  } catch {
    return "error";
  }
}

/**
 * Escreve text/html + text/plain no clipboard (ClipboardItem).
 * Fallback: só plain text via writeTextToClipboard.
 */
export async function writeHtmlToClipboard(
  html: string,
  plainFallback?: string,
): Promise<ClipboardWriteResult> {
  const plain = plainFallback ?? html.replace(/<[^>]+>/g, "");

  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard?.write &&
    typeof ClipboardItem !== "undefined"
  ) {
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
      return "copied";
    } catch {
      /* fallback plain */
    }
  }

  return writeTextToClipboard(plain);
}
