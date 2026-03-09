"use client";

import { useRef, useEffect } from "react";

interface GlitterParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  opacitySpeed: number;
  color: string;
  shape: "circle" | "diamond" | "star";
}

interface GlitterBombProps {
  /** Number of glitter particles */
  density?: number;
  /** Speed multiplier (1 = normal, 2 = double speed drift) */
  speed?: number;
  /** Whether glitter is active */
  active?: boolean;
}

const GLITTER_COLORS = [
  "#FFD700", // Gold
  "#FFC125", // Deep gold
  "#FFE4B5", // Light gold
  "#FF69B4", // Hot pink
  "#FF1493", // Deep pink
  "#C0C0C0", // Silver
  "#E8E8E8", // Light silver
  "#00CED1", // Dark turquoise
  "#7B68EE", // Medium slate blue
  "#DA70D6", // Orchid
  "#F0E68C", // Khaki gold
  "#FFDAB9", // Peach
  "#B0E0E6", // Powder blue
  "#DDA0DD", // Plum
  "#FFB6C1", // Light pink
];

function createParticle(canvasWidth: number, canvasHeight: number): GlitterParticle {
  const shapes: GlitterParticle["shape"][] = ["circle", "diamond", "star"];
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight - canvasHeight, // Start above the screen
    size: 1 + Math.random() * 4,
    speedX: (Math.random() - 0.5) * 1.5,
    speedY: 0.3 + Math.random() * 1.2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    opacity: 0.4 + Math.random() * 0.6,
    opacitySpeed: 0.005 + Math.random() * 0.02,
    color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  };
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
) {
  const spikes = 4;
  const outerRadius = size;
  const innerRadius = size * 0.4;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export const GlitterBomb: React.FC<GlitterBombProps> = ({
  density = 120,
  speed = 1,
  active = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<GlitterParticle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles spread across the entire viewport
    particlesRef.current = [];
    for (let i = 0; i < density; i++) {
      const p = createParticle(canvas.width, canvas.height);
      // Spread initial particles across the whole screen (not just above)
      p.y = Math.random() * canvas.height;
      particlesRef.current.push(p);
    }

    let time = 0;

    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position with gentle drift
        p.x += p.speedX * speed + Math.sin(time * 2 + i) * 0.3;
        p.y += p.speedY * speed;
        p.rotation += p.rotationSpeed;

        // Twinkle effect — oscillate opacity
        p.opacity += p.opacitySpeed;
        if (p.opacity >= 1 || p.opacity <= 0.2) {
          p.opacitySpeed = -p.opacitySpeed;
        }

        // Recycle particles that go off screen
        if (p.y > canvas.height + 10 || p.x < -20 || p.x > canvas.width + 20) {
          particles[i] = createParticle(canvas.width, canvas.height);
          particles[i].y = -10 - Math.random() * 50;
        }

        // Draw the glitter particle
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Add a shimmer highlight
        const shimmerPhase = Math.sin(time * 5 + i * 0.7);
        if (shimmerPhase > 0.7) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8 + shimmerPhase * 6;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        switch (p.shape) {
          case "star":
            drawStar(ctx, p.x, p.y, p.size, p.rotation);
            break;
          case "diamond":
            drawDiamond(ctx, p.x, p.y, p.size, p.rotation);
            break;
          case "circle":
          default:
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, density, speed]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  );
};
