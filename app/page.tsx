'use client';

import { useEffect, useMemo, useRef } from 'react';
import Lenis from 'lenis';

const FRAME_COUNT = 270;
const FRAME_DIGITS = 3;

// Helper to format frame numbers (1 -> 001)
function padLeft(num: number, digits: number) {
  return String(num).padStart(digits, '0');
}

export default function HeroFramesWheel() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const paths = useMemo(() => {
    const getSrc = (frameIndex: number) => {
      return `/frames/ezgif-frame-${padLeft(frameIndex + 1, FRAME_DIGITS)}.jpg`;
    };
    return { getSrc };
  }, []);

  useEffect(() => {
    const heroEl = heroRef.current;
    const canvas = canvasRef.current;
    if (!heroEl || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // 1. Initialize Lenis (Buttery smooth scrolling)
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let destroyed = false;

    // 2. Setup Memory Arrays
    const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    const frameReady: boolean[] = new Array(FRAME_COUNT).fill(false);
    const requested: boolean[] = new Array(FRAME_COUNT).fill(false);

    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

    // 3. Smart Preloader
    const loadFrame = (idx: number) => {
      if (requested[idx] || idx < 0 || idx >= FRAME_COUNT) return;
      requested[idx] = true;

      const img = new Image();
      img.decoding = 'async'; // Prevents decoding from freezing the scroll
      img.src = paths.getSrc(idx);
      frames[idx] = img;

      const markReady = () => {
        if (destroyed) return;
        frameReady[idx] = true;
        // Draw first available frame immediately to avoid any initial black flash.
        if (idx === 0) {
          drawCover(img);
        }
      };

      img.onload = markReady;
      // Fallback for async decode if supported
      img.decode?.().then(markReady).catch(() => {});
    };

    // Preload frames in a specific radius around the user's scroll position
    const preloadWindow = (center: number, radius: number) => {
      for (let d = -radius; d <= radius; d++) {
        const raw = center + d;
        if (raw >= 0 && raw < FRAME_COUNT) {
          loadFrame(raw);
        }
      }
    };

    // Load first chunk immediately
    preloadWindow(0, 12);
    for (let i = 0; i < Math.min(FRAME_COUNT, 60); i++) loadFrame(i);

    // Load the rest silently in the background when the browser is idle
    const scheduleBackgroundPreload = () => {
      const run = () => {
        if (destroyed) return;
        for (let i = 0; i < FRAME_COUNT; i++) loadFrame(i);
      };
      // Type-safe check for requestIdleCallback
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(run, { timeout: 1500 });
      } else {
        setTimeout(run, 250);
      }
    };
    scheduleBackgroundPreload();

    // 4. Handle High-DPI Displays (Retina screens)
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const needsRedrawRef = { current: true };
    resize();
    
    const ro = new ResizeObserver(() => {
      resize();
      needsRedrawRef.current = true;
    });
    ro.observe(canvas);

    // 5. Canvas Drawing Math (Acts like object-fit: cover)
    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;

      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;

      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const lastFrameRef = { current: -1 };

    // Fallback logic: If the requested frame isn't loaded yet, find the closest one that is
    const findNearestReady = (idx: number, radius: number) => {
      if (frameReady[idx]) return idx;
      for (let d = 1; d <= radius; d++) {
        const left = Math.max(0, idx - d);
        const right = Math.min(FRAME_COUNT - 1, idx + d);
        if (frameReady[left]) return left;
        if (frameReady[right]) return right;
      }
      return -1;
    };

    // 6. The Core Render Loop
    let rafId = 0;
    const tick = (time: number) => {
      if (destroyed) return;

      // Let Lenis process the current scroll momentum
      lenis.raf(time);

      const start = heroEl.offsetTop;
      const end = start + heroEl.offsetHeight - window.innerHeight;
      const denom = Math.max(1, end - start);

      // Grab the exact scroll integer from Lenis
      const scrollY = lenis.scroll ?? window.scrollY ?? 0;
      const t = clamp01((scrollY - start) / denom);

      const frameFloat = t * (FRAME_COUNT - 1);
      const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(frameFloat)));

      // Keep preloading slightly ahead of the scroll direction
      preloadWindow(idx, 18);

      // Parallax: only scale/rotate, no vertical translate so the frame stays
      // pinned to the bottom edge without drifting up and exposing a gap.
      if (canvasWrapRef.current) {
        const scale = 1.10 - t * 0.04;
        const rotate = (t - 0.5) * -1.0;
        canvasWrapRef.current.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
      }

      const drawIdx = findNearestReady(idx, 24);
      if (
        drawIdx !== -1 &&
        (drawIdx !== lastFrameRef.current || needsRedrawRef.current)
      ) {
        lastFrameRef.current = drawIdx;
        drawCover(frames[drawIdx]!);
        needsRedrawRef.current = false;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // 7. Cleanup
    return () => {
      destroyed = true;
      lenis.destroy();
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [paths]);

  return (
    <main className="relative w-full bg-black text-white">
      {/* Hero: Lenis-smooth, scroll-synced canvas animation */}
      <section
        ref={heroRef}
        className="relative h-[400vh] w-full bg-black"
      >
        <div className="sticky top-0 z-10 h-screen w-full overflow-hidden">
          <div ref={canvasWrapRef} className="absolute inset-0 will-change-transform">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            {/* Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(255,255,255,0.10),transparent_60%)]" />
          </div>

          <div className="relative z-10 flex h-full items-center justify-center px-6 text-center pointer-events-none">
            <div className="max-w-3xl">
              <h1 className="text-white text-5xl md:text-7xl font-bold drop-shadow-lg tracking-tight">
                SCROLL TO BUILD
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Visible content sections after hero */}
      {/* -mt-px prevents a 1px seam caused by sub-pixel rounding between sticky hero and this section */}
      <section className="relative -mt-px min-h-screen w-full bg-zinc-900 flex flex-col items-center justify-center">
        <div className="max-w-4xl px-8 text-center">
          <h2 className="text-white text-4xl md:text-6xl font-bold mb-6">Next Section</h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            This section becomes visible once you scroll through the hero animation.
          </p>
        </div>
      </section>

      <section className="relative min-h-screen w-full bg-zinc-800 flex flex-col items-center justify-center">
        <div className="max-w-4xl px-8 text-center">
          <h2 className="text-white text-4xl md:text-6xl font-bold mb-6">More Content</h2>
          <p className="text-zinc-300 text-lg md:text-xl leading-relaxed">
            Add your services, projects, or any other sections here. Lenis keeps the scroll smooth across the whole page.
          </p>
        </div>
      </section>
    </main>
  );
}