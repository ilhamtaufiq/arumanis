
import { useEffect, useRef } from "react";

export function AnimatedSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";
    let time = 0;
    let isVisible = true;

    const [fgR, fgG, fgB] = [255, 85, 0];
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let radius = 0;

    const updateSize = (w: number, h: number) => {
      if (!w || !h) return;
      width = w;
      height = h;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width / 2;
      centerY = height / 2;
      radius = Math.min(width, height) * 0.525;
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        updateSize(entry.contentRect.width, entry.contentRect.height);
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

    const points: { x: number; y: number; z: number; char: string }[] = [];

    const render = () => {
      if (!isVisible) {
        frameRef.current = 0;
        return;
      }

      if (width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);
        points.length = 0;

        for (let phi = 0; phi < Math.PI * 2; phi += 0.15) {
          for (let theta = 0; theta < Math.PI; theta += 0.15) {
            const x = Math.sin(theta) * Math.cos(phi + time * 0.5);
            const y = Math.sin(theta) * Math.sin(phi + time * 0.5);
            const z = Math.cos(theta);

            const rotY = time * 0.3;
            const newX = x * Math.cos(rotY) - z * Math.sin(rotY);
            const newZ = x * Math.sin(rotY) + z * Math.cos(rotY);

            const rotX = time * 0.2;
            const newY = y * Math.cos(rotX) - newZ * Math.sin(rotX);
            const finalZ = y * Math.sin(rotX) + newZ * Math.cos(rotX);

            const depth = (finalZ + 1) / 2;
            const charIndex = Math.floor(depth * (chars.length - 1));

            points.push({
              x: centerX + newX * radius,
              y: centerY + newY * radius,
              z: finalZ,
              char: chars[charIndex],
            });
          }
        }

        points.sort((a, b) => a.z - b.z);

        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const alpha = 0.45 + (point.z + 1) * 0.25;
          ctx.fillStyle = `rgba(${fgR}, ${fgG}, ${fgB}, ${alpha})`;
          ctx.fillText(point.char, point.x, point.y);
        }
      }

      time += 0.02;
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
      className="w-full h-full text-primary"
      style={{ display: "block" }}
    />
  );
}
