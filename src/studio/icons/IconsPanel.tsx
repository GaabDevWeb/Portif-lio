"use client";

import { useMemo, useState } from "react";

import {
  ICON_CATEGORIES,
  ICON_STYLES,
  listIcons,
  type AsciiIcon,
  type IconCategory,
  type IconStyle,
} from "@/features/ascii-engine/icons";
import { downloadBlob, downloadText, writeTextToClipboard } from "@/features/ascii-engine/browser";
import { PanelButton } from "@/studio/ui/controls";

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const FONT_SIZE = 11;
const LINE_HEIGHT = FONT_SIZE * 1.25;
const CHAR_WIDTH = FONT_SIZE * 0.62;
const CANVAS_PADDING = 8;

function getPhosphorColor(): string {
  if (typeof document === "undefined") return "#39ff14";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--phosphor-primary")
    .trim();
  return value || "#39ff14";
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asciiToSvg(ascii: string, color: string): string {
  const lines = ascii.split("\n");
  const maxLen = Math.max(...lines.map((line) => line.length), 1);
  const width = Math.ceil(maxLen * CHAR_WIDTH + CANVAS_PADDING * 2);
  const height = Math.ceil(lines.length * LINE_HEIGHT + CANVAS_PADDING * 2);

  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? FONT_SIZE : LINE_HEIGHT;
      return `<tspan x="${CANVAS_PADDING}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<text font-family="${MONO_FONT}" font-size="${FONT_SIZE}" fill="${color}">${tspans}</text>`,
    `</svg>`,
  ].join("");
}

function renderAsciiToPng(ascii: string, color: string): Promise<Blob> {
  const lines = ascii.split("\n");
  const maxLen = Math.max(...lines.map((line) => line.length), 1);
  const width = Math.ceil(maxLen * CHAR_WIDTH + CANVAS_PADDING * 2);
  const height = Math.ceil(lines.length * LINE_HEIGHT + CANVAS_PADDING * 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Canvas 2D unavailable"));
  }

  ctx.font = `${FONT_SIZE}px ${MONO_FONT}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    ctx.fillText(line, CANVAS_PADDING, CANVAS_PADDING + index * LINE_HEIGHT);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png");
  });
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
        active
          ? "border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)]/10 text-[var(--phosphor-primary)]"
          : "border-[var(--ui-border)] text-[var(--ui-text-dim)] hover:border-[var(--phosphor-dim)]"
      }`}
    >
      {label}
    </button>
  );
}

function IconCard({ icon }: { icon: AsciiIcon }) {
  const [status, setStatus] = useState<string | null>(null);
  const color = getPhosphorColor();
  const filename = icon.id;

  const flash = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 1400);
  };

  const copyAscii = async () => {
    const result = await writeTextToClipboard(icon.ascii);
    flash(result === "copied" ? "Copied" : "Copy failed");
  };

  const downloadTxt = () => {
    downloadText(icon.ascii, `${filename}.txt`);
    flash("TXT saved");
  };

  const downloadPng = async () => {
    try {
      const blob = await renderAsciiToPng(icon.ascii, color);
      downloadBlob(blob, `${filename}.png`);
      flash("PNG saved");
    } catch {
      flash("PNG failed");
    }
  };

  const downloadSvg = () => {
    const svg = asciiToSvg(icon.ascii, color);
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
    flash("SVG saved");
  };

  return (
    <article className="flex flex-col border border-[var(--ui-border)]/60 bg-[var(--bg-void)]">
      <pre className="overflow-x-auto whitespace-pre px-2 py-2 font-mono text-[9px] leading-tight text-[var(--phosphor-primary)]">
        {icon.ascii}
      </pre>

      <div className="border-t border-[var(--ui-border)]/40 px-2 py-1.5">
        <p className="truncate font-mono text-[10px] text-[var(--ui-text)]">{icon.name}</p>
        <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--ui-text-dim)]">
          {icon.category} · {icon.style}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-t border-[var(--ui-border)]/40 p-1.5">
        <PanelButton className="px-1.5 py-0.5 text-[8px]" onClick={copyAscii}>
          Copy ASCII
        </PanelButton>
        <PanelButton className="px-1.5 py-0.5 text-[8px]" onClick={downloadTxt}>
          TXT
        </PanelButton>
        <PanelButton className="px-1.5 py-0.5 text-[8px]" onClick={downloadPng}>
          Download PNG
        </PanelButton>
        <PanelButton className="px-1.5 py-0.5 text-[8px]" onClick={downloadSvg}>
          Download SVG
        </PanelButton>
      </div>

      {status ? (
        <p className="border-t border-[var(--ui-border)]/40 px-2 py-0.5 font-mono text-[8px] text-[var(--amber-led)]">
          {status}
        </p>
      ) : null}
    </article>
  );
}

export function IconsPanel() {
  const [category, setCategory] = useState<IconCategory | "all">("all");
  const [style, setStyle] = useState<IconStyle | "all">("all");
  const [search, setSearch] = useState("");

  const icons = useMemo(
    () =>
      listIcons({
        category: category === "all" ? undefined : category,
        style: style === "all" ? undefined : style,
        search,
      }),
    [category, style, search],
  );

  return (
    <div className="flex h-full min-h-0 bg-[var(--bg-void)]">
      <aside className="flex w-44 shrink-0 flex-col gap-3 overflow-y-auto border-r border-[var(--ui-border)] px-3 py-4">
        <div>
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--amber-led)]">
            Category
          </p>
          <div className="flex flex-wrap gap-1">
            <FilterChip label="All" active={category === "all"} onClick={() => setCategory("all")} />
            {ICON_CATEGORIES.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={category === item}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--amber-led)]">
            Style
          </p>
          <div className="flex flex-wrap gap-1">
            <FilterChip label="All" active={style === "all"} onClick={() => setStyle("all")} />
            {ICON_STYLES.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={style === item}
                onClick={() => setStyle(item)}
              />
            ))}
          </div>
        </div>

        <label className="block font-mono text-[9px] text-[var(--ui-text-dim)]">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="name, tags…"
            className="mt-1 w-full rounded border border-[var(--ui-border)] bg-[var(--bg-void)] px-2 py-1 font-mono text-[10px] text-[var(--phosphor-primary)] placeholder:text-[var(--ui-text-dim)]"
          />
        </label>

        <p className="font-mono text-[8px] text-[var(--ui-text-dim)]">
          {icons.length} icon{icons.length === 1 ? "" : "s"}
        </p>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto px-4 py-4">
        <header className="mb-4 border-b border-[var(--ui-border)]/50 pb-3">
          <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--phosphor-primary)]">
            Icon Library
          </h1>
          <p className="mt-1 font-mono text-[9px] text-[var(--ui-text-dim)]">
            Copy or export ASCII icons — convert-ready assets.
          </p>
        </header>

        {icons.length === 0 ? (
          <p className="font-mono text-[10px] text-[var(--ui-text-dim)]">No icons match filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {icons.map((icon) => (
              <IconCard key={icon.id} icon={icon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
