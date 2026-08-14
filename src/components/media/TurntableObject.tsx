"use client";

/**
 * TurntableObject — reads a real production-marker JSON, finds one named
 * piece, and renders its outline as a slowly turning object. One WebGL
 * context per mount — never one per piece. See
 * design/components/construction-gallery.md.
 *
 * Callers should key this component on `patternUrl + pieceName` so a piece
 * change forces a clean remount rather than an in-place geometry swap —
 * there is no cross-piece interpolation to preserve.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface MarkerPiece {
  name: string;
  widthIn: number;
  heightIn: number;
  aspect: number;
  labelDistIn: number;
  labelTrusted: boolean;
  selfIntersections: number;
  outline: [number, number][];
}

export interface MarkerData {
  source: string;
  producer: string;
  model: string;
  size: string;
  markerWidthIn: number;
  markerLength: string;
  utilisation: string;
  piecesPlaced: number;
  pieces: MarkerPiece[];
}

interface TurntableObjectProps {
  patternUrl: string;
  pieceName: string;
  size?: number;
  speed?: number;
  /** Authoritative rotation in radians when set; auto-rotates when undefined. */
  rotation?: number;
  style?: React.CSSProperties;
}

export function TurntableObject({
  patternUrl,
  pieceName,
  size = 380,
  speed = 0.16,
  rotation,
  style,
}: TurntableObjectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let cancelled = false;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    wrapper.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.55, 1.85);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xfaf8f4, 0.55));
    const key = new THREE.DirectionalLight(0xfaf8f4, 0.9);
    key.position.set(1.2, 1.6, 1.4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9a7a5a, 0.5);
    rim.position.set(-1.4, -0.6, -1);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    let mesh: THREE.Mesh | null = null;
    let disposed = false;

    fetch(patternUrl)
      .then((r) => r.json())
      .then((marker: MarkerData) => {
        if (cancelled) return;
        const piece = marker.pieces.find((p) => p.name === pieceName);
        if (!piece || !piece.outline.length) return;

        const shape = new THREE.Shape();
        piece.outline.forEach(([x, y], i) => {
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });
        shape.closePath();

        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.03,
          bevelEnabled: true,
          bevelThickness: 0.006,
          bevelSize: 0.006,
          bevelSegments: 2,
          curveSegments: 24,
        });
        geometry.center();

        const material = new THREE.MeshStandardMaterial({
          color: 0x2b3a4a,
          roughness: 0.85,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2.6;
        mesh.scale.setScalar(1.5);
        group.add(mesh);
      })
      .catch(() => {});

    const clock = new THREE.Clock();
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (mesh) {
        if (rotationRef.current !== undefined) {
          group.rotation.y = rotationRef.current;
        } else {
          group.rotation.y += speed * dt;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelled = true;
      disposed = true;
      cancelAnimationFrame(animId);
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (wrapper.contains(renderer.domElement)) {
        wrapper.removeChild(renderer.domElement);
      }
      void disposed;
    };
    // patternUrl + pieceName are expected to be stable for this mount's
    // lifetime — callers key on them to force a remount instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternUrl, pieceName, size, speed]);

  return (
    <div
      ref={wrapperRef}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    />
  );
}
