"use client";

import { useEffect, useState } from "react";
import { DEFAULT_TUNING, LightReveal, type LightTuning } from "@/components/relaunch/LightReveal";
import { SceneVideo } from "@/components/relaunch/SceneVideo";
import { VIDEO_CLIPS } from "@/lib/video-clips";

// clip-29 is HEVC, which Chrome on Linux cannot decode. Stand-in clips only:
// they predate the relaunch and still carry the dropped Japanese imagery.
const CLIPS = VIDEO_CLIPS.filter((c) => !c.endsWith("clip-29.mp4"));
const DEFAULT_CLIP = CLIPS.find((c) => c.endsWith("clip-15.mp4")) ?? CLIPS[0];

const SLIDERS: { key: keyof LightTuning; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: "radius", label: "Radius", min: 8, max: 80, step: 1, unit: "vmin" },
  { key: "core", label: "Core", min: 0, max: 0.8, step: 0.01, unit: "" },
  { key: "lagMs", label: "Lag", min: 0, max: 1200, step: 10, unit: "ms" },
  { key: "warmth", label: "Warmth", min: 0, max: 1, step: 0.01, unit: "" },
  { key: "ambient", label: "Ambient", min: 0, max: 0.4, step: 0.01, unit: "" },
];

const mono: React.CSSProperties = {
  fontFamily: "var(--hb-font-mono)",
  fontWeight: 300,
  fontSize: "0.65rem",
  letterSpacing: "var(--hb-track-meta, 0.3em)",
  textTransform: "uppercase",
};

export function LightRevealLab() {
  const [tuning, setTuning] = useState<LightTuning>(DEFAULT_TUNING);
  const [clip, setClip] = useState(DEFAULT_CLIP);
  const [panelOpen, setPanelOpen] = useState(true);

  // T toggles the panel so the scene can be judged without it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t" && !(e.target instanceof HTMLInputElement)) setPanelOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <LightReveal media={<SceneVideo key={clip} src={clip} playing />} tuning={tuning}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "2.5rem" }}>
          <p style={{ ...mono, color: "var(--hb-sienna)", margin: 0 }}>01 · Street</p>
          <p
            style={{
              fontFamily: "var(--hb-font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(2rem, 5vw, 4rem)",
              color: "var(--hb-paper)",
              margin: 0,
            }}
          >
            Wear it late.
          </p>
        </div>
      </LightReveal>

      {panelOpen && (
        <aside
          style={{
            ...mono,
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 10,
            width: "17rem",
            padding: "1rem",
            background: "var(--hb-dark-surface)",
            border: "1px solid var(--hb-dark-border)",
            color: "var(--hb-paper)",
            display: "grid",
            gap: "0.9rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Light · tuning</span>
            <span style={{ opacity: 0.45 }}>T hides</span>
          </div>

          {SLIDERS.map((s) => (
            <label key={s.key} style={{ display: "grid", gap: "0.35rem" }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{s.label}</span>
                <span style={{ opacity: 0.6 }}>
                  {tuning[s.key]}
                  {s.unit && ` ${s.unit}`}
                </span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={tuning[s.key]}
                onChange={(e) => setTuning((t) => ({ ...t, [s.key]: Number(e.target.value) }))}
                style={{ accentColor: "var(--hb-sienna)" }}
              />
            </label>
          ))}

          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span>Clip (stand-in)</span>
            <span style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {CLIPS.map((c) => {
                const n = c.match(/clip-(\d+)/)?.[1] ?? c;
                const active = c === clip;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClip(c)}
                    style={{
                      ...mono,
                      fontSize: "0.55rem",
                      padding: "0.3rem 0.45rem",
                      background: "none",
                      color: "var(--hb-paper)",
                      border: `1px solid ${active ? "var(--hb-sienna)" : "var(--hb-dark-border)"}`,
                      opacity: active ? 1 : 0.55,
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </span>
          </label>

          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(JSON.stringify(tuning))}
            style={{ ...mono, padding: "0.6rem", background: "none", color: "var(--hb-paper)", border: "1px solid var(--hb-dark-border)", cursor: "pointer" }}
          >
            Copy values
          </button>
        </aside>
      )}
    </>
  );
}
