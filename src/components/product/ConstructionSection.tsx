"use client";

/**
 * ConstructionSection — the piece-index + turntable-stage for the product
 * page's construction gallery. Renders only when a real production marker
 * is supplied. Never fabricate marker data — see design/ASSETS.md and
 * design/components/construction-gallery.md.
 */

import { useRef, useState } from "react";
import { TurntableObject, type MarkerData } from "@/components/media/TurntableObject";

const WORDS: Record<string, string> = {
  BK: "back",
  FT: "front",
  SD: "side",
  RT: "right",
  LT: "left",
  PKT: "pocket",
  PK: "pocket",
  PTCH: "patch",
  FLP: "flap",
  BG: "bag",
  FAC: "facing",
  HEM: "hem",
  YOKE: "yoke",
  WB: "waistband",
  TAB: "tab",
  FLY: "fly",
  BTN: "button",
  EXT: "extension",
  COIN: "coin",
};

function readLabel(name: string): { number: string | null; title: string; cut: string } {
  const m = /^(\d+)\s+(.*)$/.exec(name);
  const number = m ? m[1] : null;
  const rest = (m ? m[2] : name).trim();
  const parts = rest.split("-");
  const words = parts[0]
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => WORDS[w.toUpperCase()] ?? w.toLowerCase());
  const cuts = parts
    .slice(1)
    .map((p) => /^(\d+)([SC])$/i.exec(p.trim()))
    .filter((x): x is RegExpExecArray => !!x)
    .map((c) => c[1] + (c[2].toUpperCase() === "S" ? " self" : " contrast"));

  return {
    number,
    title: words.length ? words.join(" ") : "unlabelled piece",
    cut: cuts.length ? "Cut " + cuts.join(" · ") : "Cut count not marked",
  };
}

const meta: React.CSSProperties = {
  fontFamily: "var(--hb-font-mono)",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "var(--hb-track-meta)",
  color: "var(--hb-dark-muted)",
};

interface ConstructionSectionProps {
  marker: MarkerData;
  markerUrl: string;
}

export function ConstructionSection({ marker, markerUrl }: ConstructionSectionProps) {
  const [index, setIndex] = useState(0);
  const [rotation, setRotation] = useState<number | null>(null);
  const drag = useRef<{ x: number; from: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const pieces = marker.pieces;
  const piece = pieces[index] ?? pieces[0];
  const read = readLabel(piece.name);

  const select = (i: number) => {
    setIndex(i);
    setRotation(null);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const from = rotation ?? 0;
    drag.current = { x: e.clientX, from };
    setRotation(from);
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setRotation(drag.current.from + (e.clientX - drag.current.x) * 0.01);
  };
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <section
      id="construction"
      className="hb-grain"
      style={{ background: "rgba(14,12,11,0.9)", padding: "5rem var(--hb-gutter)" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "var(--hb-max-width)",
          margin: "0 auto",
        }}
      >
        <p style={{ ...meta, color: "var(--hb-sienna)", letterSpacing: "var(--hb-track-eyebrow)", margin: 0 }}>
          Construction — {marker.source}
        </p>
        <h2
          style={{
            fontFamily: "var(--hb-font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(2rem, 4vw, 3.25rem)",
            lineHeight: 1.05,
            color: "var(--hb-on-dark)",
            margin: "1.5rem 0 1rem",
          }}
        >
          Every piece this garment is cut from.
        </h2>
        <p
          style={{
            fontSize: "1.125rem",
            lineHeight: 1.7,
            color: "var(--hb-dark-muted)",
            maxWidth: "38rem",
            margin: "0 0 3.5rem",
          }}
        >
          Read straight off the production marker — {marker.piecesPlaced} placements,{" "}
          {pieces.length} distinct pieces, nested at {marker.utilisation} on a{" "}
          {marker.markerWidthIn}-inch bolt. Drag the piece to turn it.
        </p>

        <div className="hb-construction" style={{ display: "grid", gap: "3rem", alignItems: "start" }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {pieces.map((p, i) => {
              const r = readLabel(p.name);
              const on = i === index;
              return (
                <li key={p.name} style={{ borderTop: "1px solid var(--hb-dark-border)" }}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns: "3.5rem minmax(0, 1fr)",
                      columnGap: "1.25rem",
                      rowGap: "0.5rem",
                      alignItems: "baseline",
                      textAlign: "left",
                      padding: "1.125rem 0",
                      transform: on ? "translateX(1rem)" : "translateX(0)",
                      opacity: on ? 1 : 0.5,
                      transition: "transform 450ms var(--hb-ease-expo-out), opacity 300ms ease",
                    }}
                  >
                    <span style={{ ...meta, color: "var(--hb-sienna)", letterSpacing: "var(--hb-track-catalog)" }}>
                      {r.number ? String(r.number).padStart(2, "0") : "—"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--hb-font-display)",
                        fontStyle: "italic",
                        fontWeight: 300,
                        fontSize: "1.375rem",
                        lineHeight: 1.3,
                        color: "var(--hb-on-dark)",
                        minWidth: 0,
                      }}
                    >
                      {r.title}
                    </span>
                    <span
                      style={{
                        ...meta,
                        gridColumn: 2,
                        display: "flex",
                        flexDirection: "column",
                        rowGap: "0.25rem",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <span>{r.cut}</span>
                      <span>
                        {p.widthIn} × {p.heightIn} in
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li style={{ borderTop: "1px solid var(--hb-dark-border)" }} />
          </ol>

          <div className="hb-construction-stage" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                border: "1px solid var(--hb-dark-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            >
              <TurntableObject
                key={markerUrl + piece.name}
                patternUrl={markerUrl}
                pieceName={piece.name}
                rotation={rotation === null ? undefined : rotation}
                size={380}
                speed={0.16}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ ...meta, color: "var(--hb-sienna)", margin: 0 }}>{piece.name}</p>
              <p
                style={{
                  fontFamily: "var(--hb-font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "1.75rem",
                  lineHeight: 1.1,
                  color: "var(--hb-on-dark)",
                  margin: 0,
                }}
              >
                {read.title}
              </p>
              <p style={{ ...meta, margin: 0 }}>
                {read.cut} · {piece.widthIn} × {piece.heightIn} in
                {piece.labelTrusted ? "" : " · label unverified"}
              </p>
              {rotation !== null && (
                <button
                  type="button"
                  onClick={() => setRotation(null)}
                  style={{
                    ...meta,
                    alignSelf: "flex-start",
                    marginTop: "0.5rem",
                    background: "transparent",
                    border: "1px solid var(--hb-dark-border)",
                    padding: "0.5rem 0.875rem",
                    cursor: "pointer",
                  }}
                >
                  Resume rotation
                </button>
              )}
            </div>

            <p
              style={{
                ...meta,
                opacity: 0.6,
                lineHeight: 1.8,
                margin: 0,
                borderTop: "1px solid var(--hb-dark-border)",
                paddingTop: "1rem",
              }}
            >
              {marker.producer}
              <br />
              Size {marker.size} · {marker.markerLength} · {marker.utilisation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
