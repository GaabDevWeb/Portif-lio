"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import {
  DEFAULT_IMAGE_PIPELINE_OPTIONS,
  IMAGE_CHARSETS,
  mergePipelineOptions,
  type ImagePipelineOptions,
} from "@/features/ascii-interaction/image-pipeline";
import type {
  AsciiDebugSnapshot,
  AsciiEngineStats,
  AsciiInteractionConfig,
} from "@/features/ascii-interaction/types";
import { AnimationConverterPanel } from "@/labs/ascii/animation/AnimationConverterPanel";
import { AnimationResultView } from "@/labs/ascii/animation/AnimationResultView";
import { useAnimationController } from "@/labs/ascii/animation/useAnimationController";
import { ComparisonView } from "@/labs/ascii/ComparisonView";
import { ControlPanel } from "@/labs/ascii/ControlPanel";
import { DebugOverlay } from "@/labs/ascii/DebugOverlay";
import { ImageConverterPanel } from "@/labs/ascii/image/ImageConverterPanel";
import { ImageResultView } from "@/labs/ascii/image/ImageResultView";
import { useImagePipeline } from "@/labs/ascii/image/useImagePipeline";
import { LabInteractiveCursorToggle } from "@/labs/ascii/LabInteractiveCursorToggle";
import { LabMobileHeader } from "@/labs/ascii/LabMobileHeader";
import { LabViewport } from "@/labs/ascii/LabViewport";
import { applyPreset } from "@/labs/ascii/Presets";
import { getScenarioSource } from "@/labs/ascii/test-sources";
import { DEFAULT_DEBUG_OPTIONS } from "@/labs/ascii/types";
import { useWorkspaceViewport } from "@/labs/ascii/workspace/useWorkspaceViewport";

type LabTab = "engine" | "image" | "gif";

const TABS: { id: LabTab; label: string }[] = [
  { id: "engine", label: "Engine" },
  { id: "image", label: "Image" },
  { id: "gif", label: "GIF" },
];

export function AsciiLab() {
  const [tab, setTab] = useState<LabTab>("engine");
  const [activePreset, setActivePreset] = useState("default");
  const [config, setConfig] = useState<AsciiInteractionConfig>(() => applyPreset("default"));
  const [scenarioId, setScenarioId] = useState("logo");
  const [stressMultiplier, setStressMultiplier] = useState(1);
  const [splitView, setSplitView] = useState(false);
  const [splitPresetA, setSplitPresetA] = useState("default");
  const [splitPresetB, setSplitPresetB] = useState("magnetic");
  const [debug, setDebug] = useState(DEFAULT_DEBUG_OPTIONS);
  const [stats, setStats] = useState<AsciiEngineStats | null>(null);
  const [snapshot, setSnapshot] = useState<AsciiDebugSnapshot | null>(null);

  const imageWorkspace = useWorkspaceViewport();
  const gifWorkspace = useWorkspaceViewport();

  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const [imageOptions, setImageOptions] = useState<ImagePipelineOptions>(DEFAULT_IMAGE_PIPELINE_OPTIONS);
  const [imageCharsetId, setImageCharsetId] = useState("classic");
  const [gifCharsetId, setGifCharsetId] = useState("classic");
  const [engineSidebarOpen, setEngineSidebarOpen] = useState(false);

  const { result: imageResult } = useImagePipeline(imageEl, imageOptions);
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
  } = animation;

  const source = useMemo(
    () => getScenarioSource(scenarioId, stressMultiplier),
    [scenarioId, stressMultiplier],
  );

  /** Conversões densas (até ~240×240) precisam de teto maior que o da Hero. */
  const converterConfig = useMemo(
    () =>
      mergeAsciiConfig({
        ...config,
        maxCharacters: Math.max(config.maxCharacters, 65_536),
      }),
    [config],
  );

  const focusMode =
    (tab === "image" && imageWorkspace.state.focusMode) ||
    (tab === "gif" && gifWorkspace.state.focusMode);

  const sidebarOpen =
    tab === "engine"
      ? engineSidebarOpen
      : tab === "image"
        ? imageWorkspace.state.sidebarOpen
        : gifWorkspace.state.sidebarOpen;

  const handlePresetChange = useCallback((presetId: string) => {
    setActivePreset(presetId);
    setConfig((prev) =>
      mergeAsciiConfig({
        ...applyPreset(presetId),
        enableInteraction: prev.enableInteraction,
      }),
    );
  }, []);

  const handleConfigChange = useCallback((patch: Partial<AsciiInteractionConfig>) => {
    setConfig((prev) => mergeAsciiConfig({ ...prev, ...patch }));
  }, []);

  const handleImport = useCallback((imported: AsciiInteractionConfig) => {
    setConfig(imported);
    setActivePreset("custom");
  }, []);

  const handleImageLoaded = useCallback((img: HTMLImageElement, previewUrl: string) => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
    }
    imagePreviewUrlRef.current = previewUrl;
    setImagePreviewUrl(previewUrl);
    setImageEl(img);
  }, []);

  const handleImageOptionsChange = useCallback((patch: Partial<ImagePipelineOptions>) => {
    setImageOptions((prev) => mergePipelineOptions(prev, patch));
  }, []);

  const handleImageCharsetChange = useCallback((id: string) => {
    setImageCharsetId(id);
    const charset = IMAGE_CHARSETS[id];
    if (charset) {
      setImageOptions((prev) => mergePipelineOptions(prev, { charset }));
    }
  }, []);

  const handleGifCharsetChange = useCallback(
    (id: string) => {
      setGifCharsetId(id);
      const charset = IMAGE_CHARSETS[id];
      if (charset) {
        updatePipelineOptions({ charset });
      }
    },
    [updatePipelineOptions],
  );

  const toggleSidebar = useCallback(() => {
    if (tab === "engine") setEngineSidebarOpen((v) => !v);
    else if (tab === "image") imageWorkspace.toggleSidebar();
    else if (tab === "gif") gifWorkspace.toggleSidebar();
  }, [tab, imageWorkspace, gifWorkspace]);

  const closeSidebar = useCallback(() => {
    if (tab === "engine") setEngineSidebarOpen(false);
    else if (tab === "image") imageWorkspace.closeSidebar();
    else if (tab === "gif") gifWorkspace.closeSidebar();
  }, [tab, imageWorkspace, gifWorkspace]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 border-b border-[var(--ui-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 cursor-pointer px-2 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
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
        {tab === "engine" ? (
          <ControlPanel
            showHeader={false}
            config={config}
            activePreset={activePreset}
            scenarioId={scenarioId}
            stressMultiplier={stressMultiplier}
            splitView={splitView}
            splitPresetA={splitPresetA}
            splitPresetB={splitPresetB}
            debug={debug}
            onConfigChange={handleConfigChange}
            onPresetChange={handlePresetChange}
            onScenarioChange={setScenarioId}
            onStressChange={setStressMultiplier}
            onSplitViewToggle={setSplitView}
            onSplitPresetAChange={setSplitPresetA}
            onSplitPresetBChange={setSplitPresetB}
            onDebugChange={(patch) => setDebug((d) => ({ ...d, ...patch }))}
            onImport={handleImport}
          />
        ) : null}

        {tab === "image" ? (
          <div className="px-4 py-3">
            <LabInteractiveCursorToggle
              checked={config.enableInteraction !== false}
              onChange={(value) => handleConfigChange({ enableInteraction: value })}
            />
            <ImageConverterPanel
              options={imageOptions}
              charsetId={imageCharsetId}
              benchmark={imageResult?.benchmark ?? null}
              matrix={imageResult?.matrix ?? null}
              sourceWidth={imageResult?.sourceWidth ?? 0}
              sourceHeight={imageResult?.sourceHeight ?? 0}
              onOptionsChange={handleImageOptionsChange}
              onCharsetIdChange={handleImageCharsetChange}
              onImageLoaded={handleImageLoaded}
            />
          </div>
        ) : null}

        {tab === "gif" ? (
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
              onLoadGif={(file) => void loadGif(file)}
              onCancel={cancelConversion}
              onPipelineChange={updatePipelineOptions}
              onAnimationOptionsChange={updateAnimationOptions}
              onCharsetChange={handleGifCharsetChange}
              onImportZip={(file) => void importZip(file)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--bg-void)] text-[var(--phosphor-primary)]">
      <LabMobileHeader
        title={
          tab === "engine" ? "ASCII Lab · Engine" : tab === "image" ? "ASCII Lab · Image" : "ASCII Lab · GIF"
        }
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {!focusMode ? (
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

        {sidebarOpen && !focusMode ? (
          <button
            type="button"
            aria-label="Fechar painel"
            className="absolute inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeSidebar}
          />
        ) : null}

        <main className="relative min-h-0 min-w-0 flex-1">
          {tab === "engine" ? (
            splitView ? (
              <ComparisonView
                source={source}
                presetA={splitPresetA}
                presetB={splitPresetB}
                debug={debug}
              />
            ) : (
              <div className="relative h-full">
                <LabViewport
                  source={source}
                  config={config}
                  debugEnabled={debug.enabled}
                  onStats={setStats}
                  onDebugSnapshot={setSnapshot}
                />
                <DebugOverlay stats={stats} snapshot={snapshot} options={debug} />
              </div>
            )
          ) : null}

          {tab === "image" ? (
            imageResult ? (
              <ImageResultView
                workspace={imageWorkspace}
                previewUrl={imagePreviewUrl}
                source={imageResult.matrix}
                config={converterConfig}
                debugEnabled={debug.enabled}
                onStats={setStats}
              />
            ) : (
              <EmptyCanvas
                message={
                  imageEl
                    ? "A converter…"
                    : "Carregue uma imagem (PNG, JPG, WEBP) para gerar arte ASCII"
                }
              />
            )
          ) : null}

          {tab === "gif" ? (
            animation.animation || animation.isConverting || animation.decoded ? (
              <AnimationResultView
                workspace={gifWorkspace}
                previewUrl={animation.previewUrl}
                currentFrame={animation.currentFrame}
                config={converterConfig}
                debugEnabled={debug.enabled}
                timeline={animation.timeline}
                frameCount={animation.animation?.frameCount ?? animation.decoded?.frameCount ?? 0}
                loop={animation.options.loop}
                onStats={setStats}
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
        </main>
      </div>
    </div>
  );
}

function EmptyCanvas({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--bg-void)] px-6">
      <p className="max-w-sm text-center font-mono text-[11px] text-[var(--ui-text-dim)]">{message}</p>
    </div>
  );
}
