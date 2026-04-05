"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import * as THREE from "three";

interface GarmentStageProps {
  product: Product;
  catalogNumber: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function GarmentStage({ product, catalogNumber }: GarmentStageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [cursorPointer, setCursorPointer] = useState(false);

  const targetZRef = useRef(4.0);
  const isFocusedRef = useRef(false);
  const setOverlayVisibleRef = useRef(setOverlayVisible);
  setOverlayVisibleRef.current = setOverlayVisible;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    wrapper.appendChild(renderer.domElement);

    // ── Scene ──────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera ─────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      45,
      wrapper.clientWidth / wrapper.clientHeight,
      0.1,
      100
    );
    camera.position.z = 4.0;

    // ── Lights ─────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfaf8f4, 0.3);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xd4956a, 2.5);
    spotLight.position.set(1.5, 2.5, 3);
    spotLight.penumbra = 0.4;
    spotLight.angle = Math.PI / 8;
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // ── Video Background Plane ────────────────────────────────────
    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = 640;
    videoCanvas.height = 360;
    const videoCtx = videoCanvas.getContext('2d')!;
    const videoTexture = new THREE.CanvasTexture(videoCanvas);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    const bgGeo = new THREE.PlaneGeometry(10, 5.6);
    const bgMat = new THREE.MeshStandardMaterial({
      map: videoTexture,
      roughness: 0.9,
      metalness: 0.0,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -1.5;
    scene.add(bgMesh);

    // ── Garment Plane ──────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(product.heroImage);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(1.6, 2.1);
    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Particles ──────────────────────────────────────────────────
    const PARTICLE_COUNT = 120;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      velocities[i] = Math.random() * 0.001;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xc8843a,
      size: 0.012,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Raycaster ──────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(mesh);
      if (hits.length > 0 && !isFocusedRef.current) {
        isFocusedRef.current = true;
        targetZRef.current = 1.4;
      }
    };

    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("click", onClick);

    // ── Clock ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    // ── Animation Loop ─────────────────────────────────────────────
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Idle float + wobble
      mesh.position.y = Math.sin(t * 0.6) * 0.04;
      mesh.rotation.y = Math.sin(t * 0.3) * 0.02;

      // Drift particles upward
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posAttr.setY(i, posAttr.getY(i) + 0.003 + velocities[i]);
        posAttr.setX(i, posAttr.getX(i) + Math.sin(t + i) * 0.001);
        if (posAttr.getY(i) > 2) posAttr.setY(i, -2);
      }
      posAttr.needsUpdate = true;

      // Camera lerp toward target Z
      camera.position.z = lerp(camera.position.z, targetZRef.current, 0.05);

      // Show overlay once camera is close enough
      if (isFocusedRef.current && Math.abs(camera.position.z - 1.4) < 0.05) {
        setOverlayVisibleRef.current(true);
      }

      // Hover detection
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(mesh);
      const hovered = hits.length > 0 && !isFocusedRef.current;
      setCursorPointer(hovered);

      // Spotlight intensity lerp
      const targetIntensity = isFocusedRef.current ? 4.5 : hovered ? 3.5 : 2.5;
      spotLight.intensity = lerp(spotLight.intensity, targetIntensity, 0.05);

      // Composite live video elements onto the background plane texture
      videoCtx.fillStyle = '#0e0c0b';
      videoCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
      document.querySelectorAll<HTMLVideoElement>('video[muted]').forEach((vid) => {
        if (vid.readyState >= 2) {
          const opacity = parseFloat(window.getComputedStyle(vid).opacity);
          if (opacity > 0.01) {
            videoCtx.globalAlpha = opacity;
            videoCtx.drawImage(vid, 0, 0, videoCanvas.width, videoCanvas.height);
          }
        }
      });
      videoCtx.globalAlpha = 1;
      videoTexture.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      if (!wrapper) return;
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(wrapper);

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      wrapper.removeEventListener("mousemove", onMouseMove);
      wrapper.removeEventListener("click", onClick);
      renderer.dispose();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      videoTexture.dispose();
      bgGeo.dispose();
      bgMat.dispose();
      if (wrapper.contains(renderer.domElement)) {
        wrapper.removeChild(renderer.domElement);
      }
    };
  }, [product.heroImage]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-[60vh] relative"
      style={{ cursor: cursorPointer ? "pointer" : "default" }}
    >
      {/* Product overlay — fades in after camera fly-in */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none transition-opacity duration-500 ${
          overlayVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto text-center space-y-3 px-6 py-8 bg-[var(--hb-dark)]/70 backdrop-blur-sm border border-[var(--hb-dark-border)] max-w-sm w-full mx-4 relative">
          {/* Dismiss */}
          <button
            onClick={() => {
              isFocusedRef.current = false;
              targetZRef.current = 4.0;
              setOverlayVisible(false);
            }}
            className="absolute top-3 right-4 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors text-lg leading-none"
            style={{ fontFamily: "var(--hb-font-mono)" }}
            aria-label="Dismiss"
          >
            ×
          </button>

          {/* Catalog number */}
          <p
            className="text-xs uppercase tracking-[0.4em]"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
          >
            {catalogNumber}
          </p>

          {/* Name */}
          <p
            className="text-3xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            {product.name}
          </p>

          {/* Price */}
          <p
            className="text-sm"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            ${product.price.toLocaleString()}
          </p>

          {/* CTA */}
          <a
            href={`/product/${product.slug}`}
            className="inline-block mt-2 px-8 py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            View Piece
          </a>
        </div>
      </div>
    </div>
  );
}
