
import { useEffect, useRef } from "react";
import { getPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function AnimatedWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "·∘○◯◌●◉";
    let time = 0;
    let isVisible = true;
    const reduceMotion = getPrefersReducedMotion();

    const [fgR, fgG, fgB] = [255, 85, 0];
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    const updateSize = (w: number, h: number) => {
      if (!w || !h) return;
      width = w;
      height = h;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(width / 20);
      rows = Math.floor(height / 20);
    };

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        updateSize(entry.contentRect.width, entry.contentRect.height);
        // Static frame: no animation loop under reduced motion, so redraw on resize
        if (reduceMotion) render();
      }
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !frameRef.current) {
          render();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const render = () => {
      if (!isVisible) {
        frameRef.current = 0;
        return;
      }

      if (width > 0 && height > 0 && cols > 0 && rows > 0) {
        ctx.clearRect(0, 0, width, height);

        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const px = (x + 0.5) * (width / cols);
            const py = (y + 0.5) * (height / rows);

            const wave1 = Math.sin(x * 0.2 + time * 2) * Math.cos(y * 0.15 + time);
            const wave2 = Math.sin((x + y) * 0.1 + time * 1.5);
            const wave3 = Math.cos(x * 0.1 - y * 0.1 + time * 0.8);

            const combined = (wave1 + wave2 + wave3) / 3;
            const normalized = (combined + 1) / 2;

            const charIndex = Math.floor(normalized * (chars.length - 1));
            const alpha = 0.15 + normalized * 0.5;

            ctx.fillStyle = `rgba(${fgR}, ${fgG}, ${fgB}, ${alpha})`;
            ctx.fillText(chars[charIndex], px, py);
          }
        }
      }

      time += 0.03;
      if (reduceMotion) {
        frameRef.current = 0;
        return;
      }
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-full h-full text-primary"
      style={{ display: "block" }}
    />
  );
}
