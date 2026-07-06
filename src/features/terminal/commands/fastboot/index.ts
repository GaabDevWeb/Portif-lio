import type { CommandDefinition } from "@/types/root-os";
import { useSessionStore } from "@/providers/session-store";
import { success, stdout, misuse } from "../shared";

export const fastbootCommand: CommandDefinition = {
  name: "fastboot",
  description: "Toggle or enable fast boot (skip cinematic boot)",
  usage: "fastboot [on|off]",
  category: "system",
  execute(_ctx, argv) {
    const arg = argv[0]?.toLowerCase();
    const store = useSessionStore.getState();

    if (!arg || arg === "on" || arg === "1" || arg === "true") {
      store.setFastboot(true);
      return success([
        ...stdout("fastboot enabled — cinematic boot will be skipped on next load."),
        ...stdout("Reload the page to apply."),
      ]);
    }

    if (arg === "off" || arg === "0" || arg === "false") {
      store.setFastboot(false);
      return success(stdout("fastboot disabled."));
    }

    return misuse("fastboot: usage: fastboot [on|off]");
  },
};
