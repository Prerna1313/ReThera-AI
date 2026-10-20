import React, { useRef, useEffect } from 'react';

interface EvidenceItem {
  label: string;
  count: number;
  color: string;
}

export const EvidenceBreakdownChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const items: EvidenceItem[] = [
    { label: 'Clinical Trials', count: 12, color: '#7C73FF' }, // Indigo
    { label: 'Publications', count: 18, color: '#31C5F4' },    // Cyan
    { label: 'Regulatory', count: 4, color: '#14D9B5' },       // Teal
    { label: 'In Vitro Assays', count: 25, color: '#8293A5' },  // Slate
  ];

  const total = items.reduce((acc, curr) => acc + curr.count, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 70;
    const innerRadius = 45;

    let startAngle = -Math.PI / 2;

    items.forEach(item => {
      const sliceAngle = (item.count / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#06111F';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center Text (Total count)
    ctx.fillStyle = '#E8F3F7';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total}`, centerX, centerY - 6);

    ctx.fillStyle = '#9BB0BF';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Records', centerX, centerY + 12);
  }, [items, total]);

  return (
    <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-900/40 dark:bg-[#071321] border border-slate-700/60 dark:border-[#1C3648]">
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="w-36 h-36 flex-shrink-0"
      />

      <div className="flex flex-col gap-2 flex-1">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Evidence Composition
        </span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {items.map(item => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 text-[11px]">{item.label}</span>
              </div>
              <span className="font-mono font-semibold text-slate-100">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
