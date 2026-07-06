import type { CommandDefinition } from "@/types/root-os";
import { ascii } from "@/features/ascii";
import { loadTracks } from "@/features/media/engine/music-library";
import { getAudioEngine } from "@/features/media/engine/audio-engine";
import { useMediaStore } from "@/features/media/engine/media-store";
import type { LoopMode } from "@/features/media/types";
import { misuse, success, stdout } from "../shared";

function ok(message: string) {
  return success(ascii.box([`${ascii.icon("success")} ${message}`], { style: "single" }).flatMap(stdout));
}

function fail(message: string) {
  return { exitCode: 1, lines: ascii.box([`${ascii.icon("error")} ${message}`], { style: "single" }).flatMap((l) => [{ stream: "stderr" as const, text: l }]).flat() };
}

async function ensureTracks() {
  const tracks = await loadTracks().catch(() => []);
  const engine = getAudioEngine();
  engine.setTracks(tracks);
  return { tracks, engine };
}

function currentSummary() {
  const store = useMediaStore.getState();
  const engine = getAudioEngine();
  const track = engine.getCurrentTrack();
  const title = track?.title ?? "—";
  const state = store.playing ? "PLAYING" : store.started ? "PAUSED" : "IDLE";
  const volume = Math.round(store.volume * 100);
  const loop = store.loopMode.toUpperCase();
  const shuf = store.shuffle ? "ON" : "OFF";
  return ascii.box(
    ascii.table({
      headers: ["Field", "Value"],
      rows: [
        ["State", state],
        ["Track", title],
        ["Time", `${Math.floor(store.currentTime)} / ${Math.floor(store.duration)}`],
        ["Volume", `${store.muted ? "MUTED" : `${volume}%`}`],
        ["Shuffle", shuf],
        ["Loop", loop],
      ],
    }),
    { title: "Now Playing", style: "double" },
  );
}

export const musicCommand: CommandDefinition = {
  name: "music",
  aliases: ["player"],
  description: "Open Media.app",
  usage: "music",
  category: "system",
  execute() {
    return success(stdout("Opening Media.app..."), { openApp: "media" });
  },
};

export const playCommand: CommandDefinition = {
  name: "play",
  description: "Start playback",
  usage: "play",
  category: "system",
  async execute() {
    const { tracks, engine } = await ensureTracks();
    if (tracks.length === 0) return fail("No tracks found in /public/music.");
    await engine.play();
    return ok("Playback started.");
  },
};

export const pauseCommand: CommandDefinition = {
  name: "pause",
  description: "Pause playback",
  usage: "pause",
  category: "system",
  execute() {
    getAudioEngine().pause();
    return ok("Playback paused.");
  },
};

export const stopCommand: CommandDefinition = {
  name: "stop",
  description: "Stop playback",
  usage: "stop",
  category: "system",
  execute() {
    getAudioEngine().stop();
    return ok("Playback stopped.");
  },
};

export const nextCommand: CommandDefinition = {
  name: "next",
  description: "Next track",
  usage: "next",
  category: "system",
  async execute() {
    const { tracks, engine } = await ensureTracks();
    if (tracks.length === 0) return fail("No tracks found in /public/music.");
    engine.next();
    return ok("Skipped to next track.");
  },
};

export const prevCommand: CommandDefinition = {
  name: "prev",
  aliases: ["previous"],
  description: "Previous track",
  usage: "prev",
  category: "system",
  async execute() {
    const { tracks, engine } = await ensureTracks();
    if (tracks.length === 0) return fail("No tracks found in /public/music.");
    engine.prev();
    return ok("Went to previous track.");
  },
};

export const volumeCommand: CommandDefinition = {
  name: "volume",
  description: "Set volume (0-100)",
  usage: "volume <0-100>",
  category: "system",
  execute(_ctx, argv) {
    const raw = argv[0];
    if (!raw) return misuse("volume: missing <0-100>");
    const n = Number(raw);
    if (!Number.isFinite(n)) return misuse("volume: invalid number");
    const v = Math.max(0, Math.min(100, n));
    getAudioEngine().setVolume(v / 100);
    return ok(`Volume set to ${v}%.`);
  },
};

export const muteCommand: CommandDefinition = {
  name: "mute",
  description: "Toggle mute",
  usage: "mute",
  category: "system",
  execute() {
    getAudioEngine().toggleMute();
    return ok(useMediaStore.getState().muted ? "Muted." : "Unmuted.");
  },
};

export const shuffleCommand: CommandDefinition = {
  name: "shuffle",
  description: "Shuffle mode",
  usage: "shuffle [on|off|toggle]",
  category: "system",
  execute(_ctx, argv) {
    const arg = argv[0]?.toLowerCase() ?? "toggle";
    const store = useMediaStore.getState();
    const next =
      arg === "on" ? true : arg === "off" ? false : !store.shuffle;
    store.setShuffle(next);
    return ok(`Shuffle ${next ? "ON" : "OFF"}.`);
  },
};

export const loopCommand: CommandDefinition = {
  name: "loop",
  description: "Loop mode (off|one|all)",
  usage: "loop [off|one|all|toggle]",
  category: "system",
  execute(_ctx, argv) {
    const arg = argv[0]?.toLowerCase() ?? "toggle";
    const store = useMediaStore.getState();
    const next: LoopMode =
      arg === "off" || arg === "one" || arg === "all"
        ? (arg as LoopMode)
        : store.loopMode === "off"
          ? "all"
          : store.loopMode === "all"
            ? "one"
            : "off";
    store.setLoopMode(next);
    return ok(`Loop set to ${next.toUpperCase()}.`);
  },
};

export const nowPlayingCommand: CommandDefinition = {
  name: "nowplaying",
  aliases: ["np"],
  description: "Show current track",
  usage: "np",
  category: "system",
  execute() {
    const lines = currentSummary();
    return success(lines.flatMap((l) => stdout(l)));
  },
};

export const cavaCommand: CommandDefinition = {
  name: "cava",
  description: "Open spectrum visualizer (WebAudio FFT)",
  usage: "cava",
  category: "system",
  execute() {
    const engine = getAudioEngine();
    if (!engine.getAnalyser()) {
      return fail("No active audio source.");
    }
    return success(stdout("Opening Media.app (cava)..."), { openApp: "media" });
  },
};

export const MEDIA_COMMANDS: CommandDefinition[] = [
  musicCommand,
  playCommand,
  pauseCommand,
  stopCommand,
  nextCommand,
  prevCommand,
  volumeCommand,
  muteCommand,
  shuffleCommand,
  loopCommand,
  nowPlayingCommand,
  cavaCommand,
];

