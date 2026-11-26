"use client";

// The relaunch landing: one night in New York, told as pinned scenes driven by scroll, all
// lit by the same carried light (LightReveal). Scene opacity is written straight to the DOM
// from the scroll handler; React re-renders only when the active scene changes.

import { useEffect, useRef, useState } from "react";
import { LightReveal, type LightTuning } from "@/components/relaunch/LightReveal";
import { SceneVideo } from "@/components/relaunch/SceneVideo";
import { activeScene, pinnedProgress, sceneOpacities } from "@/lib/night-story";
import type { NightScene } from "@/data/night-scenes";
import "./night-story.css";

/** Scroll length per scene, in viewport heights. More = the scene lingers. */
const SCENE_LENGTH_VH = 160;

type Props = {
  scenes: NightScene[];
  atelierHref: string;
  tuning?: LightTuning;
};

export function NightStory({ scenes, atelierHref, tuning }: Props) {
  const count = scenes.length;
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = pinnedProgress(rect.top, rect.height, window.innerHeight);
      const ops = sceneOpacities(progress, count);
      ops.forEach((o, i) => {
        const value = o.toFixed(3);
        const layer = layerRefs.current[i];
        const copy = copyRefs.current[i];
        if (layer) layer.style.opacity = value;
        if (copy) copy.style.opacity = value;
      });
      setActive(activeScene(progress, count)); // bails out when unchanged
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  // The quiet way out: jump (never smooth-scroll) to the atelier, so a buyer does not
  // sit through four scenes flickering past.
  const skipToAtelier = () => {
    const section = sectionRef.current;
    if (!section) return;
    const bottom = window.scrollY + section.getBoundingClientRect().bottom;
    window.scrollTo({ top: bottom - window.innerHeight, behavior: "instant" });
  };

  const last = count - 1;

  return (
    <section ref={sectionRef} className="night-story" style={{ height: `${count * SCENE_LENGTH_VH}svh` }}>
      <div className="night-story__stage">
        <LightReveal
          tuning={tuning}
          media={scenes.map((scene, i) => {
            const near = Math.abs(i - active) <= 1;
            return (
              <div
                key={scene.id}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                className="night-story__layer"
                data-first={i === 0 || undefined}
              >
                <SceneVideo src={scene.clip} webm={scene.webm} poster={scene.poster} playing={near} preload={near ? "auto" : "none"} />
              </div>
            );
          })}
        >
          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              ref={(el) => {
                copyRefs.current[i] = el;
              }}
              className="night-story__copy"
              data-first={i === 0 || undefined}
              inert={i !== active}
            >
              <p className="night-story__label">{scene.label}</p>
              <div>
                <p className="night-story__line">{scene.line}</p>
                {i === last && (
                  <a className="night-story__enter" href={atelierHref}>
                    Enter the atelier
                  </a>
                )}
              </div>
            </div>
          ))}

          {active !== last && (
            <button type="button" className="night-story__skip" onClick={skipToAtelier}>
              Skip to the atelier
            </button>
          )}
          <p className="night-story__pager" aria-hidden="true">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
        </LightReveal>
      </div>
    </section>
  );
}
