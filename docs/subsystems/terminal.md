# Terminal Subsystem

Modular terminal architecture for ROOT OS.

## Structure

```
features/terminal/
├── parser/          # Tokenizer + pipeline parsing
├── registry/        # Command registry
├── executor/        # Input → command dispatch
├── history/         # Command history (localStorage)
├── commands/        # One module per command
└── components/      # xterm.js shell
```

## Flow

```
xterm.onData → line buffer → Enter
  → parseInput → CommandRegistry.resolve
  → command.execute(ctx, argv) → CommandResult
  → applyCommandResult (session store) → render stdout/stderr
```

## Extension

Add a command:

1. Create `commands/<name>/index.ts` exporting `CommandDefinition`
2. Register in `registry/command-registry.ts`
3. Add tests in `executor/command-executor.test.ts`

## Phase 0 Commands

`help`, `ls`, `pwd`, `cd`, `cat`, `open`, `close`, `clear`, `whoami`, `exit`, `shutdown`
