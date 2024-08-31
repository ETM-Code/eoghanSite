"use client"
import React, { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

interface Point {
  x: number;
  y: number;
}

interface Blob {
  points: Point[];
  color: string;
  life: number;
  maxLife: number;
  size: number;
  maxSize: number;
}

const FluidBlobBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const noise3D = createNoise3D();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const maxBlobs = 5;
    const minPointsPerBlob = 3;
    const maxPointsPerBlob = 12;
    let blobs: Blob[] = [];

    const getRandomColor = (): string => {
      const hue = Math.random() * 60 + 180; // Blue to purple range
      return `hsla(${hue}, 70%, 50%, 0.2)`;
    };

    const createBlob = (): Blob => {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      const points: Point[] = [];
      const initialPoints = minPointsPerBlob;
      for (let i = 0; i < initialPoints; i++) {
        const angle = (i / initialPoints) * Math.PI * 2;
        const radius = 10; // Start with a small radius
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
      return { 
        points, 
        color: getRandomColor(), 
        life: 0,
        maxLife: Math.random() * 500 + 500,
        size: 10,
        maxSize: Math.random() * 100 + 50
      };
    };

    const updatePoints = (time: number) => {
      blobs.forEach((blob) => {
        // Grow the blob
        if (blob.size < blob.maxSize) {
          blob.size += 0.1;
        }

        // Increase complexity as the blob grows
        const targetPoints = Math.floor(minPointsPerBlob + (maxPointsPerBlob - minPointsPerBlob) * (blob.size / blob.maxSize));
        if (blob.points.length < targetPoints) {
          const index = Math.floor(Math.random() * blob.points.length);
          const newPoint = {
            x: (blob.points[index].x + blob.points[(index + 1) % blob.points.length].x) / 2,
            y: (blob.points[index].y + blob.points[(index + 1) % blob.points.length].y) / 2
          };
          blob.points.splice(index + 1, 0, newPoint);
        }

        // Move points
        blob.points.forEach((point) => {
          const nx = noise3D(point.x * 0.002, point.y * 0.002, time * 0.0003);
          const ny = noise3D(point.x * 0.002, point.y * 0.002, time * 0.0003 + 1000);
          point.x += nx * 0.5;
          point.y += ny * 0.5;

          // Smooth wrapping around edges
          point.x = (point.x + canvas.width) % canvas.width;
          point.y = (point.y + canvas.height) % canvas.height;
        });
        blob.life++;
      });

      // Remove dead blobs
      blobs = blobs.filter(blob => blob.life < blob.maxLife);

      // Add new blobs if there's room
      if (blobs.length < maxBlobs) {
        blobs.push(createBlob());
      }
    };

    const drawBlob = (ctx: CanvasRenderingContext2D, blob: Blob) => {
      const { points, color, life, maxLife, size } = blob;
      const alpha = Math.sin((life / maxLife) * Math.PI) * 0.2;
      ctx.fillStyle = color.replace('0.2)', `${alpha})`);
      ctx.beginPath();
      
      const firstPoint = points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }

      ctx.closePath();
      ctx.fill();
    };

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time++;
      updatePoints(time);

      blobs.forEach((blob) => {
        drawBlob(ctx, blob);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ backgroundColor: '#F5E6D3' }}
    />
  );
};

export default FluidBlobBackground;