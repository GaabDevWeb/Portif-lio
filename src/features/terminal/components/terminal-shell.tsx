"use client";

import { useCallback, useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";

import { SYSTEM, TERMINAL } from "@/constants/system";
import { phosphorTerminalTheme } from "@/config/theme";
import { registerTerminalWriter } from "@/features/sync/sync-bus";
import { getAutocompleteCandidates, executeInput } from "@/features/terminal/executor/command-executor";
import { CommandHistory } from "@/features/terminal/history/command-history";
import { buildPrompt } from "@/lib/utils";
import {
  applyCommandResult,
  buildCommandContext,
  useSessionStore,
} from "@/providers/session-store";
import { trackCommand } from "@/lib/analytics/track";

import "@xterm/xterm/css/xterm.css";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

interface TerminalShellProps {
  className?: string;
  mobile?: boolean;
}

export function TerminalShell({ className, mobile = false }: TerminalShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const historyRef = useRef<CommandHistory>(CommandHistory.load());
  const lineBufferRef = useRef("");
  const processingRef = useRef(false);
  const reverseSearchRef = useRef<{ active: boolean; query: string; index: number }>({
    active: false,
    query: "",
    index: -1,
  });
  const clearStreakRef = useRef<{ count: number; lastAt: number }>({ count: 0, lastAt: 0 });
  const runCommandRef = useRef<((term: Terminal, input: string) => Promise<void>) | null>(null);

  const user = useSessionStore((s) => s.user);
  const cwd = useSessionStore((s) => s.cwd);
  const isRoot = useSessionStore((s) => s.isRoot);
  const lastExitCode = useSessionStore((s) => s.lastExitCode);

  const writePrompt = useCallback((term: Terminal) => {
    const prefix =
      lastExitCode !== null && lastExitCode !== 0
        ? `\x1b[31m[exit ${lastExitCode}]\x1b[0m `
        : "";
    term.write(`\r\n${prefix}${buildPrompt(user, "devbox.local", cwd, "/home/guest", isRoot)}`);
    lineBufferRef.current = "";
  }, [cwd, isRoot, lastExitCode, user]);

  const writeResult = useCallback((term: Terminal, result: Awaited<ReturnType<typeof executeInput>>) => {
    if (result.clearScreen) {
      term.clear();
      return;
    }

    for (const line of result.lines) {
      const color = line.stream === "stderr" ? "\x1b[31m" : "\x1b[32m";
      term.writeln(`${color}${line.text}\x1b[0m`);
    }
  }, []);

  const runCommand = useCallback(async (term: Terminal, input: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    const trimmed = input.trim();
    if (trimmed) {
      if (trimmed === "clear") {
        const now = Date.now();
        const streak = clearStreakRef.current;
        if (now - streak.lastAt < 2000) {
          streak.count += 1;
        } else {
          streak.count = 1;
        }
        streak.lastAt = now;
        if (streak.count >= 3) {
          streak.count = 0;
          useSessionStore.getState().markEasterEgg("clear-glitch");
          term.writeln("\x1b[31m[glitch]\x1b[0m phosphor burn-in detected...");
          await sleep(200);
        }
      }

      historyRef.current.add(trimmed);
      useSessionStore.getState().addHistoryEntry(trimmed);
    }

    const ctx = buildCommandContext();
    const result = await executeInput(trimmed, ctx);
    if (trimmed) {
      const cmdName = trimmed.split(/\s+/)[0];
      if (result.exitCode === 0 && cmdName) {
        trackCommand(cmdName);
      }
    }
    applyCommandResult(result);
    if (result.clearHistory) {
      historyRef.current.clear();
    }
    writeResult(term, result);
    writePrompt(term);

    processingRef.current = false;
  }, [writePrompt, writeResult]);

  runCommandRef.current = runCommand;

  useEffect(() => {
    const handler = (event: Event) => {
      const term = terminalRef.current;
      const command = (event as CustomEvent<string>).detail;
      if (!term || !command || !runCommandRef.current) return;
      term.writeln("");
      void runCommandRef.current(term, command);
    };
    window.addEventListener("rootos:run-command", handler);
    return () => window.removeEventListener("rootos:run-command", handler);
  }, []);

  useEffect(() => {
    return registerTerminalWriter((lines) => {
      const term = terminalRef.current;
      if (!term) return;
      for (const line of lines) {
        term.writeln(`\x1b[2m${line}\x1b[0m`);
      }
    });
  }, []);

  useEffect(() => {
    const sessionHistory = useSessionStore.getState().history;
    const loaded = CommandHistory.load().list();
    const merged = [...new Set([...sessionHistory, ...loaded])];
    if (merged.length > 0) {
      historyRef.current = new CommandHistory(merged);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      cursorStyle: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "underline"
        : "block",
      fontSize: mobile ? TERMINAL.fontSizeMobile : TERMINAL.fontSize,
      fontFamily: TERMINAL.fontFamily,
      theme: phosphorTerminalTheme,
      scrollback: 5000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln(`\x1b[32mROOT OS ${SYSTEM.version} — ${SYSTEM.tagline}\x1b[0m`);
    term.writeln("\x1b[2m(c) 2026 Gabriel. All bugs reserved.\x1b[0m");
    term.writeln("");
    term.writeln("Landing active. Type 'help' or open Terminal from HUD.");
    writePrompt(term);

    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (data === "\r") {
        reverseSearchRef.current.active = false;
        const input = lineBufferRef.current;
        term.writeln("");
        void runCommand(term, input);
        return;
      }

      if (data === "\u007f") {
        if (lineBufferRef.current.length > 0) {
          lineBufferRef.current = lineBufferRef.current.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }

      if (data === "\u0003") {
        lineBufferRef.current = "";
        term.writeln("^C");
        writePrompt(term);
        return;
      }

      if (data === "\u0004") {
        term.writeln("");
        term.writeln("logout: use 'shutdown' to power off.");
        writePrompt(term);
        return;
      }

      if (data === "\u000c") {
        term.clear();
        writePrompt(term);
        return;
      }

      if (data === "\u0012") {
        const entries = historyRef.current.list().filter(Boolean);
        if (entries.length === 0) return;

        const state = reverseSearchRef.current;
        if (!state.active) {
          state.active = true;
          state.query = lineBufferRef.current;
          state.index = entries.length - 1;
        } else {
          state.index = Math.max(0, state.index - 1);
        }

        const match = entries[state.index] ?? "";
        lineBufferRef.current = match;
        term.write("\r\x1b[K");
        term.write(
          `(reverse-i-search)\`${state.query}\': ${buildPrompt(user, "devbox.local", cwd, "/home/guest", isRoot)}${match}`,
        );
        return;
      }

      if (data === "\u001b[A") {
        reverseSearchRef.current.active = false;
        const prev = historyRef.current.previous();
        if (prev !== null) {
          term.write("\r\x1b[K");
          lineBufferRef.current = prev;
          term.write(buildPrompt(user, "devbox.local", cwd, "/home/guest", isRoot) + prev);
        }
        return;
      }

      if (data === "\u001b[B") {
        reverseSearchRef.current.active = false;
        const next = historyRef.current.next();
        if (next !== null) {
          term.write("\r\x1b[K");
          lineBufferRef.current = next;
          term.write(buildPrompt(user, "devbox.local", cwd, "/home/guest", isRoot) + next);
        }
        return;
      }

      if (data === "\t") {
        const ctx = buildCommandContext();
        const input = lineBufferRef.current;
        const candidates = getAutocompleteCandidates(ctx, input);
        if (candidates.length === 1) {
          const completion = candidates[0];
          const parts = input.split(/\s+/);
          if (parts.length <= 1) {
            lineBufferRef.current = completion;
            term.write("\r\x1b[K");
            term.write(buildPrompt(user, "devbox.local", cwd, "/home/guest", isRoot) + completion);
          } else {
            const toAdd = completion.slice(parts[parts.length - 1].length);
            lineBufferRef.current += toAdd;
            term.write(toAdd);
          }
        } else if (candidates.length > 1) {
          term.writeln("");
          term.writeln(candidates.join("  "));
          writePrompt(term);
          term.write(lineBufferRef.current);
        }
        return;
      }

      if (code < 32 && code !== 9) return;

      lineBufferRef.current += data;
      term.write(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => fitAddon.fit());
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      terminalRef.current = null;
    };
  }, [cwd, isRoot, mobile, runCommand, user, writePrompt]);

  useEffect(() => {
    const term = terminalRef.current;
    if (!term) return;
    writePrompt(term);
  }, [cwd, lastExitCode, writePrompt]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="application"
      aria-label="ROOT OS Terminal"
      aria-live="polite"
      data-testid="terminal-shell"
      id="main-terminal"
    />
  );
}
