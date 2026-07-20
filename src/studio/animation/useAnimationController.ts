"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AnimationPipeline,
  AnimationFrameRenderer,
  PlaybackController,
  importAsciiAnimationZip,
  type AsciiAnimation,
  type ConversionProgress,
  DEFAULT_ANIMATION_PIPELINE_OPTIONS,
  type AnimationPipelineOptions,
  type TimelineState,
  type DecodedGif,
  type TemporalMetrics,
  type TemporalDebugBuffers,
} from "@/features/ascii-interaction/animation-pipeline";
import {
  duplicateFrame,
  insertBlankFrame,
  removeFrame,
  mergeFrames,
} from "@/features/ascii-engine/animator";
import { mergePipelineOptions } from "@/features/ascii-interaction/image-pipeline";
import type { ImagePipelineOptions } from "@/features/ascii-interaction/image-pipeline";

export function useAnimationController() {
  const pipelineRef = useRef<AnimationPipeline | null>(null);
  const rendererRef = useRef<AnimationFrameRenderer | null>(null);
  const playbackRef = useRef<PlaybackController | null>(null);
  const optionsRef = useRef<AnimationPipelineOptions>(DEFAULT_ANIMATION_PIPELINE_OPTIONS);
  const previewUrlRef = useRef<string | null>(null);

  const [decoded, setDecoded] = useState<DecodedGif | null>(null);
  const [animation, setAnimation] = useState<AsciiAnimation | null>(null);
  const [options, setOptions] = useState<AnimationPipelineOptions>(DEFAULT_ANIMATION_PIPELINE_OPTIONS);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [timeline, setTimeline] = useState<TimelineState | null>(null);
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [frameRevision, setFrameRevision] = useState(0);
  const [temporalMetrics, setTemporalMetrics] = useState<TemporalMetrics | null>(null);
  const [temporalDebug, setTemporalDebug] = useState<TemporalDebugBuffers | null>(null);
  const [motionPreviews, setMotionPreviews] = useState<{
    cols: number;
    rows: number;
    frames: Uint8Array[];
    buffers: Uint8Array[];
  } | null>(null);

  optionsRef.current = options;

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    pipelineRef.current = new AnimationPipeline();
    rendererRef.current = new AnimationFrameRenderer(pipelineRef.current);
    playbackRef.current = new PlaybackController();
    const unsub = playbackRef.current.subscribe(setTimeline);

    return () => {
      unsub();
      pipelineRef.current?.destroy();
      playbackRef.current?.destroy();
      revokePreview();
    };
  }, [revokePreview]);

  const runConversion = useCallback(async (file: File) => {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;
    setIsConverting(true);
    setProgress(null);
    try {
      const result = await pipeline.convert(file, optionsRef.current, (p) => {
        setProgress(p);
        setFrameRevision((r) => r + 1);
        if (p.completed > 0) {
          setAnimation(pipeline.getAnimation());
        }
      });
      setAnimation(result);
      setTemporalMetrics(pipeline.getTemporalMetrics());
      setTemporalDebug(pipeline.getTemporalDebug());
      setMotionPreviews(pipeline.getMotionPreviews());
      playbackRef.current?.setFrameDelays(result.frameDelays);
      playbackRef.current?.setFps(result.fps);
      playbackRef.current?.setLoop(result.loop);
      playbackRef.current?.seekFrame(0);
      setFrameRevision((r) => r + 1);
    } catch (err) {
      if (err instanceof Error && err.message !== "Conversão cancelada.") {
        console.error(err);
      }
    } finally {
      setIsConverting(false);
    }
  }, []);

  const loadGif = useCallback(async (file: File) => {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;
    revokePreview();
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setGifFile(file);
    const decodedGif = await pipeline.loadGif(file);
    setDecoded(decodedGif);
    setAnimation(null);
    playbackRef.current?.stop();
    playbackRef.current?.setFrameDelays(decodedGif.frames.map((f) => f.delayMs));
  }, [revokePreview]);

  useEffect(() => {
    if (!gifFile || !decoded) return;
    const timer = setTimeout(() => {
      void runConversion(gifFile);
    }, 450);
    return () => {
      clearTimeout(timer);
      pipelineRef.current?.cancel();
    };
  }, [options, gifFile, decoded, runConversion]);

  const importZip = useCallback(async (file: File) => {
    const imported = await importAsciiAnimationZip(file);
    setAnimation(imported);
    setDecoded({
      width: imported.width,
      height: imported.height,
      frameCount: imported.frameCount,
      frames: [],
      loopCount: imported.loop ? 0 : 1,
      totalDurationMs: imported.totalDurationMs,
    });
    revokePreview();
    setGifFile(null);
    setPreviewUrl(null);
    playbackRef.current?.setFrameDelays(imported.frameDelays);
    playbackRef.current?.setFps(imported.fps);
    playbackRef.current?.setLoop(imported.loop);
    playbackRef.current?.seekFrame(0);
    setOptions((prev) => ({
      ...prev,
      pipeline: imported.pipelineOptions,
      targetFps: imported.fps,
      loop: imported.loop,
    }));
    setFrameRevision((r) => r + 1);
  }, [revokePreview]);

  const cancelConversion = useCallback(() => {
    pipelineRef.current?.cancel();
    setIsConverting(false);
    setProgress((p) => (p ? { ...p, cancelled: true } : null));
  }, []);

  const updatePipelineOptions = useCallback((patch: Partial<ImagePipelineOptions>) => {
    setOptions((prev) => ({
      ...prev,
      pipeline: mergePipelineOptions(prev.pipeline, patch),
    }));
  }, []);

  const updateAnimationOptions = useCallback((patch: Partial<AnimationPipelineOptions>) => {
    setOptions((prev) => ({
      ...prev,
      ...patch,
      temporal: patch.temporal
        ? { ...prev.temporal, ...patch.temporal }
        : prev.temporal,
      pipeline: patch.pipeline
        ? { ...prev.pipeline, ...patch.pipeline }
        : prev.pipeline,
    }));
    if (patch.targetFps != null) playbackRef.current?.setFps(patch.targetFps);
    if (patch.loop != null) playbackRef.current?.setLoop(patch.loop);
  }, []);

  const play = useCallback(() => playbackRef.current?.play(), []);
  const pause = useCallback(() => playbackRef.current?.pause(), []);
  const stop = useCallback(() => playbackRef.current?.stop(), []);
  const restart = useCallback(() => playbackRef.current?.restart(), []);
  const seekFrame = useCallback((f: number) => playbackRef.current?.seekFrame(f), []);
  const seekTime = useCallback((ms: number) => playbackRef.current?.seekTime(ms), []);
  const stepFrame = useCallback((d: number) => playbackRef.current?.stepFrame(d), []);

  const applyAnimationEdit = useCallback((next: AsciiAnimation) => {
    setAnimation(next);
    playbackRef.current?.setFrameDelays(next.frameDelays);
    playbackRef.current?.seekFrame(
      Math.min(playbackRef.current?.getState().currentFrame ?? 0, next.frameCount - 1),
    );
    setFrameRevision((r) => r + 1);
  }, []);

  const duplicateCurrentFrame = useCallback(() => {
    if (!animation) return;
    const idx = timeline?.currentFrame ?? 0;
    applyAnimationEdit(duplicateFrame(animation, idx));
  }, [animation, timeline, applyAnimationEdit]);

  const insertFrameAtCurrent = useCallback(() => {
    if (!animation) return;
    const idx = timeline?.currentFrame ?? 0;
    applyAnimationEdit(insertBlankFrame(animation, idx));
  }, [animation, timeline, applyAnimationEdit]);

  const removeCurrentFrame = useCallback(() => {
    if (!animation) return;
    const idx = timeline?.currentFrame ?? 0;
    applyAnimationEdit(removeFrame(animation, idx));
  }, [animation, timeline, applyAnimationEdit]);

  const mergeWithNextFrame = useCallback(() => {
    if (!animation) return;
    const idx = timeline?.currentFrame ?? 0;
    if (idx >= animation.frameCount - 1) return;
    applyAnimationEdit(mergeFrames(animation, idx, idx + 1));
  }, [animation, timeline, applyAnimationEdit]);

  const frameIndex = timeline?.currentFrame ?? 0;
  const currentFrame =
    rendererRef.current?.resolveFrame(frameIndex, options) ??
    animation?.frames[frameIndex] ??
    null;

  return {
    decoded,
    animation,
    options,
    progress,
    isConverting,
    timeline,
    gifFile,
    previewUrl,
    currentFrame,
    frameRevision,
    temporalMetrics,
    temporalDebug,
    motionPreviews,
    loadGif,
    cancelConversion,
    updatePipelineOptions,
    updateAnimationOptions,
    importZip,
    play,
    pause,
    stop,
    restart,
    seekFrame,
    seekTime,
    stepFrame,
    duplicateCurrentFrame,
    insertFrameAtCurrent,
    removeCurrentFrame,
    mergeWithNextFrame,
  };
}
