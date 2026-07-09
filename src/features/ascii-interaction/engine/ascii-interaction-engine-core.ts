import type {
  AsciiDebugSnapshot,
  AsciiEngineStats,
  AsciiInteractionConfig,
  AsciiInteractionDebugMetrics,
  EmitFieldInput,
  Influencer,
  InfluencerSurface,
} from "@/features/ascii-interaction/types";
import { SurfaceState } from "@/features/ascii-interaction/types";
import { mergeAsciiConfig } from "@/features/ascii-interaction/config";
import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import { CharacterGrid } from "@/features/ascii-interaction/grid/character-grid";
import { InfluenceLayer } from "@/features/ascii-interaction/influence/influence-layer";
import { TrailField } from "@/features/ascii-interaction/influence/trail-field";
import { MouseInfluencer } from "@/features/ascii-interaction/influence/influencers/mouse-influencer";
import { PhysicsSystem } from "@/features/ascii-interaction/physics/physics-system";
import { isSurfaceStable, isCellUnsettled } from "@/features/ascii-interaction/physics/energy-system";
import { TimestepAccumulator } from "@/features/ascii-interaction/physics/timestep";
import { CharacterEvolution } from "@/features/ascii-interaction/evolution/character-evolution";
import { SurfaceStateController } from "@/features/ascii-interaction/surface/surface-state";
import { CanvasRenderer } from "@/features/ascii-interaction/render/canvas-renderer";
import { FrameLoop } from "@/features/ascii-interaction/loop/frame-loop";
import { resolveResponsiveConfig } from "@/features/ascii-interaction/utils/responsive-config";

/**
 * Núcleo da AsciiInteractionEngine — orquestra pipeline completo.
 * Desacoplado de React; expõe API imperativa `emitField`.
 */
export class AsciiInteractionEngineCore implements InfluencerSurface {
  private readonly baseConfig: AsciiInteractionConfig;
  private config: AsciiInteractionConfig;
  private readonly grid: CharacterGrid;
  private readonly influence: InfluenceLayer;
  private readonly trail = new TrailField();
  private readonly physics: PhysicsSystem;
  private readonly evolution: CharacterEvolution;
  private readonly surface = new SurfaceStateController();
  private readonly renderer = new CanvasRenderer();
  private readonly loop = new FrameLoop();
  private readonly timestep = new TimestepAccumulator();
  private readonly influencers: Influencer[] = [];
  private readonly mouseInfluencer = new MouseInfluencer();

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private reducedMotion = false;
  private width = 0;
  private height = 0;
  private destroyed = false;

<<<<<<< Updated upstream
  private lastFrameNow = 0;
  private frameTimeMs = 0;
  private renderTimeMs = 0;
  private fpsSmoothed = 60;
=======
  private lastFrameMs = 0;
  private lastRenderMs = 0;
  private fpsSmoothed = 0;
  private frameTimeSmoothed = 0;
>>>>>>> Stashed changes

  private readonly forceSamples: { fx: number; fy: number; intensity: number }[] = [];

  constructor(source: string | AsciiMatrix, configPartial?: Partial<AsciiInteractionConfig>) {
    this.baseConfig = mergeAsciiConfig(configPartial);
    this.config = { ...this.baseConfig };
    this.grid = new CharacterGrid(source, this.config);
    this.influence = new InfluenceLayer(this.config);
    this.physics = new PhysicsSystem();
    this.evolution = new CharacterEvolution(this.grid.count);
    this.evolution.init(this.grid);

    for (let i = 0; i < this.grid.count; i += 1) {
      this.forceSamples.push({ fx: 0, fy: 0, intensity: 0 });
    }

    this.registerInfluencer(this.mouseInfluencer);
  }

  mount(canvas: HTMLCanvasElement, reducedMotion: boolean): void {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!this.ctx) {
      throw new Error("AsciiInteractionEngine: 2D context unavailable");
    }

    this.renderer.attach(this.ctx, this.config);
    this.applyResponsiveConfig();
    this.resize();
    this.renderer.requestFullRedraw();

    for (const inf of this.influencers) {
      inf.mount(this);
    }

    this.timestep.reset(performance.now());
    this.loop.setMaxFPS(this.config.maxFPS);
    this.loop.start((now) => this.onFrame(now));
  }

  setReducedMotion(reduced: boolean): void {
    if (this.reducedMotion === reduced) return;
    this.reducedMotion = reduced;
    this.applyResponsiveConfig();
    if (reduced) {
      this.surface.setState(SurfaceState.Idle);
      this.trail.reset();
    }
    this.renderer.requestFullRedraw();
  }

  updateConfig(partial: Partial<AsciiInteractionConfig>): void {
    const visualKeys: (keyof AsciiInteractionConfig)[] = [
      "characterSet",
      "fontFamily",
      "fontSize",
      "cellWidth",
      "cellHeight",
      "colorPrimary",
      "colorDim",
      "colorAccent",
      "opacity",
    ];
    const needsRenderer = Object.keys(partial).some((key) =>
      visualKeys.includes(key as keyof AsciiInteractionConfig),
    );

    if (partial.parallax) {
      this.baseConfig.parallax = [...partial.parallax];
    }

    const wasInteractive = this.baseConfig.enableInteraction;
    Object.assign(this.baseConfig, partial);
    if (partial.parallax) {
      this.baseConfig.parallax = [...partial.parallax];
    }
    this.applyResponsiveConfig();
<<<<<<< Updated upstream
    this.renderer.applyConfig(this.config);
    this.renderer.requestFullRedraw();
=======
    this.loop.setMaxFPS(this.config.maxFPS);

    if (partial.enableInteraction === false || (wasInteractive && !this.config.enableInteraction)) {
      this.trail.reset();
      this.influence.clear();
      this.grid.settleMotion();
      this.surface.setState(SurfaceState.Idle);
      this.renderer.requestFullRedraw();
    }

    if (needsRenderer && this.ctx) {
      this.renderer.attach(this.ctx, this.config);
      this.renderer.setColors(
        this.config.colorPrimary,
        this.config.colorDim,
        this.config.colorAccent,
      );
      this.renderer.requestFullRedraw();
    }
  }

  getDebugMetrics(): AsciiInteractionDebugMetrics {
    const cursor = this.mouseInfluencer.getCursor();
    const radius = this.config.radius;
    const memory =
      typeof performance !== "undefined" &&
      "memory" in performance &&
      performance.memory
        ? (performance.memory as { usedJSHeapSize: number }).usedJSHeapSize / (1024 * 1024)
        : null;

    return {
      fps: this.fpsSmoothed,
      frameTimeMs: this.frameTimeSmoothed,
      renderTimeMs: this.lastRenderMs,
      characterCount: this.grid.count,
      activeCells: this.grid.activeCount,
      activeFields: this.influence.activeFields.length,
      cursorX: cursor.x,
      cursorY: cursor.y,
      cursorRadius: radius,
      influenceArea: Math.PI * radius * radius,
      memoryMb: memory,
    };
>>>>>>> Stashed changes
  }

  private applyResponsiveConfig(): void {
    this.config = resolveResponsiveConfig(
      this.baseConfig,
      this.width || (typeof window !== "undefined" ? window.innerWidth : 1280),
      this.reducedMotion,
    );
    this.loop.setMaxFPS(this.config.maxFPS);
  }

  resize(): void {
    if (!this.canvas || !this.ctx) return;

    const parent = this.canvas.parentElement;
    const rect = parent?.getBoundingClientRect() ?? this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.renderer.resize(this.width, this.height, dpr);
    this.grid.centerIn(this.width, this.height);
    this.renderer.requestFullRedraw();
  }

  registerInfluencer(influencer: Influencer): void {
    if (this.influencers.some((i) => i.id === influencer.id)) return;
    this.influencers.push(influencer);
    if (this.canvas) influencer.mount(this);
  }

  unregisterInfluencer(id: string): void {
    const idx = this.influencers.findIndex((i) => i.id === id);
    if (idx < 0) return;
    this.influencers[idx]!.unmount();
    this.influencers.splice(idx, 1);
  }

  emitField(input: EmitFieldInput): string {
    return this.influence.emit(input, performance.now());
  }

  updateField(
    id: string,
    patch: Partial<Pick<EmitFieldInput, "x" | "y" | "radius" | "strength" | "velocity">>,
  ): boolean {
    return this.influence.updateField(id, patch);
  }

  removeField(id: string): void {
    this.influence.remove(id);
  }

  clearFields(): void {
    this.influence.clear();
  }

  setSurfaceState(state: SurfaceState): void {
    this.surface.setState(state);
  }

  getSurfaceState(): SurfaceState {
    return this.surface.state;
  }

  getCanvasElement(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getConfig(): Readonly<AsciiInteractionConfig> {
    return this.config;
  }

  isReducedMotion(): boolean {
    return this.reducedMotion;
  }

  getStats(): AsciiEngineStats {
    const cursor = this.mouseInfluencer.getCursor();
    const r = this.config.radius;
    const perfMemory = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;

    return {
      fps: Math.round(this.fpsSmoothed),
      frameTimeMs: this.frameTimeMs,
      renderTimeMs: this.renderTimeMs,
      characterCount: this.grid.count,
      activeCharacterCount: this.grid.activeCount,
      dirtyCount: this.grid.dirtyCount,
      cursorX: cursor.x,
      cursorY: cursor.y,
      cursorRadius: r,
      cursorActive: cursor.active,
      influencedArea: Math.PI * r * r * 2.25,
      surfaceState: this.surface.state,
      memoryMb: perfMemory
        ? Math.round(perfMemory.usedJSHeapSize / 1048576)
        : undefined,
    };
  }

  getDebugSnapshot(maxCells = 512): AsciiDebugSnapshot {
    const grid = this.grid;
    const limit = Math.min(grid.activeCount, maxCells);
    const activeCells: { x: number; y: number; vx: number; vy: number }[] = [];

    for (let a = 0; a < limit; a += 1) {
      const i = grid.activeIndices[a]!;
      activeCells.push({
        x: grid.getPosX(i),
        y: grid.getPosY(i),
        vx: grid.velX[i]!,
        vy: grid.velY[i]!,
      });
    }

    return {
      width: this.width,
      height: this.height,
      cols: grid.cols,
      rows: grid.rows,
      cellWidth: grid.cellWidth,
      cellHeight: grid.cellHeight,
      layoutOffsetX: grid.layoutOffsetX,
      layoutOffsetY: grid.layoutOffsetY,
      activeCells,
    };
  }

  private onFrame(now: number): void {
    if (this.destroyed) return;

<<<<<<< Updated upstream
    if (this.lastFrameNow > 0) {
      this.frameTimeMs = now - this.lastFrameNow;
      const instantFps = 1000 / Math.max(this.frameTimeMs, 0.001);
      this.fpsSmoothed = this.fpsSmoothed * 0.88 + instantFps * 0.12;
    }
    this.lastFrameNow = now;
=======
    const frameStart = performance.now();
    if (this.lastFrameMs > 0) {
      const delta = frameStart - this.lastFrameMs;
      this.frameTimeSmoothed = this.frameTimeSmoothed * 0.9 + delta * 0.1;
      this.fpsSmoothed = this.fpsSmoothed * 0.9 + (1000 / delta) * 0.1;
    }
    this.lastFrameMs = frameStart;

    if (!this.config.enableInteraction) {
      const renderStart = performance.now();
      this.renderer.renderFrame({
        grid: this.grid,
        dirtyIndices: this.grid.dirtyIndices,
        dirtyCount: this.grid.dirtyCount,
        width: this.width,
        height: this.height,
        opacity: this.config.opacity,
      });
      this.lastRenderMs = performance.now() - renderStart;
      return;
    }
>>>>>>> Stashed changes

    const grid = this.grid;
    const cursor = this.mouseInfluencer.getCursor();

    this.timestep.tick(now, this.config.fixedTimestep, this.config.maxSubSteps, (dt) => {
      this.surface.update(dt, now * 0.001);
      this.influence.update(now, dt);

      for (const inf of this.influencers) {
        inf.update(dt);
      }

      const preset = this.surface.live;
      const effectiveConfig = this.surface.applyConfigOverrides(this.config);
      const stable = isSurfaceStable(grid, effectiveConfig);

      if (cursor.active) {
        this.surface.setState(SurfaceState.Hover);
      } else if (!stable) {
        this.surface.setState(SurfaceState.Disturbed);
      } else {
        this.surface.setState(SurfaceState.Idle);
      }

      const fullyIdle =
        !cursor.active &&
        stable &&
        this.surface.state === SurfaceState.Idle &&
        !this.reducedMotion;

      if (fullyIdle) {
        this.evolution.syncAllHome(grid);
        this.physics.idleBreath(grid, preset);
        return;
      }

      this.buildActiveSet(grid, cursor.x, cursor.y, effectiveConfig);

      if (cursor.active && effectiveConfig.enableTrail && !this.reducedMotion) {
        this.trail.setCursorMotion(cursor.x, cursor.y, cursor.vx, cursor.vy);
        this.trail.deposit(
          grid,
          cursor.x,
          cursor.y,
          effectiveConfig,
          preset.trailDeposit / Math.max(this.baseConfig.trailDeposit, 0.001),
          effectiveConfig.radius * 1.5,
        );
      }

      this.sampleForces(grid, preset.fieldSensitivity);

      this.physics.step(
        grid,
        effectiveConfig,
        preset,
        this.config.parallax,
        this.forceSamples,
        dt,
        this.reducedMotion,
      );

      if (effectiveConfig.enableTrail && !this.reducedMotion) {
        this.trail.evaporate(
          grid,
          preset.trailDecay,
          dt,
          effectiveConfig.radius * 2.5,
          cursor.x,
          cursor.y,
          cursor.active,
        );
      }

      this.evolution.step(
        grid,
        effectiveConfig,
        preset.evolutionRate,
        cursor.speed,
        dt,
      );
    });

    const renderStart = performance.now();
    this.renderer.renderFrame({
      grid,
      dirtyIndices: grid.dirtyIndices,
      dirtyCount: grid.dirtyCount,
      width: this.width,
      height: this.height,
      opacity: this.config.opacity,
    });
<<<<<<< Updated upstream
    this.renderTimeMs = performance.now() - renderStart;
=======
    this.lastRenderMs = performance.now() - renderStart;
>>>>>>> Stashed changes
  }

  private buildActiveSet(
    grid: CharacterGrid,
    cx: number,
    cy: number,
    config: AsciiInteractionConfig,
  ): void {
    grid.clearActive();
    grid.activeMask.fill(0);

    const r2 = config.radius * config.radius * 2.25;
    const max = grid.activeIndices.length;

    const tryAdd = (index: number): void => {
      if (grid.activeMask[index]) return;
      if (grid.activeCount >= max) return;
      grid.activeMask[index] = 1;
      grid.addActive(index);
    };

    // Prioridade 1: células em restauração (garante retorno 100%)
    for (let i = 0; i < grid.count; i += 1) {
      if (isCellUnsettled(grid, i, config)) {
        tryAdd(i);
      }
    }

    // Prioridade 2: proximidade do cursor
    for (let i = 0; i < grid.count; i += 1) {
      const px = grid.getPosX(i);
      const py = grid.getPosY(i);
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= r2) {
        tryAdd(i);
      }
    }
  }

  private sampleForces(grid: CharacterGrid, sensitivity: number): void {
    const minDist = this.config.minDistance;

    for (let a = 0; a < grid.activeCount; a += 1) {
      const i = grid.activeIndices[a]!;
      const sample = this.influence.sample(grid.getPosX(i), grid.getPosY(i), sensitivity);

      let { fx, fy } = sample;
      const { intensity } = sample;
      const mag = Math.hypot(fx, fy);
      if (mag > 0 && mag < minDist) {
        const s = minDist / mag;
        fx *= s;
        fy *= s;
      }

      const slot = this.forceSamples[i]!;
      slot.fx = fx;
      slot.fy = fy;
      slot.intensity = intensity;
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.loop.stop();
    for (const inf of [...this.influencers]) {
      inf.unmount();
    }
    this.influencers.length = 0;
    this.influence.clear();
    this.renderer.destroy();
    this.canvas = null;
    this.ctx = null;
  }
}
