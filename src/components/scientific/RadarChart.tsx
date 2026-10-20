import React, { useRef, useEffect } from 'react';

interface RadarChartProps {
  metrics?: {
    lipo: number;   // 0-1
    size: number;   // 0-1
    polar: number;  // 0-1
    insolu: number; // 0-1
    nsatu: number;  // 0-1
    flex: number;   // 0-1
  };
  sizePx?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  metrics = {
    lipo: 0.75,
    size: 0.65,
    polar: 0.55,
    insolu: 0.45,
    nsatu: 0.50,
    flex: 0.60,
  },
  sizePx = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const axes = [
    { label: 'Lipo: 2.21', value: metrics.lipo },
    { label: 'Size: 208 g/mol', value: metrics.size },
    { label: 'Polar: 2.7', value: metrics.polar },
    { label: 'Insolu: 0.48', value: metrics.insolu },
    { label: 'NSATU: 0.48', value: metrics.nsatu },
    { label: 'Flex: 4', value: metrics.flex },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 35;
    const totalAxes = axes.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Draw concentric polygon grid (5 levels)
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    levels.forEach(lvl => {
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * lvl);
        const y = centerY + Math.sin(angle) * (radius * lvl);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = lvl === 1.0 ? '#1C3648' : 'rgba(28, 54, 72, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axis radial spokes
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#1C3648';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis label
      const labelX = centerX + Math.cos(angle) * (radius + 20);
      const labelY = centerY + Math.sin(angle) * (radius + 20);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#9BB0BF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i].label, labelX, labelY);
    }

    // Draw Data Polygon
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = axes[i].value;
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill with glowing gradient
    const dataGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    dataGrad.addColorStop(0, 'rgba(20, 217, 181, 0.45)');
    dataGrad.addColorStop(1, 'rgba(49, 197, 244, 0.15)');
    ctx.fillStyle = dataGrad;
    ctx.fill();

    ctx.strokeStyle = '#14D9B5';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points at each vertex
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = axes[i].value;
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#31C5F4';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [metrics, sizePx]);

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={sizePx}
        height={sizePx}
        className="w-full h-auto"
      />
    </div>
  );
};
