'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

interface KanjiCanvasProps {
  kanji?: string;
  className?: string;
  color?: string; // RGB triple e.g. "154, 122, 90"
  sampleStep?: number; // pixel sampling density (lower = more particles)
}

export function KanjiCanvas({
  kanji = '花火',
  className = '',
  color = '154, 122, 90',
  sampleStep = 5,
}: KanjiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    if (W === 0 || H === 0) return;

    // 1. Render kanji to offscreen canvas to sample pixel positions
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const offCtx = offscreen.getContext('2d')!;
    offCtx.fillStyle = 'white';
    offCtx.font = `${Math.min(W, H) * 0.72}px serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(kanji, W / 2, H / 2);

    const imageData = offCtx.getImageData(0, 0, W, H);
    const pixels = imageData.data;
    const targets: { x: number; y: number }[] = [];

    for (let y = 0; y < H; y += sampleStep) {
      for (let x = 0; x < W; x += sampleStep) {
        const idx = (y * W + x) * 4;
        if (pixels[idx] > 128) {
          targets.push({ x, y });
        }
      }
    }

    if (targets.length === 0) return;

    // 2. Create particles starting from random scattered positions
    const particles: Particle[] = targets.map((t) => ({
      x: Math.random() * W,
      y: Math.random() * H + H * 0.2,
      tx: t.x,
      ty: t.y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.25 + 0.08,
      size: Math.random() * 1.2 + 0.5,
    }));

    // 3. Animate spring toward targets, then gentle drift
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.5) {
          // Spring toward target
          p.vx += dx * 0.035;
          p.vy += dy * 0.035;
          p.vx *= 0.87;
          p.vy *= 0.87;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Settled — add slow organic drift (like embers floating)
          p.x = p.tx + Math.sin(frame * 0.008 + p.tx * 0.05) * 1.2;
          p.y = p.ty + Math.cos(frame * 0.011 + p.ty * 0.05) * 0.8;
        }

        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      frame++;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [kanji, color, sampleStep]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
