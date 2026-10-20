import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Maximize2, Download, Copy, Check } from 'lucide-react';

interface MoleculeViewerProps {
  name: string;
  smiles: string;
  inchikey: string;
  formula: string;
  mw: number;
}

interface Atom3D {
  x: number;
  y: number;
  z: number;
  element: 'C' | 'N' | 'O' | 'H';
  radius: number;
  color: string;
}

interface Bond3D {
  from: number;
  to: number;
  order: number;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  name,
  smiles,
  inchikey,
  formula,
  mw,
}) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.6 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // 3D coordinates for Tamoxifen molecular skeleton
  const atoms: Atom3D[] = [
    // Central alkene carbons
    { x: 0, y: 0, z: 0, element: 'C', radius: 10, color: '#31C5F4' },
    { x: 28, y: 0, z: 0, element: 'C', radius: 10, color: '#31C5F4' },
    // Ethyl group
    { x: -16, y: -22, z: 8, element: 'C', radius: 9, color: '#14D9B5' },
    { x: -38, y: -28, z: -10, element: 'C', radius: 9, color: '#14D9B5' },
    // Phenyl ring 1
    { x: -18, y: 24, z: 0, element: 'C', radius: 9, color: '#31C5F4' },
    { x: -38, y: 38, z: 6, element: 'C', radius: 8, color: '#31C5F4' },
    { x: -38, y: 64, z: 6, element: 'C', radius: 8, color: '#31C5F4' },
    { x: -18, y: 76, z: 0, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 2, y: 62, z: -6, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 2, y: 36, z: -6, element: 'C', radius: 8, color: '#31C5F4' },
    // Phenyl ring 2
    { x: 46, y: -22, z: 12, element: 'C', radius: 9, color: '#31C5F4' },
    { x: 68, y: -32, z: 18, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 86, y: -20, z: 14, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 82, y: 2, z: 4, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 60, y: 12, z: -2, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 42, y: 0, z: 2, element: 'C', radius: 8, color: '#31C5F4' },
    // Phenoxy ring + ethoxy + dimethylamine
    { x: 38, y: 26, z: -12, element: 'C', radius: 9, color: '#31C5F4' },
    { x: 58, y: 36, z: -20, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 66, y: 60, z: -24, element: 'C', radius: 8, color: '#31C5F4' },
    { x: 88, y: 70, z: -30, element: 'O', radius: 11, color: '#FB7185' }, // Oxygen
    { x: 96, y: 94, z: -32, element: 'C', radius: 8, color: '#14D9B5' },
    { x: 118, y: 104, z: -36, element: 'C', radius: 8, color: '#14D9B5' },
    { x: 132, y: 126, z: -40, element: 'N', radius: 11, color: '#7C73FF' }, // Nitrogen
    { x: 154, y: 120, z: -44, element: 'C', radius: 7, color: '#14D9B5' },
    { x: 130, y: 150, z: -46, element: 'C', radius: 7, color: '#14D9B5' },
  ];

  const bonds: Bond3D[] = [
    { from: 0, to: 1, order: 2 },
    { from: 0, to: 2, order: 1 },
    { from: 2, to: 3, order: 1 },
    { from: 0, to: 4, order: 1 },
    { from: 4, to: 5, order: 2 },
    { from: 5, to: 6, order: 1 },
    { from: 6, to: 7, order: 2 },
    { from: 7, to: 8, order: 1 },
    { from: 8, to: 9, order: 2 },
    { from: 9, to: 4, order: 1 },
    { from: 1, to: 10, order: 1 },
    { from: 10, to: 11, order: 2 },
    { from: 11, to: 12, order: 1 },
    { from: 12, to: 13, order: 2 },
    { from: 13, to: 14, order: 1 },
    { from: 14, to: 15, order: 2 },
    { from: 15, to: 10, order: 1 },
    { from: 1, to: 16, order: 1 },
    { from: 16, to: 17, order: 2 },
    { from: 17, to: 18, order: 1 },
    { from: 18, to: 19, order: 1 },
    { from: 19, to: 20, order: 1 },
    { from: 20, to: 21, order: 1 },
    { from: 21, to: 22, order: 1 },
    { from: 22, to: 23, order: 1 },
    { from: 22, to: 24, order: 1 },
  ];

  // Mouse interaction for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render 3D Canvas
  useEffect(() => {
    if (viewMode !== '3D' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let autoRotate = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentRotY = rotation.y + (isDragging ? 0 : autoRotate);
      const currentRotX = rotation.x;

      if (!isDragging) {
        autoRotate += 0.005;
      }

      // Rotate and project atoms
      const projected = atoms.map(atom => {
        // Rotate around Y axis
        const cosY = Math.cos(currentRotY);
        const sinY = Math.sin(currentRotY);
        const x1 = atom.x * cosY - atom.z * sinY;
        const z1 = atom.z * cosY + atom.x * sinY;

        // Rotate around X axis
        const cosX = Math.cos(currentRotX);
        const sinX = Math.sin(currentRotX);
        const y2 = atom.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + atom.y * sinX;

        // Perspective scale
        const scale = 250 / (250 + z2);
        return {
          px: centerX + x1 * scale * 1.5,
          py: centerY + y2 * scale * 1.5,
          pz: z2,
          radius: atom.radius * scale * 1.2,
          color: atom.color,
          element: atom.element,
        };
      });

      // Draw bonds first
      bonds.forEach(bond => {
        const a1 = projected[bond.from];
        const a2 = projected[bond.to];
        if (!a1 || !a2) return;

        ctx.beginPath();
        ctx.moveTo(a1.px, a1.py);
        ctx.lineTo(a2.px, a2.py);
        ctx.strokeStyle = '#1C3648';
        ctx.lineWidth = bond.order === 2 ? 5 : 3;
        ctx.stroke();

        // Inner luminous bond line
        ctx.beginPath();
        ctx.moveTo(a1.px, a1.py);
        ctx.lineTo(a2.px, a2.py);
        ctx.strokeStyle = '#31C5F4';
        ctx.lineWidth = bond.order === 2 ? 2.5 : 1.5;
        ctx.stroke();
      });

      // Sort atoms by Z for proper depth
      const sortedIndices = projected
        .map((atom, idx) => ({ idx, z: atom.pz }))
        .sort((a, b) => a.z - b.z);

      // Draw atoms
      sortedIndices.forEach(({ idx }) => {
        const atom = projected[idx];
        if (!atom) return;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          atom.px, atom.py, atom.radius * 0.2,
          atom.px, atom.py, atom.radius * 2.2
        );
        glowGradient.addColorStop(0, atom.color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(atom.px, atom.py, atom.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Sphere gradient
        const sphereGrad = ctx.createRadialGradient(
          atom.px - atom.radius * 0.3, atom.py - atom.radius * 0.3, atom.radius * 0.1,
          atom.px, atom.py, atom.radius
        );
        sphereGrad.addColorStop(0, '#FFFFFF');
        sphereGrad.addColorStop(0.3, atom.color);
        sphereGrad.addColorStop(1, '#06111F');

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(atom.px, atom.py, atom.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [viewMode, rotation, isDragging]);

  return (
    <div className="flex flex-col bg-slate-900/40 dark:bg-[#0A1B2B] rounded-xl border border-slate-700/60 dark:border-[#1C3648] overflow-hidden">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 dark:border-[#1C3648] bg-slate-900/60 dark:bg-[#071321]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-100 dark:text-[#E8F3F7]">{name} Structure</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#14D9B5]/15 text-[#14D9B5] border border-[#14D9B5]/30 font-mono">
            {formula} • {mw} g/mol
          </span>
        </div>

        {/* 2D / 3D Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-0.5 bg-slate-800 dark:bg-[#06111F] border border-slate-700 dark:border-[#1C3648]">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === '3D'
                  ? 'bg-[#14D9B5] text-[#06111F] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === '2D'
                  ? 'bg-[#14D9B5] text-[#06111F] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D
            </button>
          </div>

          <button
            title="Reset rotation"
            onClick={() => setRotation({ x: 0.4, y: 0.6 })}
            className="p-1.5 rounded-lg border border-slate-700 dark:border-[#1C3648] text-slate-400 hover:text-teal-400 hover:border-teal-500/40 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Structure Area */}
      <div className="relative h-72 md:h-80 w-full flex items-center justify-center bg-radial-gradient">
        {name !== 'Tamoxifen' ? (
          <p className="px-6 text-center text-sm text-slate-300">Structure preview unavailable for {name}. Compound identifiers are shown below.</p>
        ) : viewMode === '3D' ? (
          <canvas
            ref={canvasRef}
            width={520}
            height={320}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-grab active:cursor-grabbing w-full h-full"
          />
        ) : (
          /* High-Fidelity 2D Skeletal Formula Vector */
          <div className="p-6 flex flex-col items-center justify-center">
            <svg viewBox="0 0 420 220" className="w-80 h-48 drop-shadow-lg">
              {/* Central alkene */}
              <line x1="160" y1="110" x2="200" y2="110" stroke="#31C5F4" strokeWidth="4" />
              <line x1="164" y1="104" x2="196" y2="104" stroke="#14D9B5" strokeWidth="2.5" />
              {/* Ethyl */}
              <line x1="160" y1="110" x2="135" y2="85" stroke="#31C5F4" strokeWidth="3" />
              <line x1="135" y1="85" x2="105" y2="90" stroke="#31C5F4" strokeWidth="3" />
              {/* Phenyl 1 */}
              <line x1="160" y1="110" x2="140" y2="145" stroke="#31C5F4" strokeWidth="3" />
              <polygon points="140,145 110,145 95,170 110,195 140,195 155,170" fill="none" stroke="#31C5F4" strokeWidth="2.5" />
              <circle cx="125" cy="170" r="14" fill="none" stroke="#14D9B5" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Phenyl 2 */}
              <line x1="200" y1="110" x2="225" y2="80" stroke="#31C5F4" strokeWidth="3" />
              <polygon points="225,80 255,80 270,55 255,30 225,30 210,55" fill="none" stroke="#31C5F4" strokeWidth="2.5" />
              <circle cx="240" cy="55" r="14" fill="none" stroke="#14D9B5" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Phenoxy ether */}
              <line x1="200" y1="110" x2="220" y2="140" stroke="#31C5F4" strokeWidth="3" />
              <polygon points="220,140 250,140 265,165 250,190 220,190 205,165" fill="none" stroke="#31C5F4" strokeWidth="2.5" />
              <circle cx="235" cy="165" r="14" fill="none" stroke="#14D9B5" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Ether bond to Oxygen */}
              <line x1="265" y1="165" x2="290" y2="165" stroke="#31C5F4" strokeWidth="3" />
              <text x="294" y="170" fill="#FB7185" fontSize="14" fontWeight="bold">O</text>
              {/* Ethoxy chain to Nitrogen */}
              <line x1="308" y1="165" x2="330" y2="165" stroke="#31C5F4" strokeWidth="3" />
              <line x1="330" y1="165" x2="350" y2="145" stroke="#31C5F4" strokeWidth="3" />
              <text x="354" y="150" fill="#7C73FF" fontSize="14" fontWeight="bold">N</text>
              {/* Dimethyl group */}
              <line x1="368" y1="145" x2="390" y2="130" stroke="#31C5F4" strokeWidth="3" />
              <line x1="362" y1="155" x2="375" y2="180" stroke="#31C5F4" strokeWidth="3" />
            </svg>
            <span className="text-[11px] text-slate-400 font-mono mt-2">
              (Z)-2-[4-(1,2-diphenylbut-1-en-1-yl)phenoxy]-N,N-dimethylethanamine
            </span>
          </div>
        )}

        {/* HUD Telemetry Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-950/80 text-teal-300 border border-teal-500/30">
            Illustrative structure · not computed from SMILES
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
            No validated conformation available
          </span>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono bg-slate-950/70 px-2 py-1 rounded border border-slate-800">
          {name === 'Tamoxifen' && viewMode === '3D' ? 'Drag to rotate illustration' : 'Unvalidated prototype preview'}
        </div>
      </div>

      {/* SMILES & InChIKey Footer */}
      <div className="p-3 bg-slate-950/60 dark:bg-[#071321] border-t border-slate-700/60 dark:border-[#1C3648] text-xs font-mono space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">SMILES</span>
            <span className="text-teal-300 truncate text-[11px] select-all">{smiles}</span>
          </div>
          <button
            onClick={() => handleCopy(smiles, 'smiles')}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {copied === 'smiles' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
            {copied === 'smiles' ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">InChIKey</span>
            <span className="text-cyan-300 truncate text-[11px] select-all">{inchikey}</span>
          </div>
          <button
            onClick={() => handleCopy(inchikey, 'inchikey')}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {copied === 'inchikey' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
            {copied === 'inchikey' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
