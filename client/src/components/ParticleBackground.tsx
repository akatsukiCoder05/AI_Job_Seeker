import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  color: string;
  baseX: number;
  baseY: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = ["#2563EB", "#3B82F6", "#06B6D4", "#7C3AED", "#60A5FA"];
    const NODE_COUNT = 70;
    const CONNECTION_DIST = 160;
    let nodes: Node[] = [];
    let animId: number;
    let W = 0, H = 0;

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * W;
        const y = Math.random() * H;
        return {
          x, y, baseX: x, baseY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 1.5 + Math.random() * 2.5,
          alpha: 0.4 + Math.random() * 0.6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
      });
    }

    function drawGrid() {
      if (!ctx) return;
      const CELL = 60;
      ctx.strokeStyle = "rgba(37,99,235,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += CELL) {
        ctx.moveTo(x, 0); ctx.lineTo(x, H);
      }
      for (let y = 0; y <= H; y += CELL) {
        ctx.moveTo(0, y); ctx.lineTo(W, y);
      }
      ctx.stroke();
    }

    function drawGradientBlobs(t: number) {
      if (!ctx) return;
      const blobs = [
        { bx: W * 0.2 + Math.sin(t * 0.3) * 80,  by: H * 0.25 + Math.cos(t * 0.2) * 60,  r: 350, c: "37,99,235" },
        { bx: W * 0.75 + Math.cos(t * 0.25) * 70, by: H * 0.5  + Math.sin(t * 0.35) * 80, r: 280, c: "6,182,212" },
        { bx: W * 0.5  + Math.sin(t * 0.2) * 100, by: H * 0.8  + Math.cos(t * 0.3) * 50,  r: 300, c: "124,58,237" },
      ];
      blobs.forEach(({ bx, by, r, c }) => {
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        grad.addColorStop(0, `rgba(${c},0.12)`);
        grad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });
    }

    function render(ts: number) {
      if (!ctx) return;
      const t = ts * 0.001;

      // Background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, W, H);

      drawGrid();
      drawGradientBlobs(t);

      // Parallax offset from mouse
      const mx = (mouseRef.current.x - 0.5) * 30;
      const my = (mouseRef.current.y - 0.5) * 30;

      // Update & draw nodes
      nodes.forEach((node) => {
        // Drift
        node.x += node.vx;
        node.y += node.vy;

        // Parallax
        const px = node.x + mx * (node.r / 4);
        const py = node.y + my * (node.r / 4);

        // Wrap
        if (node.x < -50) node.x = W + 50;
        if (node.x > W + 50) node.x = -50;
        if (node.y < -50) node.y = H + 50;
        if (node.y > H + 50) node.y = -50;

        // Draw node
        ctx.beginPath();
        ctx.arc(px, py, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.color + Math.round(node.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        // Glow ring for bigger nodes
        if (node.r > 3) {
          const pulse = 0.3 + Math.sin(t * 2 + node.r) * 0.2;
          ctx.beginPath();
          ctx.arc(px, py, node.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = node.color + Math.round(pulse * 40).toString(16).padStart(2, "0");
          ctx.fill();
        }
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const ni = nodes[i];
        const pxi = ni.x + mx * (ni.r / 4);
        const pyi = ni.y + my * (ni.r / 4);
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j];
          const pxj = nj.x + mx * (nj.r / 4);
          const pyj = nj.y + my * (nj.r / 4);
          const dx = pxi - pxj;
          const dy = pyi - pyj;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
            // Animated data pulse along line
            const pulse = (t * 0.5) % 1;
            const gradX = pxi + (pxj - pxi) * pulse;
            const gradY = pyi + (pyj - pyi) * pulse;

            ctx.beginPath();
            ctx.moveTo(pxi, pyi);
            ctx.lineTo(pxj, pyj);
            ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Data pulse dot
            if (dist < CONNECTION_DIST * 0.7) {
              ctx.beginPath();
              ctx.arc(gradX, gradY, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(6,182,212,${alpha * 1.5})`;
              ctx.fill();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    resize();
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
};

export default ParticleBackground;
