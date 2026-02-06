'use client';

import { useEffect, useRef } from 'react';
import { themes } from '@/lib/theme';
import { Theme } from '@/types';

export default function AmbientCanvas({ theme }: { theme: Theme }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const time = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const gl = c.getContext('2d');
    if (!gl) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W: number, H: number;

    const resize = () => {
      W = innerWidth;
      H = innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
      gl.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    const t = themes[theme];

    const orbs = Array.from({ length: 3 }, (_, i) => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.3 + Math.random() * 0.4,
      r: 0.15 + Math.random() * 0.2,
      speedX: 0.0001 + Math.random() * 0.0003,
      speedY: 0.00015 + Math.random() * 0.0002,
      phase: i * 2.1,
      color: i === 0 ? t.pColor1 : i === 1 ? t.pColor2 : t.pColor3,
    }));

    const draw = () => {
      time.current += 1;
      const T = time.current;
      gl.clearRect(0, 0, W, H);

      for (const orb of orbs) {
        const x = W * (orb.x + Math.sin(T * orb.speedX + orb.phase) * 0.08);
        const y = H * (orb.y + Math.cos(T * orb.speedY + orb.phase) * 0.06);
        const r = Math.min(W, H) * orb.r;
        const grad = gl.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${orb.color.join(',')},0.04)`);
        grad.addColorStop(0.5, `rgba(${orb.color.join(',')},0.015)`);
        grad.addColorStop(1, `rgba(${orb.color.join(',')},0)`);
        gl.beginPath();
        gl.arc(x, y, r, 0, Math.PI * 2);
        gl.fillStyle = grad;
        gl.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      removeEventListener('resize', resize);
    };
  }, [theme]);

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
}
