"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  computeFitScale,
  zoomToScale,
  type WorkspacePan,
  type ZoomPreset,
} from "@/studio/workspace/types";

interface WorkspaceCanvasProps {
  zoom: ZoomPreset;
  pan: WorkspacePan;
  onPanChange: (pan: WorkspacePan) => void;
  children: React.ReactNode;
  className?: string;
  enablePan?: boolean;
}

/**
 * Viewport never-crop: mede o tamanho intrínseco do content (não h-full),
 * aplica fit/zoom via CSS transform, pan quando scaled > viewport.
 */
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
  const [fitWidthScale, setFitWidthScale] = useState(1);
  const [fitHeightScale, setFitHeightScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const scale = zoomToScale(zoom, fitScale, fitWidthScale, fitHeightScale);
  const canPan = enablePan && scale > 0;

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      // Intrinsic size: offsetWidth/Height of content (not stretched to parent)
      const sw = content.offsetWidth || content.scrollWidth;
      const sh = content.offsetHeight || content.scrollHeight;
      if (sw <= 0 || sh <= 0) return;
      setFitScale(computeFitScale(cw, ch, sw, sh, "fit"));
      setFitWidthScale(computeFitScale(cw, ch, sw, sh, "fit-width"));
      setFitHeightScale(computeFitScale(cw, ch, sw, sh, "fit-height"));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(content);
    // Re-measure when children layout changes (matrix size)
    const mo = new MutationObserver(measure);
    mo.observe(content, { childList: true, subtree: true, attributes: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
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
      // Only pan when content overflows (or always allow for exploration)
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
      data-fit-scale={fitScale.toFixed(4)}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 120ms ease-out",
        }}
      >
        {/* shrink-0 + w/h from child — NEVER h-full/w-full (that broke fit) */}
        <div ref={contentRef} className="shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
