"use client";
import React, { useEffect, useRef } from "react";
// Avoid importing p5 types directly due to package export/typing issues; use `any` where needed.

// Small helper to read CSS variable with fallback
function getCssVar(name: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
}

type VisualizationCanvasProps = {
  dataSource?: string;
  data?: any;
  className?: string;
};

export default function VisualizationCanvas({ data, className = "" }: VisualizationCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const paramsRef = useRef({
    particleCount: 120,
    speed: 0.3,
    hueShift: 0,
  });

  // Smoothly interpolate params when `data` changes.
  useEffect(() => {
    if (!data) return;

    // Example: if data has intensity, map it to speed and hue
    const intensity = typeof data.intensity === "number" ? Math.max(0, Math.min(1, data.intensity)) : 0;
    const target = {
      particleCount: 80 + Math.round(intensity * 240),
      speed: 0.05 + intensity * 0.6,
      hueShift: intensity * 90,
    };

    // animate params over 1s
    const start = Date.now();
    const duration = 1000;
    const from = { ...paramsRef.current };

    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
      paramsRef.current.particleCount = Math.round(from.particleCount + (target.particleCount - from.particleCount) * ease);
      paramsRef.current.speed = from.speed + (target.speed - from.speed) * ease;
      paramsRef.current.hueShift = from.hueShift + (target.hueShift - from.hueShift) * ease;
      raf = requestAnimationFrame(t < 1 ? step : () => {});
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [data]);

  useEffect(() => {
      // Dynamically import p5 inside useEffect
      let P5Lib: any;
    // @ts-ignore - p5 typings can be problematic via package exports; treat as any here
    import("p5").then((p5Module) => {
        P5Lib = p5Module.default || p5Module;

      const container = containerRef.current;
      if (!container || !P5Lib) return;

      // create p5 sketch
      const sketch = (s: any) => {
        let canvas: any;
        let particles: any[] = [];
        let width = 0;
        let height = 0;
        let palette: string[] = [];

        function updatePalette() {
          const bg = getCssVar("--background", "#ffffff").trim();
          const isDark = bg && (bg === "#0a0a0a" || bg === "#000" || bg === "#0a0a0a");

          if (isDark) {
            palette = ["#0f172a", "#312e81", "#4c1d95", "#7c3aed", "#c7b8ff"];
          } else {
            palette = ["#f8fafc", "#e6eef8", "#d6f5ea", "#fff1f6", "#fef3c7"].map((c) => c);
          }
        }

        class Particle {
          x: number = 0;
          y: number = 0;
          r: number = 1;
          angle: number = 0;
          orbitRadius: number = 0;
          speed: number = 0.1;
          color: string = "#ffffff";
          alpha: number = 0;

          constructor() {
            this.reset(true);
          }

          reset(initial = false) {
            const cx = width / 2;
            const cy = height / 2;
            this.orbitRadius = s.random(s.min(width, height) * (0.02 + s.random(0.45)));
            this.angle = s.random(s.TWO_PI);
            this.r = s.random(0.6, 3.0);
            this.speed = s.random(0.1, 0.5) * (paramsRef.current.speed || 0.3);
            this.x = cx + s.cos(this.angle) * this.orbitRadius;
            this.y = cy + s.sin(this.angle) * this.orbitRadius;
            this.color = palette[s.floor(s.random(palette.length))];
            this.alpha = initial ? 0 : 0.7;
          }

          step() {
            this.angle += this.speed * 0.01;
            const cx = width / 2;
            const cy = height / 2;
            const ox = s.cos(this.angle) * this.orbitRadius;
            const oy = s.sin(this.angle) * this.orbitRadius;
            this.x += (cx + ox - this.x) * 0.02;
            this.y += (cy + oy - this.y) * 0.02;
            this.alpha = s.min(0.9, this.alpha + 0.005);
          }

          render() {
            s.noStroke();
             // use p5 color object and set alpha safely
             try {
               const col = s.color(this.color);
               col.setAlpha(Math.floor(this.alpha * 255));
               s.fill(col);
             } catch (e) {
               // fallback to white with alpha
               s.fill(255, 255, 255, Math.floor(this.alpha * 255));
             }
            s.circle(this.x, this.y, this.r * 2 + s.sin(this.angle * 3) * 0.6);
          }
        }

        s.setup = () => {
          width = container.clientWidth;
          height = container.clientHeight;
          canvas = s.createCanvas(width, height, s.P2D);
          canvas.parent(container);
          s.clear();
          updatePalette();
          particles = [];
          const count = paramsRef.current.particleCount || 120;
          for (let i = 0; i < count; i++) particles.push(new Particle());
        };

        s.windowResized = () => {
          width = container.clientWidth;
          height = container.clientHeight;
          s.resizeCanvas(width, height);
        };

        s.draw = () => {
          s.noStroke();
          const bg = getCssVar("--background", "#ffffff").trim();
           // draw translucent rect to create motion trails using a safe color object
           try {
             const bgCol = s.color(bg);
             bgCol.setAlpha(34); // approx 0x22
             s.fill(bgCol);
           } catch (err) {
             // fallback to white with low alpha
             s.fill(255, 255, 255, 34);
           }
          s.rect(0, 0, width, height);

          updatePalette();

          const targetCount = paramsRef.current.particleCount || 120;
          while (particles.length < targetCount) particles.push(new Particle());
          while (particles.length > targetCount) particles.pop();

          s.blendMode(s.ADD);
          for (const p of particles) {
            p.speed *= 0.995;
            p.speed += (paramsRef.current.speed * (0.8 + s.sin(s.frameCount * 0.01 + p.angle) * 0.2) - p.speed) * 0.02;
            p.step();
            p.render();
          }
          s.blendMode(s.BLEND);
        };
      };

      p5InstanceRef.current = new P5Lib(sketch, container);

      // react to resize of container
      const ro = new ResizeObserver(() => {
        if (p5InstanceRef.current && (p5InstanceRef.current as any).windowResized) {
          setTimeout(() => (p5InstanceRef.current as any).windowResized(), 50);
        }
      });
      ro.observe(container);

      // Cleanup
      return () => {
        ro.disconnect();
        if (p5InstanceRef.current) {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        }
      };
    });
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height: "100%", position: "relative" }} />
  );
}