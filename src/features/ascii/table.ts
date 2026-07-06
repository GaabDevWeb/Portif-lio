import { stripAnsi } from "@/features/ascii/ansi";

export type TableAlign = "left" | "right";

export type AsciiTable = {
  headers: string[];
  rows: string[][];
  align?: TableAlign[];
};

export function renderTable(table: AsciiTable): string[] {
  const widths = table.headers.map((h, idx) => {
    const headerW = stripAnsi(h).length;
    const colW = Math.max(
      headerW,
      ...table.rows.map((r) => stripAnsi(r[idx] ?? "").length),
    );
    return colW;
  });

  const align = table.align ?? table.headers.map(() => "left" as const);

  const padCell = (cell: string, idx: number) => {
    const w = widths[idx] ?? 0;
    const visible = stripAnsi(cell).length;
    const pad = Math.max(0, w - visible);
    if (align[idx] === "right") return `${" ".repeat(pad)}${cell}`;
    return `${cell}${" ".repeat(pad)}`;
  };

  const top = `┌${widths.map((w) => "─".repeat(w + 2)).join("┬")}┐`;
  const mid = `├${widths.map((w) => "─".repeat(w + 2)).join("┼")}┤`;
  const bottom = `└${widths.map((w) => "─".repeat(w + 2)).join("┴")}┘`;

  const renderRow = (row: string[]) =>
    `│ ${row.map((c, idx) => padCell(c ?? "", idx)).join(" │ ")} │`;

  const out: string[] = [top, renderRow(table.headers), mid];
  for (const row of table.rows) out.push(renderRow(row));
  out.push(bottom);
  return out;
}

