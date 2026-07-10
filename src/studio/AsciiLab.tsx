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
import { buildStatsPanelModel } from "@/features/ascii-engine/stats";
import { runBenchmarkSuite, type BenchmarkResult } from "@/features/ascii-engine/benchmark";
import {
  getTheme,
  themeToLabCssVars,
  type AsciiEngineThemeId,
  ASCII_ENGINE_THEMES,
} from "@/features/ascii-engine/themes";
import {
  presetToPipelinePatch,
  type AsciiEnginePreset,
} from "@/features/ascii-engine/presets";
import { ProjectDocument } from "@/features/ascii-engine/document";
import { AnimationConverterPanel } from "@/studio/animation/AnimationConverterPanel";
import { AnimationResultView } from "@/studio/animation/AnimationResultView";
import { useAnimationController } from "@/studio/animation/useAnimationController";
import { ComparisonView } from "@/studio/ComparisonView";
import { ControlPanel } from "@/studio/ControlPanel";
import { DebugOverlay } from "@/studio/DebugOverlay";
import { ImageConverterPanel } from "@/studio/image/ImageConverterPanel";
import { ImageResultView } from "@/studio/image/ImageResultView";
import { useImagePipeline } from "@/studio/image/useImagePipeline";
import { LabInteractiveCursorToggle } from "@/studio/LabInteractiveCursorToggle";
import { LabMobileHeader } from "@/studio/LabMobileHeader";
import { LabViewport } from "@/studio/LabViewport";
import { PlaygroundPanel } from "@/studio/playground/PlaygroundPanel";
import { applyPreset } from "@/studio/Presets";
import { StatsPanel } from "@/studio/stats/StatsPanel";
import { getScenarioSource } from "@/studio/test-sources";
import { ThemesPresetsPanel } from "@/studio/themes/ThemesPresetsPanel";
import { EditorToolsPanel } from "@/studio/panels/EditorToolsPanel";
import { NodeGraphPanel } from "@/studio/panels/NodeGraphPanel";
import { NodeGraphSidebarHint } from "@/studio/panels/NodeGraphSidebarHint";
import { PluginsPanel } from "@/studio/panels/PluginsPanel";
import { ProjectPanel } from "@/studio/panels/ProjectPanel";
import { DEFAULT_DEBUG_OPTIONS } from "@/studio/types";
import { useWorkspaceViewport } from "@/studio/workspace/useWorkspaceViewport";

type EngineTab = "convert" | "animate" | "playground" | "engine" | "stats" | "studio";

const TABS: { id: EngineTab; label: string }[] = [
  { id: "convert", label: "Convert" },
  { id: "animate", label: "Animate" },
  { id: "playground", label: "Playground" },
  { id: "engine", label: "Engine" },
  { id: "stats", label: "Stats" },
  { id: "studio", label: "Studio" },
];

/** Shell do produto ASCII Engine (rota /labs/ascii). */
export function AsciiLab() {
  const [tab, setTab] = useState<EngineTab>("convert");
  const [themeId, setThemeId] = useState<AsciiEngineThemeId>("root-os");
  const [projectDoc, setProjectDoc] = useState(() =>
    ProjectDocument.create({ name: "Untitled Project", themeId: "root-os" }),
  );
  const [, setEditorTick] = useState(0);
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
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);

  const imageWorkspace = useWorkspaceViewport();
  const gifWorkspace = useWorkspaceViewport();

  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const [imageOptions, setImageOptions] = useState<ImagePipelineOptions>(DEFAULT_IMAGE_PIPELINE_OPTIONS);
  const [imageCharsetId, setImageCharsetId] = useState("classic");
  const [gifCharsetId, setGifCharsetId] = useState("classic");
  const [engineSidebarOpen, setEngineSidebarOpen] = useState(true);

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
    duplicateCurrentFrame,
    insertFrameAtCurrent,
    removeCurrentFrame,
    mergeWithNextFrame,
  } = animation;

  const source = useMemo(
    () => getScenarioSource(scenarioId, stressMultiplier),
    [scenarioId, stressMultiplier],
  );

  const converterConfig = useMemo(
    () =>
      mergeAsciiConfig({
        ...config,
        maxCharacters: Math.max(config.maxCharacters, 65_536),
      }),
    [config],
  );

  const themeStyle = useMemo(
    () => themeToLabCssVars(getTheme(themeId)) as React.CSSProperties,
    [themeId],
  );

  const statsModel = useMemo(
    () =>
      buildStatsPanelModel({
        engine: stats,
        matrix: imageResult?.matrix ?? animation.currentFrame?.matrix ?? null,
        benchmark: imageResult?.benchmark ?? null,
        charset: imageOptions.charset,
        frameCount: animation.animation?.frameCount,
      }),
    [stats, imageResult, animation.currentFrame, animation.animation, imageOptions.charset],
  );

  const focusMode =
    (tab === "convert" && imageWorkspace.state.focusMode) ||
    (tab === "animate" && gifWorkspace.state.focusMode);

  const sidebarOpen =
    tab === "convert"
      ? imageWorkspace.state.sidebarOpen
      : tab === "animate"
        ? gifWorkspace.state.sidebarOpen
        : engineSidebarOpen;

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
    if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
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
    if (charset) setImageOptions((prev) => mergePipelineOptions(prev, { charset }));
  }, []);

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
      if (Object.keys(patch).length > 0) {
        setImageOptions((prev) => mergePipelineOptions(prev, patch));
      }
      if (preset.interaction) setConfig((prev) => mergeAsciiConfig({ ...prev, ...preset.interaction }));
      if (preset.themeId) setThemeId(preset.themeId as AsciiEngineThemeId);
      if (preset.workspace) {
        if (preset.workspace.focusMode) imageWorkspace.toggleFocusMode();
      }
    },
    [imageWorkspace],
  );

  const runBenchmark = useCallback(async () => {
    if (!imageEl || benchmarkRunning) return;
    setBenchmarkRunning(true);
    try {
      const results = await runBenchmarkSuite(imageEl, undefined, {
        width: imageOptions.width,
      });
      setBenchmarkResults(results);
    } finally {
      setBenchmarkRunning(false);
    }
  }, [imageEl, benchmarkRunning, imageOptions.width]);

  const toggleSidebar = useCallback(() => {
    if (tab === "convert") imageWorkspace.toggleSidebar();
    else if (tab === "animate") gifWorkspace.toggleSidebar();
    else setEngineSidebarOpen((v) => !v);
  }, [tab, imageWorkspace, gifWorkspace]);

  const closeSidebar = useCallback(() => {
    if (tab === "convert") imageWorkspace.closeSidebar();
    else if (tab === "animate") gifWorkspace.closeSidebar();
    else setEngineSidebarOpen(false);
  }, [tab, imageWorkspace, gifWorkspace]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
    };
  }, []);

  const showDrawerChrome = tab === "convert" || tab === "animate";

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap border-b border-[var(--ui-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
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

        {tab === "convert" ? (
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

        {tab === "stats" ? (
          <StatsPanel
            model={statsModel}
            benchmarkResults={benchmarkResults}
            onRunBenchmark={imageEl ? () => void runBenchmark() : undefined}
            benchmarkRunning={benchmarkRunning}
          />
        ) : null}

        {tab === "studio" ? (
          <>
            <ProjectPanel
              document={projectDoc}
              onDocumentChange={(doc) => {
                setProjectDoc(doc);
                const tid = doc.getThemeId();
                if (ASCII_ENGINE_THEMES.some((t) => t.id === tid)) {
                  setThemeId(tid as AsciiEngineThemeId);
                }
              }}
            />
            <NodeGraphSidebarHint document={projectDoc} />
            <EditorToolsPanel
              document={projectDoc.editor}
              onChange={() => setEditorTick((n) => n + 1)}
            />
            <PluginsPanel />
            <ThemesPresetsPanel
              themeId={themeId}
              onThemeChange={(id) => {
                setThemeId(id);
                projectDoc.setThemeId(id);
              }}
              pipeline={imageOptions}
              interaction={config}
              workspace={imageWorkspace.state}
              onApplyPreset={applyProductPreset}
            />
          </>
        ) : null}

        {tab === "playground" ? (
          <div className="px-4 py-3 font-mono text-[10px] text-[var(--ui-text-dim)]">
            Selecione um efeito no painel principal. Playground é independente da conversão.
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--bg-void)] text-[var(--phosphor-primary)]"
      style={themeStyle}
    >
      <LabMobileHeader
        title={`ASCII Engine · ${TABS.find((t) => t.id === tab)?.label ?? ""}`}
        sidebarOpen={showDrawerChrome ? sidebarOpen : engineSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {!focusMode ? (
          <div
            className={[
              "z-40 flex w-[min(100%,360px)] shrink-0 flex-col border-r border-[var(--ui-border)] bg-[var(--bg-panel)]",
              showDrawerChrome
                ? [
                    "max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl",
                    sidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
                    "max-md:transition-transform",
                    "md:relative md:translate-x-0",
                  ].join(" ")
                : "relative",
            ].join(" ")}
          >
            {sidebar}
          </div>
        ) : null}

        {showDrawerChrome && sidebarOpen && !focusMode ? (
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

          {tab === "convert" ? (
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

          {tab === "animate" ? (
            animation.animation || animation.isConverting || animation.decoded ? (
              <AnimationResultView
                workspace={gifWorkspace}
                previewUrl={animation.previewUrl}
                currentFrame={animation.currentFrame}
                animation={animation.animation}
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

          {tab === "playground" ? <PlaygroundPanel config={converterConfig} /> : null}

          {tab === "stats" ? (
            <EmptyCanvas message="Use o painel lateral para Stats, Themes e Presets." />
          ) : null}

          {tab === "studio" ? (
            <NodeGraphPanel
              document={projectDoc}
              onDocumentChange={() => setEditorTick((n) => n + 1)}
            />
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
