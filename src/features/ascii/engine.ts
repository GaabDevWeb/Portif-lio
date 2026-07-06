import type { AsciiTheme } from "@/features/ascii/themes";
import { ROOT_OS_THEME } from "@/features/ascii/themes";
import type { AsciiIconId } from "@/features/ascii/icons";
import { icon as iconImpl } from "@/features/ascii/icons";
import { boxLines, type BoxStyle } from "@/features/ascii/box";
import { renderTable, type AsciiTable } from "@/features/ascii/table";
import { renderBannerText, renderPresetBanner, type BannerPreset } from "@/features/ascii/banner";
import { renderTree, type AsciiTreeNode } from "@/features/ascii/tree";
import type { CommandResult, CommandOutputLine } from "@/types/root-os";
import { renderAsciiLines, splitMultiline } from "@/features/ascii/renderer";
import { hasAnsi } from "@/features/ascii/ansi";

export class ASCIIEngine {
  constructor(private theme: AsciiTheme = ROOT_OS_THEME) {}

  getTheme(): AsciiTheme {
    return this.theme;
  }

  icon(id: AsciiIconId): string {
    return iconImpl(id);
  }

  banner(text: string): string[] {
    return renderBannerText(text);
  }

  presetBanner(preset: BannerPreset): string[] {
    return renderPresetBanner(preset);
  }

  box(content: string | string[], opts?: { title?: string; style?: BoxStyle; paddingX?: number }): string[] {
    return boxLines(content, opts);
  }

  table(table: AsciiTable): string[] {
    return renderTable(table);
  }

  tree(root: AsciiTreeNode, opts?: { maxDepth?: number }): string[] {
    return renderTree(root, opts);
  }

  /**
   * Normaliza um `CommandResult` sem alterar side-effects.
   * - Split de multiline em múltiplas linhas
   * - Mantém ANSI existente (não duplica)
   * - Mantém `stream` original
   */
  renderCommandResult(result: CommandResult): CommandResult {
    if (!result.lines.length) return result;

    const rendered: CommandOutputLine[] = [];
    for (const line of result.lines) {
      const parts = splitMultiline(line.text);
      for (const part of parts) {
        rendered.push({ stream: line.stream, text: part });
      }
    }
    return { ...result, lines: rendered };
  }

  /**
   * Renderiza linhas “ricas” com estilo ANSI opcional.
   * (Usado pelos comandos novos; comandos antigos continuam a devolver strings.)
   */
  render(lines: Parameters<typeof renderAsciiLines>[0]): string[] {
    return renderAsciiLines(lines);
  }

  shouldColorizeStream(text: string): boolean {
    return !hasAnsi(text);
  }
}

export const ascii = new ASCIIEngine();

