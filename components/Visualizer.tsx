'use client';

import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  isPlaying,
  accentColor = '#10b981',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 48;

    const render = () => {
      const width = (canvas.width = canvas.offsetWidth || 600);
      const height = (canvas.height = canvas.offsetHeight || 160);
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const barWidth = Math.max(3, (width / barCount) * 0.55);
      const gap = (width - barCount * barWidth) / (barCount - 1);

      phase += isPlaying ? 0.06 : 0.01;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);

        // Symmetrical distance factor from center of the bar array
        const normalizedIndex = (i - barCount / 2) / (barCount / 2);
        const centerBell = Math.cos(normalizedIndex * (Math.PI / 2.2));

        // Sine wave modulation for fluid dynamic movement
        const wave1 = Math.sin(phase + i * 0.25);
        const wave2 = Math.cos(phase * 1.4 + i * 0.15);
        const noise = (wave1 * 0.6 + wave2 * 0.4) * centerBell;

        // Amplitude height
        const baseHeight = isPlaying ? height * 0.38 : height * 0.08;
        const barHeight = Math.max(6, Math.abs(noise * baseHeight) + (isPlaying ? 12 : 4));

        // Draw Symmetrical Bar around midline (centerY)
        const topY = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, topY, 0, topY + barHeight);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, accentColor);

        ctx.fillStyle = gradient;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = isPlaying ? 12 : 2;

        // Rounded bar
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, topY, barWidth, barHeight, 4);
        } else {
          ctx.rect(x, topY, barWidth, barHeight);
        }
        ctx.fill();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="w-full h-36 md:h-44 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
