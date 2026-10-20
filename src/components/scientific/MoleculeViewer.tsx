import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCw, Copy, Check, ExternalLink } from 'lucide-react';

interface MoleculeViewerProps {
  name: string;
  smiles: string;
  inchikey: string;
  formula: string;
  mw: number;
  pubchemCid?: string;
}

type Atom = { x: number; y: number; z: number; element: string };
type Bond = { from: number; to: number; order: number };
type Structure = { atoms: Atom[]; bonds: Bond[] };

function parseSdf(sdf: string): Structure | null {
  const lines = sdf.split(/\r?\n/);
  if (lines.length < 5) return null;
  const atomCount = Number.parseInt(lines[3]?.slice(0, 3) || '', 10);
  const bondCount = Number.parseInt(lines[3]?.slice(3, 6) || '', 10);
  if (!Number.isFinite(atomCount) || atomCount < 1 || atomCount > 500 || !Number.isFinite(bondCount) || bondCount > 1000) return null;
  const atoms: Atom[] = [];
  for (let i = 0; i < atomCount; i++) {
    const tokens = lines[4 + i]?.trim().split(/\s+/) || [];
    const atom = { x: Number(tokens[0]), y: Number(tokens[1]), z: Number(tokens[2]), element: tokens[3] || 'C' };
    if (![atom.x, atom.y, atom.z].every(Number.isFinite)) return null;
    atoms.push(atom);
  }
  const bonds: Bond[] = [];
  for (let i = 0; i < bondCount; i++) {
    const tokens = lines[4 + atomCount + i]?.trim().split(/\s+/) || [];
    const from = Number(tokens[0]) - 1;
    const to = Number(tokens[1]) - 1;
    const order = Number(tokens[2]) || 1;
    if (from < 0 || to < 0 || from >= atoms.length || to >= atoms.length) return null;
    bonds.push({ from, to, order });
  }
  return { atoms, bonds };
}

const elementColors: Record<string, string> = {
  C: '#d9e4ed', N: '#618cff', O: '#ff647c', S: '#ffd166', P: '#ff9f43', F: '#76e3a5',
  CL: '#76e3a5', BR: '#c88965', I: '#bb91ff', H: '#ffffff',
};

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ name, smiles, inchikey, formula, mw, pubchemCid }) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [copied, setCopied] = useState<string | null>(null);
  const [structure, setStructure] = useState<Structure | null>(null);
  const [structureStatus, setStructureStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [imageAvailable, setImageAvailable] = useState(true);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.4 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setImageAvailable(true);
    let active = true;
    if (!pubchemCid || !/^\d+$/.test(pubchemCid)) {
      setStructureStatus('unavailable');
      return () => { active = false; };
    }
    setStructureStatus('loading');
    fetch(`/api/pubchem/${pubchemCid}/conformer`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '3D conformer unavailable');
        return parseSdf(data.sdf);
      })
      .then(parsed => {
        if (!active) return;
        setStructure(parsed);
        setStructureStatus(parsed ? 'ready' : 'unavailable');
      })
      .catch(() => { if (active) setStructureStatus('unavailable'); });
    return () => { active = false; };
  }, [pubchemCid]);

  const imageUrl = useMemo(() => pubchemCid && /^\d+$/.test(pubchemCid)
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemCid}/PNG?record_type=2d&image_size=500x300`
    : null, [pubchemCid]);

  useEffect(() => {
    if (viewMode !== '3D' || structureStatus !== 'ready' || !structure || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      ctx.clearRect(0, 0, width, height);
      const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
      const rotated = structure.atoms.map(atom => {
        const x = atom.x * cosY - atom.z * sinY;
        const z1 = atom.z * cosY + atom.x * sinY;
        const y = atom.y * cosX - z1 * sinX;
        const z = z1 * cosX + atom.y * sinX;
        return { x, y, z, element: atom.element.toUpperCase() };
      });
      const max = Math.max(...rotated.flatMap(a => [Math.abs(a.x), Math.abs(a.y), Math.abs(a.z)]), 1);
      const scale = Math.min(width, height) * 0.38 / max;
      const points = rotated.map(a => ({ x: width / 2 + a.x * scale, y: height / 2 - a.y * scale, z: a.z, element: a.element }));
      structure.bonds.forEach(bond => {
        const a = points[bond.from], b = points[bond.to];
        if (!a || !b) return;
        ctx.strokeStyle = '#708597'; ctx.lineWidth = Math.max(1.5, 2.5 * dpr); ctx.lineCap = 'round';
        for (let line = 0; line < Math.min(3, bond.order); line++) {
          const offset = (line - (Math.min(3, bond.order) - 1) / 2) * 3 * dpr;
          const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
          const ox = -dy / length * offset, oy = dx / length * offset;
          ctx.beginPath(); ctx.moveTo(a.x + ox, a.y + oy); ctx.lineTo(b.x + ox, b.y + oy); ctx.stroke();
        }
      });
      [...points].sort((a, b) => a.z - b.z).forEach(atom => {
        const radius = atom.element === 'C' || atom.element === 'H' ? 4.3 * dpr : 6.2 * dpr;
        ctx.beginPath(); ctx.arc(atom.x, atom.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = elementColors[atom.element] || '#c6d0da'; ctx.fill();
        if (!['C', 'H'].includes(atom.element)) {
          ctx.fillStyle = '#071321'; ctx.font = `bold ${8 * dpr}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(atom.element, atom.x, atom.y);
        }
      });
    };
    const resize = new ResizeObserver(render);
    resize.observe(canvas);
    render();
    frame = requestAnimationFrame(render);
    return () => { resize.disconnect(); cancelAnimationFrame(frame); };
  }, [viewMode, structure, structureStatus, rotation]);

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(null), 1800); } catch { setCopied(null); }
  };
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true); dragStart.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = event.clientX - dragStart.current.x, dy = event.clientY - dragStart.current.y;
    dragStart.current = { x: event.clientX, y: event.clientY };
    setRotation(previous => ({ x: Math.max(-1.5, Math.min(1.5, previous.x + dy * 0.008)), y: previous.y + dx * 0.008 }));
  };

  return <section className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0A1B2B]" aria-label={`${name} molecular structure`}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C3648] bg-[#071321] px-4 py-3">
      <div><h3 className="text-sm font-semibold text-slate-100">{name} structure</h3><p className="text-[11px] text-slate-400">{formula} · {mw} g/mol · PubChem CID {pubchemCid || 'not linked'}</p></div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-[#1C3648] bg-[#06111F] p-0.5">
          {(['3D', '2D'] as const).map(mode => <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`rounded-md px-3 py-1 text-xs font-semibold ${viewMode === mode ? 'bg-[#14D9B5] text-[#06111F]' : 'text-slate-400 hover:text-white'}`}>{mode}</button>)}
        </div>
        <button type="button" title="Reset 3D rotation" onClick={() => setRotation({ x: 0.3, y: 0.4 })} className="rounded-lg border border-[#1C3648] p-1.5 text-slate-400 hover:text-teal-300"><RotateCw className="h-3.5 w-3.5" /></button>
      </div>
    </header>
    <div className="relative flex h-72 w-full items-center justify-center bg-[#06111F]">
      {viewMode === '2D' && imageUrl && imageAvailable ? <img src={imageUrl} alt={`PubChem 2D structure of ${name}`} className="h-full w-full object-contain p-5" onError={() => setImageAvailable(false)} />
        : viewMode === '3D' && structureStatus === 'ready' ? <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setIsDragging(false)} onPointerCancel={() => setIsDragging(false)} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" aria-label="Interactive PubChem 3D conformer; drag to rotate" />
        : <div className="max-w-sm px-5 text-center text-sm text-slate-300">{viewMode === '3D' && structureStatus === 'loading' ? 'Loading PubChem 3D conformer…' : viewMode === '3D' ? 'No 3D conformer is available for this PubChem record. Try the 2D structure.' : !pubchemCid ? 'A PubChem CID is needed to load the registered 2D structure.' : 'PubChem could not load a 2D image for this record.'}</div>}
      <div className="absolute bottom-2 left-3 rounded bg-slate-950/80 px-2 py-1 text-[10px] text-slate-400">{viewMode === '2D' ? '2D structure · PubChem' : structureStatus === 'ready' ? '3D conformer · PubChem · drag to rotate' : 'Structure data from PubChem'}</div>
    </div>
    <footer className="space-y-2 border-t border-[#1C3648] bg-[#071321] p-3 text-xs font-mono">
      {[['SMILES', smiles, 'smiles'], ['InChIKey', inchikey, 'inchikey']].map(([label, value, key]) => <div key={key} className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className="shrink-0 text-[10px] font-semibold uppercase text-slate-400">{label}</span><span className="truncate text-[11px] text-teal-300 select-all">{value}</span></div><button type="button" onClick={() => copy(value, key)} className="flex shrink-0 items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{copied === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied === key ? 'Copied' : 'Copy'}</button></div>)}
      {pubchemCid && <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemCid}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:underline">Open PubChem record <ExternalLink className="h-3 w-3" /></a>}
    </footer>
  </section>;
};
