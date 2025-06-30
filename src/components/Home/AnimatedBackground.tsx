import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Connection {
  from: Dot;
  to: Dot;
  opacity: number;
}

const AnimatedBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationRef = useRef<number>();
  const { theme } = useTheme();

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default theme during SSR to prevent hydration mismatch
  const isDark = mounted ? theme === 'dark' : false;

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createDots = () => {
      const dots: Dot[] = [];
      const numDots = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 15000));
      
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
      return dots;
    };

    const updateConnections = (dots: Dot[]) => {
      const connections: Connection[] = [];
      const maxDistance = 150;
      
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            connections.push({
              from: dots[i],
              to: dots[j],
              opacity: (1 - distance / maxDistance) * 0.3,
            });
          }
        }
      }
      return connections;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update dot positions
      dotsRef.current.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        
        dot.x = Math.max(0, Math.min(canvas.width, dot.x));
        dot.y = Math.max(0, Math.min(canvas.height, dot.y));
      });
      
      // Update connections
      connectionsRef.current = updateConnections(dotsRef.current);
      
      // Draw connections
      connectionsRef.current.forEach(connection => {
        ctx.beginPath();
        ctx.moveTo(connection.from.x, connection.from.y);
        ctx.lineTo(connection.to.x, connection.to.y);
        ctx.strokeStyle = isDark
          ? `rgba(139, 92, 246, ${connection.opacity})` 
          : `rgba(139, 92, 246, ${connection.opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Draw dots
      dotsRef.current.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(139, 92, 246, 0.6)' 
          : 'rgba(139, 92, 246, 0.4)';
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    dotsRef.current = createDots();
    animate();

    const handleResize = () => {
      resizeCanvas();
      dotsRef.current = createDots();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, isDark]);

  const backgroundStyle = isDark
    ? 'radial-gradient(ellipse at center, #1a1b3a 0%, #0a0b1e 100%)'
    : 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 100%)';

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: backgroundStyle }}
    />
  );
};

export default AnimatedBackground; 
