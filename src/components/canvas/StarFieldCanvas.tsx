'use client';

import { useEffect, useRef } from 'react';
import { themes } from '@/lib/theme';
import { Theme } from '@/types';

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  speed: number;
  connections: number[];
}

export default function StarFieldCanvas({ theme }: { theme: Theme }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const time = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const inited = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const gl = c.getContext('2d');
    if (!gl) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W: number, H: number;

    const initStars = () => {
      const count = Math.floor((W * H) / 12000);
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.5 + Math.random() * 1.8,
          a: 0.15 + Math.random() * 0.5,
          speed: 0.02 + Math.random() * 0.06,
          connections: [],
        });
      }
      const maxDist = Math.min(W, H) * 0.15;
      for (let i = 0; i < stars.length; i++) {
        const dists: { idx: number; d: number }[] = [];
        for (let j = 0; j < stars.length; j++) {
          if (i === j) continue;
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) dists.push({ idx: j, d });
        }
        dists.sort((a, b) => a.d - b.d);
        stars[i].connections = dists.slice(0, 2 + Math.floor(Math.random() * 2)).map(v => v.idx);
      }
      starsRef.current = stars;
    };

    const resize = () => {
      W = innerWidth;
      H = innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
      gl.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!inited.current) {
        initStars();
        inited.current = true;
      }
    };
    resize();
    addEventListener('resize', resize);

    const t = themes[theme];
    const cx = () => W * 0.5;
    const cy = () => H * 0.5;

    const draw = () => {
      time.current += 0.0008;
      const T = time.current;
      gl.clearRect(0, 0, W, H);
      const stars = starsRef.current;
      const cosT = Math.cos(T);
      const sinT = Math.sin(T);

      const projected = stars.map(s => {
        const dx = s.x - cx();
        const dy = s.y - cy();
        const rx = dx * cosT - dy * sinT + cx();
        const ry = dx * sinT + dy * cosT + cy();
        const twinkle = 0.5 + 0.5 * Math.sin(T * 400 * s.speed + s.x);
        return { x: rx, y: ry, r: s.r, a: s.a * twinkle, connections: s.connections };
      });

      const drawnLines = new Set<string>();
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        for (const j of p.connections) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (drawnLines.has(key)) continue;
          drawnLines.add(key);
          const q = projected[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const lineA = Math.max(0, 0.06 * (1 - d / (Math.min(W, H) * 0.18)));
          if (lineA <= 0) continue;
          gl.beginPath();
          gl.moveTo(p.x, p.y);
          gl.lineTo(q.x, q.y);
          gl.strokeStyle = `rgba(${t.pColor1.join(',')},${lineA.toFixed(3)})`;
          gl.lineWidth = 0.4;
          gl.stroke();
        }
      }

      for (const p of projected) {
        if (p.r > 1.2) {
          const grad = gl.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          grad.addColorStop(0, `rgba(${t.pColor1.join(',')},${(p.a * 0.12).toFixed(3)})`);
          grad.addColorStop(1, `rgba(${t.pColor1.join(',')},0)`);
          gl.beginPath();
          gl.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          gl.fillStyle = grad;
          gl.fill();
        }
        gl.beginPath();
        gl.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        gl.fillStyle = `rgba(${t.pColor1.join(',')},${p.a.toFixed(3)})`;
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
