import { describe, expect, it } from "vitest";
import { buildFilter, buildJobs, detectCaps, overBudget, parseArgs } from "./encode-scene.mjs";

const ENC_FULL = ` V....D libx264              libx264 H.264 / AVC
 V....D libopenh264          OpenH264 H.264
 V....D libvpx-vp9           libvpx VP9`;
const ENC_FREE = ` V....D libopenh264          OpenH264 H.264
 V....D libvpx-vp9           libvpx VP9`;
const DEC_FULL = ` VFS..D hevc                 HEVC (High Efficiency Video Coding)
 V....D h264                 H.264`;
const DEC_FREE = ` V....D libopenh264          OpenH264 H.264`;

describe("parseArgs", () => {
  it("applies defaults", () => {
    const o = parseArgs(["in.mov", "--name", "street"]);
    expect(o).toMatchObject({ input: "in.mov", name: "street", start: 0, duration: 10, seamless: true, denoise: true, budget: 4 });
  });

  it("reads numbers and flags", () => {
    const o = parseArgs(["in.mov", "--name", "cab", "--start", "3.5", "--duration", "8", "--no-seamless", "--no-denoise", "--budget", "6"]);
    expect(o).toMatchObject({ start: 3.5, duration: 8, seamless: false, denoise: false, budget: 6 });
  });

  it("rejects a missing input or a bad name", () => {
    expect(() => parseArgs(["--name", "street"])).toThrow(/input/);
    expect(() => parseArgs(["in.mov"])).toThrow(/--name/);
    expect(() => parseArgs(["in.mov", "--name", "Jazz Bar"])).toThrow(/kebab-case/);
  });

  it("rejects unknown options and bad numbers", () => {
    expect(() => parseArgs(["in.mov", "--name", "a", "--speed", "2"])).toThrow(/Unknown option/);
    expect(() => parseArgs(["in.mov", "--name", "a", "--start", "soon"])).toThrow(/number/);
  });

  it("needs a seamless cut longer than two fades", () => {
    expect(() => parseArgs(["in.mov", "--name", "a", "--duration", "2"])).toThrow(/twice --fade/);
    expect(() => parseArgs(["in.mov", "--name", "a", "--duration", "2", "--no-seamless"])).not.toThrow();
  });
});

describe("detectCaps", () => {
  it("prefers libx264 and sees HEVC on a full build", () => {
    expect(detectCaps(ENC_FULL, DEC_FULL)).toEqual({ h264: "libx264", vp9: true, hevcDecode: true });
  });

  it("falls back to OpenH264 without HEVC on ffmpeg-free", () => {
    expect(detectCaps(ENC_FREE, DEC_FREE)).toEqual({ h264: "libopenh264", vp9: true, hevcDecode: false });
  });

  it("does not mistake libx264rgb or a description for libx264", () => {
    expect(detectCaps(" V....D libx264rgb           libx264 H.264 RGB", "").h264).toBe(null);
  });
});

describe("buildFilter", () => {
  const base = { duration: 10, fps: 24, shortEdge: 1080, denoise: true, fade: 1 };

  it("crossfades the head onto the tail for a seamless loop", () => {
    const f = buildFilter({ ...base, seamless: true });
    expect(f).toContain("[a]trim=start=1");
    expect(f).toContain("[b]trim=end=1");
    expect(f).toContain("xfade=transition=fade:duration=1:offset=8[v]");
  });

  it("is a single chain without the loop", () => {
    expect(buildFilter({ ...base, seamless: false })).toMatch(/^\[0:v\]fps=24,scale=.*format=yuv420p\[v\]$/);
  });

  it("escapes commas inside scale expressions", () => {
    expect(buildFilter({ ...base, seamless: false })).toContain("min(1080\\,ih)");
  });

  it("drops the denoise when asked", () => {
    expect(buildFilter({ ...base, seamless: false, denoise: false })).not.toContain("hqdn3d");
  });
});

describe("buildJobs", () => {
  const opts = { ...parseArgs(["raw/IMG_0412.MOV", "--name", "street", "--start", "2"]), out: "public/scenes" };

  it("makes MP4, WebM and poster with libx264", () => {
    const { jobs, files } = buildJobs(opts, { h264: "libx264", vp9: true });
    expect(jobs.map((j) => j.file)).toEqual([files.mp4, files.webm, files.poster]);
    expect(files).toEqual({ mp4: "public/scenes/street.mp4", webm: "public/scenes/street.webm", poster: "public/scenes/street.jpg" });
    const mp4 = jobs[0].args;
    expect(mp4).toEqual(expect.arrayContaining(["libx264", "-an", "+faststart"]));
    expect(mp4.slice(mp4.indexOf("-ss"), mp4.indexOf("-ss") + 4)).toEqual(["-ss", "2", "-t", "10"]);
  });

  it("takes the poster from the encoded MP4", () => {
    const { jobs, files } = buildJobs(opts, { h264: "libx264", vp9: true });
    expect(jobs[2].args).toEqual(expect.arrayContaining(["-i", files.mp4, "-frames:v", "1"]));
  });

  it("skips WebM without VP9 and uses bitrate mode with OpenH264", () => {
    const { jobs } = buildJobs(opts, { h264: "libopenh264", vp9: false });
    expect(jobs).toHaveLength(2);
    expect(jobs[0].args).toEqual(expect.arrayContaining(["libopenh264", "-b:v"]));
  });

  it("refuses to run with no H.264 encoder", () => {
    expect(() => buildJobs(opts, { h264: null, vp9: true })).toThrow(/dnf swap/);
  });
});

describe("overBudget", () => {
  it("flags only videos over the limit", () => {
    const MB = 1024 * 1024;
    expect(overBudget({ mp4: 3 * MB, webm: 5 * MB, poster: 9 * MB }, 4)).toEqual(["webm"]);
  });
});
