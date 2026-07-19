"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  IMAGE_CHARSETS,
  autoOptimizeFromBuffer,
  getRefinementPreset,
  mergePipelineOptions,
  resolveOutputSize,
  sampleImage,
  withResolvedGlyphMetrics,
  type ImagePipelineOptions,
} from "@/features/ascii-interaction/image-pipeline";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import {
  getTheme,
  themeToLabCssVars,
  type AsciiEngineThemeId,
} from "@/features/ascii-engine/themes";
import {
  presetToPipelinePatch,
  type AsciiEnginePreset,
} from "@/features/ascii-engine/presets";
import { getRecipe, recipeToPreset } from "@/features/ascii-engine/recipes";
import { previewToAscii } from "@/features/ascii-engine/gallery";
import { AnimationConverterPanel } from "@/studio/animation/AnimationConverterPanel";
import { AnimationResultView } from "@/studio/animation/AnimationResultView";
import { useAnimationController } from "@/studio/animation/useAnimationController";
import { ImageResultView } from "@/studio/image/ImageResultView";
import { RefinementPanel } from "@/studio/image/RefinementPanel";
import { useConversionHistograms } from "@/studio/image/useConversionHistograms";
import { useImagePipeline } from "@/studio/image/useImagePipeline";
import { usePipelineHistory } from "@/studio/image/usePipelineHistory";
import { LabInteractiveCursorToggle } from "@/studio/LabInteractiveCursorToggle";
import { LabMobileHeader } from "@/studio/LabMobileHeader";
import { applyPreset } from "@/studio/Presets";
import { resolveGalleryItem } from "@/studio/gallery/actions";
import { GalleryEmbedded } from "@/studio/gallery/GalleryEmbedded";
import { ProductNav, type ProductTab } from "@/studio/ProductNav";
import { IconsPanel } from "@/studio/icons/IconsPanel";
import { DocsPanel } from "@/studio/docs/DocsPanel";
import { useWorkspaceViewport } from "@/studio/workspace/useWorkspaceViewport";

const PRODUCT_TABS: { id: ProductTab; label: string }[] = [
  { id: "convert", label: "Convert" },
  { id: "animate", label: "Animate" },
  { id: "icons", label: "Icons" },
  { id: "gallery", label: "Gallery" },
  { id: "docs", label: "Docs" },
];

function parseTabParam(raw: string | null): ProductTab | null {
  if (!raw) return null;
  if (PRODUCT_TABS.some((t) => t.id === raw)) return raw as ProductTab;
  return null;
}

/** ASCII Engine shell — professional converter (Convert · Animate · Icons · Gallery · Docs). */
export function AsciiLab() {
  const [tab, setTab] = useState<ProductTab>("convert");
  const [themeId] = useState<AsciiEngineThemeId>("root-os");
  const [config, setConfig] = useState<AsciiInteractionConfig>(() => applyPreset("default"));
  const [galleryBanner, setGalleryBanner] = useState<string | null>(null);

  const imageWorkspace = useWorkspaceViewport();
  const gifWorkspace = useWorkspaceViewport();

  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const {
    options: imageOptions,
    patch: patchImageOptions,
    replace: replaceImageOptions,
    undo: undoImageOptions,
    redo: redoImageOptions,
    canUndo: canUndoImage,
    canRedo: canRedoImage,
  } = usePipelineHistory(DEFAULT_IMAGE_PIPELINE_OPTIONS);
  const [imageCharsetId, setImageCharsetId] = useState("classic");
  const [gifCharsetId, setGifCharsetId] = useState("classic");
  const [comparePresetId, setComparePresetId] = useState<string | null>(null);

  const { result: imageResult, isProcessing: imageProcessing } = useImagePipeline(
    imageEl,
    imageOptions,
  );
  const histograms = useConversionHistograms(imageEl, imageOptions);

  const compareOptions = useMemo(() => {
    if (!comparePresetId) return null;
    const preset = getRefinementPreset(comparePresetId);
    if (!preset) return null;
    return mergePipelineOptions(imageOptions, preset.options);
  }, [comparePresetId, imageOptions]);

  const { result: compareResult } = useImagePipeline(
    compareOptions ? imageEl : null,
    compareOptions ?? imageOptions,
  );

  const animation = useAnimationController();
  const {
    updatePipelineOptions,
    updateAnimationOptions,
    loadGif,
    cancelConversion,
    importZip,
    play,
    pause,
    stop,
    restart,
    seekFrame,
    stepFrame,
    duplicateCurrentFrame,
    insertFrameAtCurrent,
    removeCurrentFrame,
    mergeWithNextFrame,
  } = animation;

  const themeStyle = useMemo(
    () => themeToLabCssVars(getTheme(themeId)) as React.CSSProperties,
    [themeId],
  );

  const focusMode =
    (tab === "convert" && imageWorkspace.state.focusMode) ||
    (tab === "animate" && gifWorkspace.state.focusMode);

  const showConverterChrome = tab === "convert" || tab === "animate";

  const sidebarOpen =
    tab === "convert"
      ? imageWorkspace.state.sidebarOpen
      : tab === "animate"
        ? gifWorkspace.state.sidebarOpen
        : true;

  const handleConfigChange = useCallback((patch: Partial<AsciiInteractionConfig>) => {
    setConfig((prev) => mergeAsciiConfig({ ...prev, ...patch }));
  }, []);

  const handleImageLoaded = useCallback((img: HTMLImageElement, previewUrl: string) => {
    if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
    imagePreviewUrlRef.current = previewUrl;
    setImagePreviewUrl(previewUrl);
    setImageEl(img);
  }, []);

  const handleImageOptionsChange = useCallback(
    (patch: Partial<ImagePipelineOptions>) => {
      patchImageOptions(patch);
    },
    [patchImageOptions],
  );

  const handleImageCharsetChange = useCallback(
    (id: string) => {
      setImageCharsetId(id);
      const charset = IMAGE_CHARSETS[id];
      if (charset) patchImageOptions({ charset });
    },
    [patchImageOptions],
  );

  const handleAutoOptimize = useCallback(() => {
    if (!imageEl) return;
    try {
      const resolved = withResolvedGlyphMetrics(imageOptions);
      const { width, height } = resolveOutputSize(
        imageEl.naturalWidth || imageEl.width,
        imageEl.naturalHeight || imageEl.height,
        resolved,
      );
      const sampled = sampleImage(imageEl, width, height);
      const optimized = autoOptimizeFromBuffer(sampled, resolved);
      replaceImageOptions(optimized);
    } catch (err) {
      console.error("autoOptimize:", err);
    }
  }, [imageEl, imageOptions, replaceImageOptions]);

  const handleGifCharsetChange = useCallback(
    (id: string) => {
      setGifCharsetId(id);
      const charset = IMAGE_CHARSETS[id];
      if (charset) updatePipelineOptions({ charset });
    },
    [updatePipelineOptions],
  );

  const applyProductPreset = useCallback(
    (preset: AsciiEnginePreset) => {
      const patch = presetToPipelinePatch(preset);
      if (Object.keys(patch).length > 0) patchImageOptions(patch);
      if (preset.interaction) {
        setConfig((prev) => mergeAsciiConfig({ ...prev, ...preset.interaction }));
      }
      if (preset.workspace?.focusMode) imageWorkspace.toggleFocusMode();
    },
    [imageWorkspace, patchImageOptions],
  );

  const setTabAndUrl = useCallback((next: ProductTab) => {
    setTab(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.pathname + url.search);
  }, []);

  // Sync ?tab= on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseTabParam(params.get("tab"));
    if (fromUrl) setTab(fromUrl);
  }, []);

  // Gallery deep-link → Convert (never Engine)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const galleryId = params.get("gallery");
    const action = params.get("action");
    if (!galleryId) return;

    let cancelled = false;
    void (async () => {
      const item = await resolveGalleryItem(galleryId);
      if (cancelled || !item) return;

      setTabAndUrl("convert");
      // Preview string kept for banner context; Convert loads via image pipeline from remix.
      void previewToAscii(item.preview);

      if ((action === "remix" || action === "edit") && item.recipeId) {
        const recipe = getRecipe(item.recipeId);
        if (recipe) {
          applyProductPreset(recipeToPreset(recipe));
          setGalleryBanner(`Remix · ${item.title}`);
        } else {
          setGalleryBanner(`Gallery · ${item.title}`);
        }
      } else {
        setGalleryBanner(`Gallery · ${item.title} · open Convert to continue`);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("gallery");
      url.searchParams.delete("action");
      url.searchParams.set("tab", "convert");
      window.history.replaceState({}, "", url.pathname + url.search);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep-link once
  }, []);

  const toggleSidebar = useCallback(() => {
    if (tab === "convert") imageWorkspace.toggleSidebar();
    else if (tab === "animate") gifWorkspace.toggleSidebar();
  }, [tab, imageWorkspace, gifWorkspace]);

  const closeSidebar = useCallback(() => {
    if (tab === "convert") imageWorkspace.closeSidebar();
    else if (tab === "animate") gifWorkspace.closeSidebar();
  }, [tab, imageWorkspace, gifWorkspace]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
    };
  }, []);

  const sidebar = showConverterChrome ? (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap border-b border-[var(--ui-border)]">
        {PRODUCT_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTabAndUrl(t.id)}
            className={`min-w-[4.5rem] flex-1 cursor-pointer px-1.5 py-2.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
              tab === t.id
                ? "border-b-2 border-[var(--phosphor-primary)] text-[var(--phosphor-primary)]"
                : "text-[var(--ui-text-dim)] hover:text-[var(--phosphor-dim)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "convert" ? (
          <div className="px-4 py-3">
            <LabInteractiveCursorToggle
              checked={config.enableInteraction !== false}
              onChange={(value) => handleConfigChange({ enableInteraction: value })}
            />
            <RefinementPanel
              options={imageOptions}
              charsetId={imageCharsetId}
              benchmark={imageResult?.benchmark ?? null}
              matrix={imageResult?.matrix ?? null}
              sourceWidth={imageResult?.sourceWidth ?? 0}
              sourceHeight={imageResult?.sourceHeight ?? 0}
              histogramBefore={histograms.before}
              histogramAfter={histograms.after}
              isProcessing={imageProcessing}
              comparePresetId={comparePresetId}
              onOptionsChange={handleImageOptionsChange}
              onReplaceOptions={replaceImageOptions}
              onCharsetIdChange={handleImageCharsetChange}
              onImageLoaded={handleImageLoaded}
              onAutoOptimize={handleAutoOptimize}
              onUndo={undoImageOptions}
              onRedo={redoImageOptions}
              canUndo={canUndoImage}
              canRedo={canRedoImage}
              onComparePreset={setComparePresetId}
            />
          </div>
        ) : null}

        {tab === "animate" ? (
          <div className="px-4 py-3">
            <LabInteractiveCursorToggle
              checked={config.enableInteraction !== false}
              onChange={(value) => handleConfigChange({ enableInteraction: value })}
            />
            <AnimationConverterPanel
              decoded={animation.decoded}
              animation={animation.animation}
              options={animation.options}
              progress={animation.progress}
              isConverting={animation.isConverting}
              charsetId={gifCharsetId}
              temporalMetrics={animation.temporalMetrics}
              onLoadGif={(file) => void loadGif(file)}
              onCancel={cancelConversion}
              onPipelineChange={updatePipelineOptions}
              onAnimationOptionsChange={updateAnimationOptions}
              onCharsetChange={handleGifCharsetChange}
              onImportZip={(file) => void importZip(file)}
              onDuplicateFrame={duplicateCurrentFrame}
              onInsertFrame={insertFrameAtCurrent}
              onRemoveFrame={removeCurrentFrame}
              onMergeFrame={mergeWithNextFrame}
            />
          </div>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--bg-void)] text-[var(--phosphor-primary)]"
      style={themeStyle}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--ui-border)] bg-[var(--bg-panel)] px-3 py-1.5 max-md:hidden">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--amber-led)]">
          ASCII Engine · {PRODUCT_TABS.find((t) => t.id === tab)?.label ?? ""}
        </p>
        <ProductNav active={tab} onChange={setTabAndUrl} mode="buttons" />
      </div>

      <LabMobileHeader
        title={`ASCII Engine · ${PRODUCT_TABS.find((t) => t.id === tab)?.label ?? ""}`}
        sidebarOpen={showConverterChrome ? sidebarOpen : false}
        onToggleSidebar={showConverterChrome ? toggleSidebar : () => undefined}
        trailing={<ProductNav active={tab} onChange={setTabAndUrl} mode="buttons" />}
      />

      {galleryBanner ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--ui-border)] bg-[var(--bg-terminal)] px-3 py-1.5 font-mono text-[9px] text-[var(--phosphor-primary)]">
          <span>{galleryBanner}</span>
          <button
            type="button"
            className="cursor-pointer text-[var(--ui-text-dim)] hover:text-[var(--phosphor-dim)]"
            onClick={() => setGalleryBanner(null)}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {showConverterChrome && !focusMode ? (
          <div
            className={[
              "z-40 flex w-[min(100%,360px)] shrink-0 flex-col border-r border-[var(--ui-border)] bg-[var(--bg-panel)]",
              "max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl",
              sidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
              "max-md:transition-transform",
              "md:relative md:translate-x-0",
            ].join(" ")}
          >
            {sidebar}
          </div>
        ) : null}

        {showConverterChrome && sidebarOpen && !focusMode ? (
          <button
            type="button"
            aria-label="Fechar painel"
            className="absolute inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeSidebar}
          />
        ) : null}

        <main id="main-content" className="relative min-h-0 min-w-0 flex-1">
          {!showConverterChrome ? (
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-center border-b border-[var(--ui-border)] bg-[var(--bg-panel)]/95 px-2 py-1.5 md:hidden">
              <ProductNav active={tab} onChange={setTabAndUrl} mode="buttons" />
            </div>
          ) : null}

          {tab === "convert" ? (
            imageResult ? (
              compareResult && comparePresetId ? (
                <div className="grid h-full grid-cols-2 gap-px bg-[var(--ui-border)]">
                  <div className="relative min-h-0">
                    <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--phosphor-dim)]">
                      Current
                    </span>
                    <ImageResultView
                      workspace={imageWorkspace}
                      previewUrl={imagePreviewUrl}
                      matrix={imageResult.matrix}
                    />
                  </div>
                  <div className="relative min-h-0 bg-[var(--bg-void)]">
                    <span className="pointer-events-none absolute left-2 top-2 z-10 rounded border border-[var(--ui-border)] bg-[var(--bg-panel)]/90 px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--phosphor-dim)]">
                      {comparePresetId}
                    </span>
                    <div className="flex h-full items-center justify-center overflow-auto p-2">
                      <ImageResultView
                        workspace={imageWorkspace}
                        previewUrl={null}
                        matrix={compareResult.matrix}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <ImageResultView
                  workspace={imageWorkspace}
                  previewUrl={imagePreviewUrl}
                  matrix={imageResult.matrix}
                />
              )
            ) : (
              <EmptyCanvas
                message={
                  imageEl
                    ? "A converter…"
                    : "Carregue uma imagem (PNG, JPG, WEBP, SVG) — Upload → Adjust → Export"
                }
              />
            )
          ) : null}

          {tab === "animate" ? (
            animation.animation || animation.isConverting || animation.decoded ? (
              <AnimationResultView
                workspace={gifWorkspace}
                previewUrl={animation.previewUrl}
                currentFrame={animation.currentFrame}
                animation={animation.animation}
                timeline={animation.timeline}
                frameCount={
                  animation.animation?.frameCount ?? animation.decoded?.frameCount ?? 0
                }
                loop={animation.options.loop}
                motionPreviews={animation.motionPreviews}
                onPlay={play}
                onPause={pause}
                onStop={stop}
                onRestart={restart}
                onSeekFrame={seekFrame}
                onStepFrame={stepFrame}
                onLoopToggle={(loop) => updateAnimationOptions({ loop })}
                onFpsChange={(fps) => updateAnimationOptions({ targetFps: fps })}
              />
            ) : (
              <EmptyCanvas message="Carregue um GIF ou importe um .ascii.zip" />
            )
          ) : null}

          {tab === "icons" ? <IconsPanel /> : null}
          {tab === "gallery" ? <GalleryEmbedded /> : null}
          {tab === "docs" ? <DocsPanel /> : null}
        </main>
      </div>
    </div>
  );
}

function EmptyCanvas({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--bg-void)] px-6">
      <p className="max-w-sm text-center font-mono text-[11px] text-[var(--ui-text-dim)]">
        {message}
      </p>
    </div>
  );
}
