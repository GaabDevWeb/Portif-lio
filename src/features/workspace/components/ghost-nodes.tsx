"use client";

import { MODULE_IDS, MODULE_REGISTRY } from "@/features/workspace/module-registry";
import { useWorkspaceStore } from "@/providers/workspace-store";
import type { ModuleId } from "@/types/workspace";
import { cn } from "@/lib/utils";

export function GhostNodes() {
  const modules = useWorkspaceStore((s) => s.modules);
  const discoverModule = useWorkspaceStore((s) => s.discoverModule);
  const spawnModule = useWorkspaceStore((s) => s.spawnModule);
  const probeModule = useWorkspaceStore((s) => s.probeModule);
  const systemPhase = useWorkspaceStore((s) => s.systemPhase);

  if (systemPhase === "BOOT" || systemPhase === "TERMINAL_OVERRIDE") return null;

  return (
    <>
      {MODULE_IDS.map((id) => {
        const mod = modules[id];
        if (mod.mounted || mod.discovered) return null;

        const def = MODULE_REGISTRY[id];
        const { x, y, width, height } = def.defaultBounds;

        return (
          <button
            key={id}
            type="button"
            aria-label={`Discover ${def.title}`}
            className={cn(
              "absolute cursor-crosshair border border-dashed border-[var(--ui-border)] bg-[var(--bg-void)]/40",
              "font-mono text-[10px] text-[var(--phosphor-dim)] transition-colors",
              "hover:border-[var(--phosphor-primary)] hover:text-[var(--phosphor-primary)]",
            )}
            style={{ left: x, top: y, width, height, zIndex: 0 }}
            onPointerEnter={() => probeModule(id)}
            onClick={() => {
              discoverModule(id);
              spawnModule(id, "ghost");
            }}
          >
            <span className="absolute top-2 left-2 opacity-60">{def.code}</span>
            <span className="absolute right-2 bottom-2 opacity-40">[ undiscovered ]</span>
          </button>
        );
      })}
    </>
  );
}

export function usePanDiscovery(enabled: boolean) {
  const camera = useWorkspaceStore((s) => s.camera);
  const modules = useWorkspaceStore((s) => s.modules);
  const discoverModule = useWorkspaceStore((s) => s.discoverModule);

  useEffect(() => {
    if (!enabled) return;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const viewLeft = -camera.x / camera.scale;
    const viewTop = -camera.y / camera.scale;
    const viewRight = viewLeft + viewportW / camera.scale;
    const viewBottom = viewTop + viewportH / camera.scale;

    for (const id of MODULE_IDS) {
      const mod = modules[id];
      if (mod.discovered || mod.mounted) continue;

      const b = MODULE_REGISTRY[id as ModuleId].defaultBounds;
      const intersects =
        b.x < viewRight &&
        b.x + b.width > viewLeft &&
        b.y < viewBottom &&
        b.y + b.height > viewTop;

      if (intersects) {
        discoverModule(id as ModuleId);
      }
    }
  }, [camera.x, camera.y, camera.scale, discoverModule, enabled, modules]);
}
