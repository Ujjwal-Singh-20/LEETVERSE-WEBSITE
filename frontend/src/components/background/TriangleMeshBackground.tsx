import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  origX: number;
  origY: number;
  vx: number;
  vy: number;
}

interface Triangle {
  p1: Point;
  p2: Point;
  p3: Point;
  baseR: number;
  baseG: number;
  baseB: number;
  centroid: { x: number; y: number };
}

export const TriangleMeshBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = {
      x: width * 0.65,
      y: height * 0.45,
      targetX: width * 0.65,
      targetY: height * 0.45,
      radius: 280,
      active: true,
    };

    let points: Point[] = [];
    let triangles: Triangle[] = [];

    const initMesh = () => {
      points = [];
      triangles = [];

      // Cell size tuned to match the triangle scale in the user's reference image
      const cellSize = Math.max(75, Math.min(115, Math.floor(width / 14)));
      const cols = Math.ceil(width / cellSize) + 3;
      const rows = Math.ceil(height / cellSize) + 3;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          // Jitter points to create organic faceted triangles matching the reference photo
          const jitterX = (Math.random() - 0.5) * cellSize * 0.65;
          const jitterY = (Math.random() - 0.5) * cellSize * 0.65;
          const px = c * cellSize + jitterX - cellSize;
          const py = r * cellSize + jitterY - cellSize;

          points.push({
            x: px,
            y: py,
            origX: px,
            origY: py,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
          });
        }
      }

      // Triangulate grid (alternating diagonals for irregular low-poly look)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i1 = r * (cols + 1) + c;
          const i2 = i1 + 1;
          const i3 = (r + 1) * (cols + 1) + c;
          const i4 = i3 + 1;

          // Color palette matching the deep forest green shades in the user's reference image
          // R: 8-16, G: 25-45, B: 18-32
          const getGreenShade = () => {
            const variant = Math.random();
            const r = Math.floor(7 + variant * 10);
            const g = Math.floor(22 + variant * 26);
            const b = Math.floor(14 + variant * 18);
            return { r, g, b };
          };

          const cA = getGreenShade();
          const cB = getGreenShade();

          const alternate = (r + c) % 2 === 0;

          if (alternate) {
            triangles.push({
              p1: points[i1],
              p2: points[i2],
              p3: points[i3],
              baseR: cA.r,
              baseG: cA.g,
              baseB: cA.b,
              centroid: {
                x: (points[i1].x + points[i2].x + points[i3].x) / 3,
                y: (points[i1].y + points[i2].y + points[i3].y) / 3,
              },
            });
            triangles.push({
              p1: points[i2],
              p2: points[i4],
              p3: points[i3],
              baseR: cB.r,
              baseG: cB.g,
              baseB: cB.b,
              centroid: {
                x: (points[i2].x + points[i4].x + points[i3].x) / 3,
                y: (points[i2].y + points[i4].y + points[i3].y) / 3,
              },
            });
          } else {
            triangles.push({
              p1: points[i1],
              p2: points[i2],
              p3: points[i4],
              baseR: cA.r,
              baseG: cA.g,
              baseB: cA.b,
              centroid: {
                x: (points[i1].x + points[i2].x + points[i4].x) / 3,
                y: (points[i1].y + points[i2].y + points[i4].y) / 3,
              },
            });
            triangles.push({
              p1: points[i1],
              p2: points[i4],
              p3: points[i3],
              baseR: cB.r,
              baseG: cB.g,
              baseB: cB.b,
              centroid: {
                x: (points[i1].x + points[i4].x + points[i3].x) / 3,
                y: (points[i1].y + points[i4].y + points[i3].y) / 3,
              },
            });
          }
        }
      }
    };

    initMesh();

    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initMesh();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Smooth cursor interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Base background clear
      ctx.fillStyle = '#060d0a';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient drift of vertices
      for (let p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.x - p.origX) > 6) p.vx *= -1;
        if (Math.abs(p.y - p.origY) > 6) p.vy *= -1;
      }

      // Draw triangles with dynamic cursor illumination
      const numTriangles = triangles.length;
      for (let i = 0; i < numTriangles; i++) {
        const tri = triangles[i];
        tri.centroid.x = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
        tri.centroid.y = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;

        const dist = Math.hypot(tri.centroid.x - mouse.x, tri.centroid.y - mouse.y);
        let illumination = 0;

        if (dist < mouse.radius) {
          // Smooth bell falloff
          illumination = Math.pow(1 - dist / mouse.radius, 1.8);
        }

        // Color boost when illuminated: shifts towards bright mint/emerald green
        const r = Math.min(255, Math.floor(tri.baseR + illumination * 45));
        const g = Math.min(255, Math.floor(tri.baseG + illumination * 95));
        const b = Math.min(255, Math.floor(tri.baseB + illumination * 65));

        ctx.beginPath();
        ctx.moveTo(tri.p1.x, tri.p1.y);
        ctx.lineTo(tri.p2.x, tri.p2.y);
        ctx.lineTo(tri.p3.x, tri.p3.y);
        ctx.closePath();

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();

        // Dark wireframe edges matching the reference image
        if (illumination > 0.05) {
          ctx.strokeStyle = `rgba(61, 255, 160, ${0.12 + illumination * 0.35})`;
          ctx.lineWidth = 0.9;
        } else {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      }

      // Draw the glowing cursor dot exactly as seen in the user's reference image
      if (mouse.active) {
        // Outer soft glow
        const glowGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 30
        );
        glowGradient.addColorStop(0, 'rgba(61, 255, 160, 0.45)');
        glowGradient.addColorStop(0.5, 'rgba(61, 255, 160, 0.15)');
        glowGradient.addColorStop(1, 'rgba(61, 255, 160, 0)');

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Inner glowing bead (semi-transparent soft white/mint circle from the screenshot)
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#d4fcef';
        ctx.shadowColor = '#3dffa0';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
};
