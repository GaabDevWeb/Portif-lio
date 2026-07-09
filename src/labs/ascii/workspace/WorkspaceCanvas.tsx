"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { zoomToScale, type WorkspacePan, type ZoomPreset } from "@/labs/ascii/workspace/types";

interface WorkspaceCanvasProps {
  zoom: ZoomPreset;
  pan: WorkspacePan;
  onPanChange: (pan: WorkspacePan) => void;
  children: React.ReactNode;
  className?: string;
  enablePan?: boolean;
}

export function WorkspaceCanvas({
  zoom,
  pan,
  onPanChange,
  children,
  className,
  enablePan = true,
}: WorkspaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const scale = zoomToScale(zoom, fitScale);
  const canPan = enablePan && (zoom !== "fit" || scale > fitScale + 0.01);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const sw = content.scrollWidth || content.clientWidth;
      const sh = content.scrollHeight || content.clientHeight;
      if (sw <= 0 || sh <= 0) return;
      const fit = Math.min(cw / sw, ch / sh, 1);
      setFitScale(fit > 0 ? fit : 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, [children]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canPan || e.button !== 0) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      setIsDragging(true);
    },
    [canPan, pan.x, pan.y],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      onPanChange({
        x: dragRef.current.panX + dx,
        y: dragRef.current.panY + dy,
      });
    },
    [onPanChange],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-0 flex-1 overflow-hidden bg-[var(--bg-void)] ${className ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: canPan ? (isDragging ? "grabbing" : "grab") : "default" }}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 120ms ease-out",
        }}
      >
        <div ref={contentRef} className="h-full w-full min-h-0 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
