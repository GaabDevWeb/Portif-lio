import { SECTION_TERMINAL_ECHO } from "@/features/sync/section-map";
import type { SectionId, SyncEvent } from "@/types/root-os";

type TerminalWriter = (lines: string[]) => void;

let terminalWriter: TerminalWriter | null = null;
let scrollToSectionHandler: ((section: SectionId) => void) | null = null;
let focusContactHandler: (() => void) | null = null;

export function registerTerminalWriter(writer: TerminalWriter): () => void {
  terminalWriter = writer;
  return () => {
    terminalWriter = null;
  };
}

export function registerScrollToSection(handler: (section: SectionId) => void): () => void {
  scrollToSectionHandler = handler;
  return () => {
    scrollToSectionHandler = null;
  };
}

export function registerFocusContact(handler: () => void): () => void {
  focusContactHandler = handler;
  return () => {
    focusContactHandler = null;
  };
}

export function writelnToTerminal(lines: string[]): void {
  if (!lines.length || !terminalWriter) return;
  terminalWriter(lines);
}

export function dispatchSyncEvent(event: SyncEvent): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rootos:sync", { detail: event }));
  }
}

export function handleSyncSideEffects(
  event: SyncEvent,
  options: {
    terminalOpen: boolean;
    activeSection: SectionId;
  },
): void {
  switch (event.type) {
    case "section.enter": {
      if (event.origin === "landing" && options.terminalOpen && event.section !== options.activeSection) {
        const echo = SECTION_TERMINAL_ECHO[event.section];
        if (echo) writelnToTerminal([echo]);
      }
      break;
    }
    case "section.goto": {
      if (event.origin !== "landing") {
        scrollToSectionHandler?.(event.section);
      }
      if (event.section === "contact") {
        focusContactHandler?.();
      }
      break;
    }
    case "terminal.writeln": {
      if (event.origin !== "terminal") {
        writelnToTerminal(event.lines);
      }
      break;
    }
    case "contact.compose": {
      if (event.origin !== "terminal") {
        scrollToSectionHandler?.("contact");
        focusContactHandler?.();
        if (options.terminalOpen) writelnToTerminal(["$ mail --compose"]);
      }
      break;
    }
    case "resume.download": {
      if (event.origin !== "terminal" && options.terminalOpen) {
        writelnToTerminal(["$ wget resume.pdf"]);
      }
      break;
    }
    case "project.open": {
      if (options.terminalOpen && (event.origin === "landing" || event.origin === "wm")) {
        writelnToTerminal([`Launching ${event.title}.app...`]);
      }
      break;
    }
    case "project.close": {
      if (options.terminalOpen && event.origin === "wm") {
        writelnToTerminal(["Application terminated."]);
      }
      break;
    }
    default:
      break;
  }
}
