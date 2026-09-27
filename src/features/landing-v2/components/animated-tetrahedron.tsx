
import { useEffect, useRef } from "react";

export function AnimatedTetrahedron() {
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
    let scale = 0;

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
      scale = Math.min(width, height) * 0.7;
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

    // Tetrahedron vertices
    const vertices = [
      { x: 0, y: 1, z: 0 },
      { x: -0.943, y: -0.333, z: -0.5 },
      { x: 0.943, y: -0.333, z: -0.5 },
      { x: 0, y: -0.333, z: 1 },
    ];

    const edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [2, 3], [3, 1],
    ];

    const faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2],
    ];

    const rotateY = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
      y: point.y,
      z: point.x * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateX = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x,
      y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
      z: point.y * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateZ = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
      y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
      z: point.z,
    });

    const points: { x: number; y: number; z: number; char: string }[] = [];

    const render = () => {
      if (!isVisible) {
        frameRef.current = 0;
        return;
      }

      if (width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);
        points.length = 0;

        edges.forEach(([i, j]) => {
          const v1 = vertices[i];
          const v2 = vertices[j];

          for (let t = 0; t <= 1; t += 0.05) {
            let point = {
              x: v1.x + (v2.x - v1.x) * t,
              y: v1.y + (v2.y - v1.y) * t,
              z: v1.z + (v2.z - v1.z) * t,
            };

            point = rotateY(point, time * 0.4);
            point = rotateX(point, time * 0.3);
            point = rotateZ(point, time * 0.2);

            const depth = (point.z + 1.5) / 3;
            const charIndex = Math.floor(depth * (chars.length - 1));

            points.push({
              x: centerX + point.x * scale,
              y: centerY - point.y * scale,
              z: point.z,
              char: chars[Math.min(charIndex, chars.length - 1)],
            });
          }
        });

        faces.forEach(([i, j, k]) => {
          const v1 = vertices[i];
          const v2 = vertices[j];
          const v3 = vertices[k];

          for (let u = 0; u <= 1; u += 0.12) {
            for (let v = 0; v <= 1 - u; v += 0.12) {
              const w = 1 - u - v;
              let point = {
                x: v1.x * u + v2.x * v + v3.x * w,
                y: v1.y * u + v2.y * v + v3.y * w,
                z: v1.z * u + v2.z * v + v3.z * w,
              };

              point = rotateY(point, time * 0.4);
              point = rotateX(point, time * 0.3);
              point = rotateZ(point, time * 0.2);

              const depth = (point.z + 1.5) / 3;
              const charIndex = Math.floor(depth * (chars.length - 1));

              points.push({
                x: centerX + point.x * scale,
                y: centerY - point.y * scale,
                z: point.z,
                char: chars[Math.min(charIndex, chars.length - 1)],
              });
            }
          }
        });

        points.sort((a, b) => a.z - b.z);

        ctx.font = "18px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const alpha = 0.45 + (point.z + 1.5) * 0.25;
          ctx.fillStyle = `rgba(${fgR}, ${fgG}, ${fgB}, ${Math.min(alpha, 1)})`;
          ctx.fillText(point.char, point.x, point.y);
        }
      }

      time += 0.015;
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
