"use client";

import type { LabDebugOptions } from "@/studio/types";
import type { AsciiDebugSnapshot, AsciiEngineStats } from "@/features/ascii-interaction/types";

export interface DebugOverlayProps {
  stats: AsciiEngineStats | null;
  snapshot: AsciiDebugSnapshot | null;
  options: LabDebugOptions;
}

export function DebugOverlay({ stats, snapshot, options }: DebugOverlayProps) {
  if (!options.enabled || !stats) return null;

  return (
    <>
      <div className="pointer-events-none absolute right-3 top-3 z-20 min-w-[180px] rounded border border-[#2a4a2a] bg-[#0a120a]/90 p-3 font-mono text-[10px] leading-relaxed text-[#9dff9d]">
        <div className="mb-2 text-[9px] uppercase tracking-widest text-[#5a8a5a]">Debug</div>
        <div>FPS: {stats.fps}</div>
        <div>Frame: {stats.frameTimeMs.toFixed(1)} ms</div>
        <div>Render: {stats.renderTimeMs.toFixed(2)} ms</div>
        <div>Chars: {stats.characterCount.toLocaleString()}</div>
        <div>Active: {stats.activeCharacterCount.toLocaleString()}</div>
        <div>Dirty: {stats.dirtyCount}</div>
        <div>Radius: {stats.cursorRadius.toFixed(0)} px</div>
        <div>Area: {Math.round(stats.influencedArea).toLocaleString()} px²</div>
        <div>State: {stats.surfaceState}</div>
        {stats.memoryMb !== undefined ? <div>Heap: {stats.memoryMb} MB</div> : null}
      </div>

      {snapshot && options.showGrid ? (
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          aria-hidden
        >
          {Array.from({ length: snapshot.cols + 1 }, (_, c) => {
            const x =
              snapshot.layoutOffsetX + c * snapshot.cellWidth;
            return (
              <line
                key={`col-${c}`}
                x1={x}
                y1={snapshot.layoutOffsetY}
                x2={x}
                y2={snapshot.layoutOffsetY + snapshot.rows * snapshot.cellHeight}
                stroke="#1a3d1a"
                strokeWidth={0.5}
                opacity={0.35}
              />
            );
          })}
          {Array.from({ length: snapshot.rows + 1 }, (_, r) => {
            const y =
              snapshot.layoutOffsetY + r * snapshot.cellHeight;
            return (
              <line
                key={`row-${r}`}
                x1={snapshot.layoutOffsetX}
                y1={y}
                x2={snapshot.layoutOffsetX + snapshot.cols * snapshot.cellWidth}
                y2={y}
                stroke="#1a3d1a"
                strokeWidth={0.5}
                opacity={0.35}
              />
            );
          })}
        </svg>
      ) : null}

      {snapshot && options.showBoundingBoxes ? (
        <div
          className="pointer-events-none absolute z-10 border border-dashed border-[#3d6b3d]/60"
          style={{
            left: snapshot.layoutOffsetX,
            top: snapshot.layoutOffsetY,
            width: snapshot.cols * snapshot.cellWidth,
            height: snapshot.rows * snapshot.cellHeight,
          }}
          aria-hidden
        />
      ) : null}

      {options.showInfluenceRadius && stats.cursorActive ? (
        <div
          className="pointer-events-none absolute z-10 rounded-full border border-[#7dff7d]/40"
          style={{
            left: stats.cursorX - stats.cursorRadius,
            top: stats.cursorY - stats.cursorRadius,
            width: stats.cursorRadius * 2,
            height: stats.cursorRadius * 2,
          }}
          aria-hidden
        />
      ) : null}

      {snapshot && options.showActiveCells ? (
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          aria-hidden
        >
          {snapshot.activeCells.map((cell, i) => (
            <circle
              key={i}
              cx={cell.x}
              cy={cell.y}
              r={1.5}
              fill="#c8ffc8"
              opacity={0.7}
            />
          ))}
        </svg>
      ) : null}

      {snapshot && options.showVectors ? (
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          aria-hidden
        >
          {snapshot.activeCells.map((cell, i) => (
            <line
              key={i}
              x1={cell.x}
              y1={cell.y}
              x2={cell.x + cell.vx * 8}
              y2={cell.y + cell.vy * 8}
              stroke="#00e5ff"
              strokeWidth={0.75}
              opacity={0.6}
            />
          ))}
        </svg>
      ) : null}
    </>
  );
}
