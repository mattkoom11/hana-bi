#!/usr/bin/env node
// Turns raw camera footage into a web-ready background scene: an H.264 MP4, a VP9 WebM
// and a JPEG poster, cut, scaled, lightly denoised and (by default) looped seamlessly.
// Self-contained: needs only Node and ffmpeg/ffprobe, so it can move to a new repo as is.
//
//   node scripts/encode-scene.mjs <input> --name street [options]
//
//   --name <slug>       output basename (required)
//   --start <sec>       where the cut starts in the source (default 0)
//   --duration <sec>    length of the cut taken from the source (default 10)
//   --out <dir>         output directory (default public/scenes)
//   --short-edge <px>   cap on the shorter side; portrait footage stays portrait (default 1080)
//   --fps <n>           output frame rate (default 24)
//   --fade <sec>        loop seam crossfade length (default 1)
//   --budget <MB>       fail if either video is larger (default 4)
//   --no-seamless       do not crossfade the end into the start
//   --no-denoise        skip the light temporal denoise (noise in dark footage costs bytes)
//
// Exit codes: 0 ok · 1 bad input or ffmpeg failure · 2 a file is over budget (files kept).

import { spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULTS = {
  start: 0,
  duration: 10,
  out: "public/scenes",
  shortEdge: 1080,
  fps: 24,
  fade: 1,
  budget: 4,
  seamless: true,
  denoise: true,
};

const FIX_FFMPEG = "sudo dnf swap ffmpeg-free ffmpeg --allowerasing   # RPM Fusion's full build";

export function parseArgs(argv) {
  const opts = { ...DEFAULTS, input: undefined, name: undefined };
  const numeric = { "--start": "start", "--duration": "duration", "--short-edge": "shortEdge", "--fps": "fps", "--fade": "fade", "--budget": "budget" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-seamless") opts.seamless = false;
    else if (a === "--no-denoise") opts.denoise = false;
    else if (a === "--name") opts.name = argv[++i];
    else if (a === "--out") opts.out = argv[++i];
    else if (a in numeric) {
      const v = Number(argv[++i]);
      if (!Number.isFinite(v) || v < 0) throw new Error(`${a} needs a non-negative number`);
      opts[numeric[a]] = v;
    } else if (a.startsWith("--")) throw new Error(`Unknown option ${a}`);
    else if (!opts.input) opts.input = a;
    else throw new Error(`Unexpected argument ${a}`);
  }
  if (!opts.input) throw new Error("Missing <input> file");
  if (!opts.name || !/^[a-z0-9][a-z0-9-]*$/.test(opts.name)) throw new Error("--name must be a kebab-case slug, e.g. --name street");
  if (opts.duration <= 0) throw new Error("--duration must be greater than 0");
  if (opts.seamless && opts.duration <= 2 * opts.fade) {
    throw new Error(`--duration must be more than twice --fade (${opts.fade}s) for a seamless loop`);
  }
  return opts;
}

/** Reads `ffmpeg -encoders` / `-decoders` listings. */
export function detectCaps(encodersText, decodersText) {
  const has = (text, name) => new RegExp(`^\\s*\\S+\\s+${name}\\s`, "m").test(text);
  return {
    h264: has(encodersText, "libx264") ? "libx264" : has(encodersText, "libopenh264") ? "libopenh264" : null,
    vp9: has(encodersText, "libvpx-vp9"),
    // Native decoder is "hevc"; some builds list only hardware/third-party ones.
    hevcDecode: has(decodersText, "hevc") || has(decodersText, "libde265") || has(decodersText, "hevc_\\w+"),
  };
}

/**
 * The video filter graph. Seamless: the cut's first `fade` seconds are crossfaded onto its
 * end, so the last frame leads straight back into the first. Output is `fade` shorter.
 */
export function buildFilter({ duration, fps, shortEdge, denoise, seamless, fade }) {
  const scale =
    `scale=w='if(gte(iw,ih),-2,min(${shortEdge}\\,iw))':h='if(gte(iw,ih),min(${shortEdge}\\,ih),-2)'` +
    ":flags=lanczos";
  const prep = [`fps=${fps}`, scale, denoise ? "hqdn3d=1.5:1.5:6:6" : null, "format=yuv420p"].filter(Boolean).join(",");
  if (!seamless) return `[0:v]${prep}[v]`;
  const offset = +(duration - 2 * fade).toFixed(3);
  return [
    `[0:v]${prep},split[a][b]`,
    `[a]trim=start=${fade},setpts=PTS-STARTPTS[main]`,
    `[b]trim=end=${fade},setpts=PTS-STARTPTS[head]`,
    `[main][head]xfade=transition=fade:duration=${fade}:offset=${offset}[v]`,
  ].join(";");
}

/** ffmpeg argument lists for the MP4, WebM and poster. */
export function buildJobs(opts, caps) {
  if (!caps.h264) throw new Error("This ffmpeg has no H.264 encoder.\n  Fix: " + FIX_FFMPEG);
  const base = join(opts.out, opts.name);
  const files = { mp4: `${base}.mp4`, webm: `${base}.webm`, poster: `${base}.jpg` };
  const input = ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(opts.start), "-t", String(opts.duration), "-i", opts.input];
  const graph = ["-filter_complex", buildFilter(opts), "-map", "[v]", "-an"];

  const h264 =
    caps.h264 === "libx264"
      ? // aq-mode 3 moves bits into dark flat areas, where banding shows first.
        ["-c:v", "libx264", "-preset", "slow", "-crf", "24", "-profile:v", "high", "-x264-params", "aq-mode=3"]
      : ["-c:v", "libopenh264", "-b:v", "2500k", "-maxrate", "3500k"];

  const jobs = [
    { label: `MP4 (${caps.h264})`, file: files.mp4, args: [...input, ...graph, ...h264, "-pix_fmt", "yuv420p", "-movflags", "+faststart", files.mp4] },
  ];
  if (caps.vp9) {
    jobs.push({
      label: "WebM (VP9)",
      file: files.webm,
      args: [...input, ...graph, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", files.webm],
    });
  }
  // Poster = the loop's first frame, so nothing jumps when the video starts.
  jobs.push({
    label: "Poster (JPEG)",
    file: files.poster,
    args: ["-hide_banner", "-loglevel", "error", "-y", "-i", files.mp4, "-frames:v", "1", "-q:v", "3", files.poster],
  });
  return { jobs, files };
}

/** Which outputs break the size budget (videos only). */
export function overBudget(sizes, budgetMB) {
  const limit = budgetMB * 1024 * 1024;
  return Object.entries(sizes)
    .filter(([kind, bytes]) => kind !== "poster" && bytes > limit)
    .map(([kind]) => kind);
}

// ---------------------------------------------------------------------------------------

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.error) throw new Error(`${cmd} not found — install ffmpeg first.`);
  return r;
}

function probe(input) {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height:format=duration", "-of", "json", input]);
  if (r.status !== 0) throw new Error(`Cannot read ${input}:\n${r.stderr.trim()}`);
  const j = JSON.parse(r.stdout);
  const s = j.streams?.[0];
  if (!s) throw new Error(`${input} has no video stream`);
  return { codec: s.codec_name, width: s.width, height: s.height, duration: Number(j.format?.duration ?? 0) };
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`encode-scene: ${e.message}\n\nUsage: node scripts/encode-scene.mjs <input> --name <slug> [--start s] [--duration s]`);
    process.exit(1);
  }

  const caps = detectCaps(run("ffmpeg", ["-hide_banner", "-encoders"]).stdout, run("ffmpeg", ["-hide_banner", "-decoders"]).stdout);
  const src = probe(opts.input);

  if (src.codec === "hevc" && !caps.hevcDecode) {
    console.error(`encode-scene: ${basename(opts.input)} is HEVC (the iPhone default), which this ffmpeg cannot decode.\n  Fix: ${FIX_FFMPEG}`);
    process.exit(1);
  }
  if (src.duration && opts.start + opts.duration > src.duration + 0.05) {
    console.error(`encode-scene: the cut (${opts.start}s + ${opts.duration}s) runs past the end of the source (${src.duration.toFixed(2)}s).`);
    process.exit(1);
  }
  if (caps.h264 === "libopenh264") {
    console.warn("encode-scene: using OpenH264 (lower quality per byte). For libx264:\n  " + FIX_FFMPEG);
  }
  if (!caps.vp9) console.warn("encode-scene: no VP9 encoder — skipping WebM; the MP4 alone works everywhere.");

  mkdirSync(opts.out, { recursive: true });
  let plan;
  try {
    plan = buildJobs(opts, caps);
  } catch (e) {
    console.error(`encode-scene: ${e.message}`);
    process.exit(1);
  }

  const loopLen = opts.seamless ? opts.duration - opts.fade : opts.duration;
  console.log(
    `${basename(opts.input)} · ${src.codec} ${src.width}×${src.height} → "${opts.name}", ` +
      `${loopLen}s ${opts.seamless ? "seamless loop" : "clip"} from ${opts.start}s`,
  );

  const sizes = {};
  for (const job of plan.jobs) {
    process.stdout.write(`  ${job.label.padEnd(18)}`);
    const t0 = Date.now();
    const r = run("ffmpeg", job.args);
    if (r.status !== 0) {
      console.log("failed");
      console.error(r.stderr.trim());
      process.exit(1);
    }
    const kind = job.file.endsWith(".mp4") ? "mp4" : job.file.endsWith(".webm") ? "webm" : "poster";
    sizes[kind] = statSync(job.file).size;
    console.log(`${mb(sizes[kind]).padStart(9)}  ${((Date.now() - t0) / 1000).toFixed(1)}s  ${job.file}`);
  }

  // Paths as the site serves them, for src/data/night-scenes.ts.
  const publicRoot = resolve("public");
  const served = (f) => {
    const abs = resolve(f);
    return abs.startsWith(publicRoot) ? abs.slice(publicRoot.length) : f;
  };
  console.log(
    `\n  night-scenes.ts → clip: "${served(plan.files.mp4)}",` +
      (sizes.webm ? ` webm: "${served(plan.files.webm)}",` : "") +
      ` poster: "${served(plan.files.poster)}"`,
  );

  const over = overBudget(sizes, opts.budget);
  if (over.length) {
    console.error(
      `\nencode-scene: over the ${opts.budget} MB budget: ${over.join(", ")}. Files kept for inspection.\n` +
        "  Try a shorter --duration, a smaller --short-edge, or a calmer shot (motion and noise cost the most).",
    );
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
