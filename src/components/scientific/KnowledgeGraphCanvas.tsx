import React, { useMemo, useRef, useState } from 'react';
import { EvidenceRecord, GraphNode, GraphEdge } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, ArrowUpRight } from 'lucide-react';

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  evidenceRecords: EvidenceRecord[];
  selectedNodeId?: string;
  onSelectNode: (node: GraphNode) => void;
  onNavigateToCandidate?: (candidateId: string) => void;
  onOpenEvidenceRecord?: (evidenceId: string) => void;
}

const WIDTH = 860;
const HEIGHT = 580;

function forceLayout(nodes: GraphNode[], edges: GraphEdge[]) {
  const points = nodes.map((node, index) => ({
    node,
    x: Number.isFinite(node.x) ? node.x : WIDTH / 2 + Math.cos(index * 2.4) * 180,
    y: Number.isFinite(node.y) ? node.y : HEIGHT / 2 + Math.sin(index * 2.4) * 180,
    vx: 0,
    vy: 0,
  }));
  const byId = new Map(points.map(point => [point.node.id, point]));
  for (let iteration = 0; iteration < 140; iteration++) {
    const cooling = 1 - iteration / 160;
    points.forEach(point => {
      point.vx += (WIDTH / 2 - point.x) * 0.0015;
      point.vy += (HEIGHT / 2 - point.y) * 0.0015;
    });
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x || 0.1, dy = a.y - b.y || 0.1;
        const distance2 = dx * dx + dy * dy;
        const force = Math.min(1.8, 1500 / distance2) * cooling;
        a.vx += dx * force; a.vy += dy * force;
        b.vx -= dx * force; b.vy -= dy * force;
      }
    }
    edges.forEach(edge => {
      const a = byId.get(edge.source), b = byId.get(edge.target);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const force = (distance - 150) * 0.006 * cooling;
      const fx = dx / distance * force, fy = dy / distance * force;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    });
    points.forEach(point => {
      point.vx *= 0.78; point.vy *= 0.78;
      point.x = Math.max(52, Math.min(WIDTH - 52, point.x + point.vx));
      point.y = Math.max(54, Math.min(HEIGHT - 70, point.y + point.vy));
    });
  }
  return new Map(points.map(point => [point.node.id, { x: point.x, y: point.y }]));
}

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphCanvasProps> = ({ nodes, edges, evidenceRecords, selectedNodeId, onSelectNode, onNavigateToCandidate, onOpenEvidenceRecord }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const positions = useMemo(() => forceLayout(nodes, edges), [nodes, edges]);
  const nodeById = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);
  const selectedSources = selectedEdge?.evidence_ids
    .map(id => evidenceRecords.find(record => record.id === id))
    .filter((record): record is EvidenceRecord => Boolean(record)) || [];

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest('[data-graph-item="true"]')) return;
    drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPan({
      x: drag.current.panX + (event.clientX - drag.current.x) * WIDTH / rect.width,
      y: drag.current.panY + (event.clientY - drag.current.y) * HEIGHT / rect.height,
    });
  };
  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedEdge(null); };

  return <div className="relative h-[580px] w-full overflow-hidden rounded-xl border border-[#1C3648] bg-[#06111F]">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Interactive force-directed biomedical relationship graph" className="h-full w-full touch-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <defs>
        <pattern id="graph-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#102333" strokeWidth="0.7" /></pattern>
        <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#graph-grid)" />
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
        {edges.map(edge => {
          const a = positions.get(edge.source), b = positions.get(edge.target);
          if (!a || !b) return null;
          const active = hoveredEdge === edge.id || selectedEdge?.id === edge.id;
          const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
          return <g key={edge.id} data-graph-item="true" className="cursor-pointer" onPointerEnter={() => setHoveredEdge(edge.id)} onPointerLeave={() => setHoveredEdge(null)} onClick={event => { event.stopPropagation(); setSelectedEdge(edge); }}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="18" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? '#14D9B5' : '#467182'} strokeOpacity={active ? 0.95 : 0.56} strokeWidth={active ? 2.6 : 1.4} />
            {active && <g><rect x={midX - Math.min(82, edge.label.length * 3.2 + 10)} y={midY - 10} width={Math.min(164, edge.label.length * 6.4 + 20)} height="20" rx="8" fill="#071321" stroke="#14D9B5" /><text x={midX} y={midY + 3.5} fill="#b9f8e9" textAnchor="middle" fontSize="9">{edge.label}</text></g>}
          </g>;
        })}
        {nodes.map(node => {
          const point = positions.get(node.id);
          if (!point) return null;
          const isSelected = selectedNodeId === node.id;
          return <g key={node.id} data-graph-item="true" role="button" tabIndex={0} aria-label={`${node.type}: ${node.label}, ${node.sublabel}`} className="cursor-pointer outline-none" onClick={event => { event.stopPropagation(); onSelectNode(node); setSelectedEdge(null); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectNode(node); setSelectedEdge(null); } }}>
            <title>{node.type}: {node.label} · {node.sublabel}</title>
            {isSelected && <circle cx={point.x} cy={point.y} r={node.radius + 9} fill="none" stroke="#d9fff5" strokeOpacity="0.7" strokeWidth="1.5" />}
            <circle cx={point.x} cy={point.y} r={node.radius} fill={node.color} fillOpacity="0.94" stroke={isSelected ? '#ffffff' : node.border_color} strokeWidth={isSelected ? 2.5 : 1.4} filter={isSelected ? 'url(#node-glow)' : undefined} />
            <text x={point.x} y={point.y - 2} fill="#f4fbff" textAnchor="middle" fontSize={node.radius > 25 ? 10 : 8.5} fontWeight="700">{node.label.length > 18 ? `${node.label.slice(0, 17)}…` : node.label}</text>
            <text x={point.x} y={point.y + 10} fill="#e4f1f6" fillOpacity="0.82" textAnchor="middle" fontSize="7">{node.sublabel.length > 20 ? `${node.sublabel.slice(0, 19)}…` : node.sublabel}</text>
          </g>;
        })}
      </g>
    </svg>
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-lg border border-[#1C3648] bg-[#071321]/90 p-1 shadow-lg">
      <button type="button" onClick={() => setZoom(value => Math.min(2.5, value + 0.15))} title="Zoom in" className="rounded p-1.5 text-slate-300 hover:bg-[#0D2233] hover:text-teal-300"><ZoomIn className="h-4 w-4" /></button>
      <button type="button" onClick={() => setZoom(value => Math.max(0.5, value - 0.15))} title="Zoom out" className="rounded p-1.5 text-slate-300 hover:bg-[#0D2233] hover:text-teal-300"><ZoomOut className="h-4 w-4" /></button>
      <button type="button" onClick={reset} title="Fit graph" className="rounded p-1.5 text-slate-300 hover:bg-[#0D2233] hover:text-teal-300"><Maximize2 className="h-4 w-4" /></button>
      <button type="button" onClick={reset} title="Reset graph" className="rounded p-1.5 text-slate-300 hover:bg-[#0D2233] hover:text-teal-300"><RotateCcw className="h-4 w-4" /></button>
    </div>
    {selectedEdge && <aside className="absolute right-4 top-4 z-20 w-80 rounded-xl border border-teal-500/40 bg-[#0A1B2B]/95 p-4 text-xs shadow-xl">
      <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-wider text-teal-300">{selectedSources.length ? 'Researcher-linked source' : 'Sample relationship'}</span><h3 className="mt-1 font-semibold text-slate-100">{nodeById.get(selectedEdge.source)?.label || selectedEdge.source} → {nodeById.get(selectedEdge.target)?.label || selectedEdge.target}</h3></div><button type="button" aria-label="Close relationship details" onClick={() => setSelectedEdge(null)} className="text-slate-400 hover:text-white">×</button></div>
      <p className="mt-2 text-cyan-300">{selectedEdge.label}{selectedEdge.confidence > 0 ? ` · illustrative confidence ${(selectedEdge.confidence * 100).toFixed(0)}%` : ''}</p>
      {selectedSources.length ? <div className="mt-3 space-y-2">{selectedSources.map(source => <article key={source.id} className="rounded border border-cyan-500/30 bg-[#06111F] p-2.5">
        <a href={source.url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold leading-snug text-cyan-200 hover:underline">{source.title}</a>
        <div className="mt-1 text-[9px] text-slate-400">{source.source_provider} · Retrieved {source.retrieved_date}</div>
        <div className="mt-1 text-[10px] text-slate-300">Researcher assessment: {source.direction} · {source.review_status}</div>
        {source.researcher_brief?.finding && <p className="mt-2 border-l-2 border-teal-500/50 pl-2 text-[10px] leading-relaxed text-slate-300">{source.researcher_brief.finding}</p>}
        <div className="mt-2 flex items-center justify-between gap-2"><span className="text-[9px] text-amber-200">Link and assessment are researcher-entered.</span>{onOpenEvidenceRecord && <button type="button" onClick={() => onOpenEvidenceRecord(source.id)} className="shrink-0 text-[10px] font-semibold text-teal-300 hover:text-white">Open review</button>}</div>
      </article>)}</div> : <p className="mt-2 rounded border border-[#1C3648] bg-[#06111F] p-2.5 leading-relaxed text-slate-300">This demo relationship has no attached source in the graph. Check primary literature or curated records before relying on it.</p>}
      {(() => { const compound = [selectedEdge.source, selectedEdge.target].map(id => nodeById.get(id)).find(node => node?.type === 'compound'); const candidateId = compound?.id.replace('node-drug-', ''); return candidateId && onNavigateToCandidate ? <button type="button" onClick={() => onNavigateToCandidate(candidateId)} className="mt-3 inline-flex items-center gap-1 text-teal-300 hover:text-teal-100">Inspect linked compound <ArrowUpRight className="h-3 w-3" /></button> : null; })()}
    </aside>}
    <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-[#1C3648] bg-[#071321]/90 px-4 py-2 text-[10px] text-slate-300">
      {[['#F43F5E', 'Disease'], ['#0284C7', 'Target'], ['#14D9B5', 'Compound'], ['#FB923C', 'Pathway'], ['#94A3B8', 'Publication'], ['#818CF8', 'Trial']].map(([color, label]) => <span key={label} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}
      <span className="hidden border-l border-[#1C3648] pl-3 text-slate-400 sm:inline">Drag background to pan · select node or edge to inspect</span>
    </div>
  </div>;
};
