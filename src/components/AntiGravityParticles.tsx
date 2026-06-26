import React, { useEffect, useRef } from 'react';

const AntiGravityParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    setCanvasSize();

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Just draw a static minimal gradient or nothing if reduced motion is preferred
      return;
    }

    // Mouse tracking for parallax
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', setCanvasSize);

    // Particle System
    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      speedY: number;
      speedX: number;
      opacity: number;
      targetOpacity: number;
      type: 'star' | 'bokeh' | 'dust';
      color: string;
      phase: number; // For sine wave oscillation
      depth: number; // Parallax depth modifier

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.baseX = this.x;
        this.baseY = this.y;
        this.phase = Math.random() * Math.PI * 2;
        
        const rand = Math.random();
        if (rand < 0.2) {
          this.type = 'bokeh';
          this.size = Math.random() * 4 + 3;
          this.speedY = Math.random() * -0.5 - 0.2;
          this.depth = 1.5;
          this.targetOpacity = Math.random() * 0.3 + 0.1;
        } else if (rand < 0.5) {
          this.type = 'star';
          this.size = Math.random() * 1.5 + 0.5;
          this.speedY = Math.random() * -0.2 - 0.1;
          this.depth = 0.5;
          this.targetOpacity = Math.random() * 0.6 + 0.2;
        } else {
          this.type = 'dust';
          this.size = Math.random() * 0.8 + 0.2;
          this.speedY = Math.random() * -0.3 - 0.1;
          this.depth = 1;
          this.targetOpacity = Math.random() * 0.4 + 0.1;
        }

        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = 0; // Fade in initially
        
        const colors = ['255, 255, 255', '248, 250, 252', '229, 231, 235'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(width: number, height: number, dt: number, mx: number, my: number) {
        // Smooth sine wave horizontal drift (Bézier-like organic movement)
        this.phase += 0.005 * dt;
        const drift = Math.sin(this.phase) * 0.5 * this.depth;
        
        // Anti-gravity float
        this.y += this.speedY * dt;
        this.x += (this.speedX + drift) * dt;
        
        // Mouse parallax effect
        const dx = mx - width / 2;
        const dy = my - height / 2;
        const parallaxX = -dx * 0.01 * this.depth;
        const parallaxY = -dy * 0.01 * this.depth;
        
        const finalX = this.x + parallaxX;
        const finalY = this.y + parallaxY;

        // Fade in/out
        if (this.opacity < this.targetOpacity) {
          this.opacity += 0.01;
        }

        // Reset if off-screen (fade out not fully implemented for performance, just instant respawn for infinite feel)
        if (this.y < -50 || this.x < -50 || this.x > width + 50) {
          this.y = height + Math.random() * 50;
          this.x = Math.random() * width;
          this.opacity = 0;
        }

        return { x: finalX, y: finalY };
      }

      draw(ctx: CanvasRenderingContext2D, width: number, height: number, dt: number, mx: number, my: number) {
        const { x, y } = this.update(width, height, dt, mx, my);
        
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        
        if (this.type === 'bokeh') {
          ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 0.5})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        } else if (this.type === 'star') {
          // Twinkle effect
          const twinkle = this.targetOpacity + Math.sin(this.phase * 5) * 0.2;
          ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, twinkle)})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity})`;
        } else {
          ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }
    }

    const particleCount = Math.min(window.innerWidth / 4, 250); // Adjust density based on screen size
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(window.innerWidth, window.innerHeight));
    }

    let animationFrameId: number;
    let lastTime = 0;

    const render = (time: number) => {
      // Delta time for smooth frame-independent animation
      const dt = lastTime ? (time - lastTime) / 16.66 : 1;
      lastTime = time;

      // Smooth mouse easing
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Global composite operation for soft bloom blending
      ctx.globalCompositeOperation = 'screen';

      particles.forEach((p) => p.draw(ctx, window.innerWidth, window.innerHeight, dt, mouse.x, mouse.y));

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background: 'transparent',
      }}
    />
  );
};

export default AntiGravityParticles;
