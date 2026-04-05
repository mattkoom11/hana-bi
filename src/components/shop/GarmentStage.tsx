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
      renderer.dispose();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (wrapper.contains(renderer.domElement)) {
        wrapper.removeChild(renderer.domElement);
      }
    };
  }, [product.heroImage]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-[60vh] relative"
      style={{ cursor: "default" }}
    />
  );
}
