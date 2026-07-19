"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import { measureAsciiLayout } from "@/features/ascii-interaction/utils/layout-size";
import {
  composeScene,
  type SceneDocument,
  type SceneHistory,
} from "@/features/ascii-engine/scene";
import {
  cameraWorldTransform,
  fitCameraToBounds,
  panCameraByScreen,
  sceneContentBounds,
  screenToWorld,
  worldToCell,
  zoomAtScreen,
  type CellSize,
} from "@/features/ascii-engine/scene/camera";
import { BrushEngine } from "@/features/ascii-engine/brush";
import {
  ToolHost,
  SelectionModel,
  createDefaultToolHost,
  type SceneToolContext,
  type PointerWorld,
} from "@/features/ascii-engine/tools";
import { LabViewport } from "@/legacy/LabViewport";
import { emptyMatrix } from "@/features/ascii-engine/scene/scene-document";

export interface SceneViewportProps {
  scene: SceneDocument;
  history: SceneHistory;
  config: AsciiInteractionConfig;
  toolHost?: ToolHost;
  selection?: SelectionModel;
  brush?: BrushEngine;
  onChange?: () => void;
  className?: string;
}

/**
 * Infinite-style scene viewport: composeScene → LabViewport + camera transform.
 */
export function SceneViewport({
  scene,
  history,
  config,
  toolHost: externalHost,
  selection: externalSelection,
  brush: externalBrush,
  onChange,
  className,
}: SceneViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  const requestRender = useCallback(() => {
    setTick((n) => n + 1);
    onChange?.();
  }, [onChange]);

  const hostRef = useRef(externalHost ?? createDefaultToolHost());
  const selectionRef = useRef(externalSelection ?? new SelectionModel());
  const brushRef = useRef(externalBrush ?? new BrushEngine());
  const strokeBufferRef = useRef<AsciiMatrix | null>(null);
  const [viewport, setViewport] = useState({ width: 800, height: 600 });

  useEffect(() => {
    return scene.subscribe(() => setTick((n) => n + 1));
  }, [scene]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewport({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setViewport({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const camera = scene.getCamera();
  const revision = scene.getRevision();
  const composed = useMemo(() => {
    void tick;
    void revision;
    const base = composeScene(scene);
    const buf = strokeBufferRef.current;
    if (!buf) return base;
    const out = structuredClone(base);
    for (const c of buf.cells) {
      if (c.char === " ") continue;
      if (c.col < 0 || c.row < 0 || c.col >= out.cols || c.row >= out.rows) continue;
      out.cells[c.row * out.cols + c.col] = { ...c };
    }
    return out;
  }, [scene, tick, revision]);

  const layout = useMemo(
    () => measureAsciiLayout(composed, config),
    [composed, config],
  );
  const cellSize: CellSize = useMemo(
    () => ({ width: layout.cellWidth, height: layout.cellHeight }),
    [layout.cellWidth, layout.cellHeight],
  );

  const viewConfig = useMemo(
    () => mergeAsciiConfig({ ...config, enableInteraction: false }),
    [config],
  );

  const buildPointer = useCallback(
    (e: React.PointerEvent): PointerWorld => {
      const rect = containerRef.current?.getBoundingClientRect();
      const screenX = e.clientX - (rect?.left ?? 0);
      const screenY = e.clientY - (rect?.top ?? 0);
      const world = screenToWorld(
        { x: screenX, y: screenY },
        camera,
        viewport,
        cellSize,
      );
      const cell = worldToCell(world);
      return {
        world,
        col: cell.col,
        row: cell.row,
        screenX,
        screenY,
        pressure: e.pressure || 1,
        buttons: e.buttons,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      };
    },
    [camera, viewport, cellSize],
  );

  const buildCtx = useCallback((): SceneToolContext => {
    return {
      scene,
      selection: selectionRef.current,
      camera: scene.getCamera(),
      setCamera: (patch) => {
        scene.setCamera(patch);
      },
      brush: brushRef.current,
      history,
      pointer: {
        world: { x: 0, y: 0 },
        col: 0,
        row: 0,
        screenX: 0,
        screenY: 0,
        pressure: 1,
        buttons: 0,
        shiftKey: false,
        altKey: false,
        metaKey: false,
      },
      viewport,
      cellSize,
      requestRender,
      getStrokeBuffer: () => strokeBufferRef.current,
      setStrokeBuffer: (m) => {
        strokeBufferRef.current = m;
      },
    };
  }, [scene, history, viewport, cellSize, requestRender]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const ev = buildPointer(e);
      const ctx = buildCtx();
      ctx.pointer = ev;
      hostRef.current.pointerDown(ctx, ev);
    },
    [buildPointer, buildCtx],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ev = buildPointer(e);
      const ctx = buildCtx();
      ctx.pointer = ev;
      hostRef.current.pointerMove(ctx, ev);
    },
    [buildPointer, buildCtx],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const ev = buildPointer(e);
      const ctx = buildCtx();
      ctx.pointer = ev;
      hostRef.current.pointerUp(ctx, ev);
      requestRender();
    },
    [buildPointer, buildCtx, requestRender],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        // pan with wheel
        const next = panCameraByScreen(
          scene.getCamera(),
          -e.deltaX,
          -e.deltaY,
          cellSize,
        );
        scene.setCamera(next);
        return;
      }
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      const screen = {
        x: e.clientX - (rect?.left ?? 0),
        y: e.clientY - (rect?.top ?? 0),
      };
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const next = zoomAtScreen(scene.getCamera(), factor, screen, viewport, cellSize);
      scene.setCamera(next);
    },
    [scene, cellSize, viewport],
  );

  const fitScene = useCallback(() => {
    const bounds = sceneContentBounds(scene.getWidth(), scene.getHeight());
    const fitted = fitCameraToBounds(bounds, viewport, cellSize);
    scene.setCamera(fitted);
  }, [scene, viewport, cellSize]);

  // Fit once when viewport becomes usable
  const fittedRef = useRef(false);
  useEffect(() => {
    if (fittedRef.current || viewport.width < 40 || viewport.height < 40) return;
    fittedRef.current = true;
    fitScene();
  }, [viewport, fitScene]);

  const worldTransform = cameraWorldTransform(camera, viewport, cellSize);
  const cursor = hostRef.current.getActive()?.cursor ?? "default";

  return (
    <div className={`relative flex h-full min-h-0 flex-col ${className ?? ""}`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--ui-border)] bg-[var(--bg-panel)] px-2 py-1">
        <button
          type="button"
          className="cursor-pointer font-mono text-[9px] uppercase text-[var(--ui-text-dim)] hover:text-[var(--phosphor-primary)]"
          onClick={fitScene}
        >
          Fit
        </button>
        <button
          type="button"
          className="cursor-pointer font-mono text-[9px] uppercase text-[var(--ui-text-dim)] hover:text-[var(--phosphor-primary)]"
          onClick={() => scene.setCamera({ showGrid: !camera.showGrid })}
        >
          Grid {camera.showGrid ? "on" : "off"}
        </button>
        <span className="font-mono text-[9px] text-[var(--ui-text-dim)]">
          zoom {(camera.zoom * 100).toFixed(0)}%
        </span>
        <span className="ml-auto font-mono text-[9px] text-[var(--ui-text-dim)]">
          {scene.getWidth()}×{scene.getHeight()} · {Object.keys(scene.toJSON().objects).length} objs
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-[var(--bg-void)]"
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {camera.showGrid ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, #1a3a1a 1px, transparent 1px),
                linear-gradient(to bottom, #1a3a1a 1px, transparent 1px)
              `,
              backgroundSize: `${cellSize.width * camera.zoom}px ${cellSize.height * camera.zoom}px`,
              backgroundPosition: `${viewport.width / 2 - camera.x * cellSize.width * camera.zoom}px ${viewport.height / 2 - camera.y * cellSize.height * camera.zoom}px`,
            }}
          />
        ) : null}

        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: worldTransform }}
        >
          <LabViewport source={composed} config={viewConfig} label="Scene" />
        </div>
      </div>
    </div>
  );
}

/** Expose emptyMatrix for stroke buffer helpers in tests. */
export { emptyMatrix };
