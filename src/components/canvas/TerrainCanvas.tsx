'use client';

import { useEffect, useRef } from 'react';
import { themes } from '@/lib/theme';
import { Theme } from '@/types';

interface Props {
  theme: Theme;
}

export default function TerrainCanvas({ theme }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 });
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

    const mv = (e: MouseEvent | TouchEvent) => {
      const ev = 'touches' in e ? e.touches[0] : e;
      mouse.current.sx = ev.clientX / innerWidth;
      mouse.current.sy = ev.clientY / innerHeight;
    };
    addEventListener('mousemove', mv);
    addEventListener('touchmove', mv as EventListener);

    const t = themes[theme];
    const camHeight = 280;
    const camDist = 500;
    const fov = 600;
    const tiltX = -0.65;

    const project = (x3: number, y3: number, z3: number) => {
      const cy = Math.cos(tiltX), sy = Math.sin(tiltX);
      const ry = y3 * cy - z3 * sy;
      const rz = y3 * sy + z3 * cy;
      const tz = rz + camDist;
      if (tz < 10) return null;
      const scale = fov / tz;
      return {
        x: W * 0.5 + x3 * scale,
        y: H * 0.5 - (ry + camHeight) * scale + H * 0.15,
        s: scale,
        z: tz,
      };
    };

    const draw = () => {
      time.current += 0.005;
      const T = time.current;
      mouse.current.x += (mouse.current.sx - mouse.current.x) * 0.04;
      mouse.current.y += (mouse.current.sy - mouse.current.y) * 0.04;
      const mx = (mouse.current.x - 0.5) * 2;
      const my = (mouse.current.y - 0.5) * 2;
      W = innerWidth;
      H = innerHeight;
      gl.clearRect(0, 0, W, H);

      const cols = 90;
      const rows = 70;
      const spread = 18;
      const depthSpread = 14;
      const startX = -(cols * spread) / 2;
      const startZ = -200;

      const points: Array<{ x: number; y: number; s: number; z: number; norm: number }> = [];

      for (let r = 0; r < rows; r++) {
        for (let ci = 0; ci < cols; ci++) {
          const x3 = startX + ci * spread;
          const z3 = startZ + r * depthSpread;
          const nx = x3 / (cols * spread * 0.5);
          const nz = z3 / (rows * depthSpread * 0.5);

          const w1 = Math.sin(nx * 3.0 + T * 1.2) * Math.cos(nz * 2.5 + T * 0.7) * 45;
          const w2 = Math.sin((nx + nz) * 2.0 - T * 0.8) * 25;
          const w3 = Math.cos(Math.sqrt(nx * nx + nz * nz) * 4.0 - T * 1.4) * 20;
          const w4 = Math.sin(nx * 5.0 - T * 1.8) * Math.cos(nz * 4.0 + T * 1.0) * 12;

          const mdx = nx - mx;
          const mdz = nz - my;
          const md = Math.sqrt(mdx * mdx + mdz * mdz);
          const mw = Math.exp(-md * 2.0) * Math.sin(md * 8.0 - T * 4.0) * 35;

          const y3 = w1 + w2 + w3 + w4 + mw;
          const norm = Math.max(0, Math.min(1, (y3 + 100) / 200));

          const proj = project(x3, y3, z3);
          if (!proj) continue;
          if (proj.x < -50 || proj.x > W + 50 || proj.y < -50 || proj.y > H + 50) continue;

          points.push({ ...proj, norm });
        }
      }

      points.sort((a, b) => b.z - a.z);

      for (const p of points) {
        const baseSize = 1.2 + p.norm * 2.2;
        const size = baseSize * p.s * 0.9;
        if (size < 0.3) continue;

        const blend = p.norm;
        const r = t.pColor1[0] + (t.pColor2[0] - t.pColor1[0]) * blend + (t.pColor3[0] - t.pColor2[0]) * Math.max(0, blend - 0.5) * 2;
        const g = t.pColor1[1] + (t.pColor2[1] - t.pColor1[1]) * blend + (t.pColor3[1] - t.pColor2[1]) * Math.max(0, blend - 0.5) * 2;
        const b = t.pColor1[2] + (t.pColor2[2] - t.pColor1[2]) * blend + (t.pColor3[2] - t.pColor2[2]) * Math.max(0, blend - 0.5) * 2;

        const distFade = Math.max(0.2, 1 - p.z / 1200);
        const alpha = (t.pBase + p.norm * (t.pPeak - t.pBase)) * distFade;

        if (p.norm > 0.55 && size > 1.5) {
          const glowR = size * 3;
          const grad = gl.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${(alpha * 0.25).toFixed(3)})`);
          grad.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0)`);
          gl.beginPath();
          gl.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          gl.fillStyle = grad;
          gl.fill();
        }

        gl.beginPath();
        gl.arc(p.x, p.y, Math.max(0.4, size), 0, Math.PI * 2);
        gl.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`;
        gl.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      removeEventListener('resize', resize);
      removeEventListener('mousemove', mv);
      removeEventListener('touchmove', mv as EventListener);
    };
  }, [theme]);

  return <canvas ref={ref} style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, zIndex: 0 }} />;
}
