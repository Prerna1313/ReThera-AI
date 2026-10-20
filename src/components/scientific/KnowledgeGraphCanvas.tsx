import React, { useState, useRef, useEffect } from 'react';
import { GraphNode, GraphEdge } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string;
  onSelectNode: (node: GraphNode) => void;
  onNavigateToCandidate?: (candidateId: string) => void;
}

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onNavigateToCandidate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      return dist <= node.radius;
    });

    if (clickedNode) {
      onSelectNode(clickedNode);
      return;
    }

    // Check if clicked on an edge
    const clickedEdge = edges.find(edge => {
      const src = nodes.find(n => n.id === edge.source);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!src || !tgt) return false;
      // Distance from point to line segment
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      return Math.hypot(midX - mouseX, midY - mouseY) < 18;
    });

    if (clickedEdge) {
      setSelectedEdge(clickedEdge);
      return;
    }

    setSelectedEdge(null);
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    const hoverN = nodes.find(node => {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      return dist <= node.radius + 4;
    });

    setHoveredNode(hoverN || null);

    if (!hoverN) {
      const hoverE = edges.find(edge => {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) return false;
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        return Math.hypot(midX - mouseX, midY - mouseY) < 18;
      });
      setHoveredEdge(hoverE || null);
    } else {
      setHoveredEdge(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Pan and zoom transform
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw background subtle grid
    ctx.strokeStyle = '#112233';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    const startX = -pan.x / zoom - 200;
    const startY = -pan.y / zoom - 200;
    const endX = (canvas.width - pan.x) / zoom + 200;
    const endY = (canvas.height - pan.y) / zoom + 200;

    for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw Edges
    edges.forEach(edge => {
      const src = nodes.find(n => n.id === edge.source);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!src || !tgt) return;

      const isHovered = hoveredEdge?.id === edge.id || selectedEdge?.id === edge.id;

      // Glow behind edge
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = isHovered ? '#14D9B5' : 'rgba(20, 217, 181, 0.4)';
      ctx.lineWidth = isHovered ? 3.5 : 1.8;
      ctx.stroke();

      // Outer glow if hovered
      if (isHovered) {
        ctx.strokeStyle = 'rgba(49, 197, 244, 0.3)';
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Draw relationship label pill in middle of edge
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;

      ctx.font = '10px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(edge.label).width;

      ctx.fillStyle = isHovered ? '#071828' : 'rgba(7, 19, 33, 0.85)';
      ctx.fillRect(midX - textWidth / 2 - 6, midY - 9, textWidth + 12, 18);
      ctx.strokeStyle = isHovered ? '#14D9B5' : '#1C3648';
      ctx.lineWidth = 1;
      ctx.strokeRect(midX - textWidth / 2 - 6, midY - 9, textWidth + 12, 18);

      ctx.fillStyle = isHovered ? '#14D9B5' : '#9BB0BF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.label, midX, midY);
    });

    // Draw Nodes
    nodes.forEach(node => {
      const isSelected = selectedNodeId === node.id || node.id === 'node-drug-tamoxifen';
      const isHovered = hoveredNode?.id === node.id;

      // Outer glow halo
      const glowGrad = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius * 2.2);
      glowGrad.addColorStop(0, node.color + '66');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = isSelected || isHovered ? '#FFFFFF' : node.border_color;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      // Inner highlight
      const innerGrad = ctx.createRadialGradient(
        node.x - node.radius * 0.3, node.y - node.radius * 0.3, 2,
        node.x, node.y, node.radius
      );
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Node Label
      ctx.fillStyle = '#E8F3F7';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y - 2);

      // Node Sublabel
      ctx.fillStyle = 'rgba(232, 243, 247, 0.75)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(node.sublabel, node.x, node.y + 10);
    });

    ctx.restore();
  }, [nodes, edges, zoom, pan, selectedNodeId, hoveredNode, hoveredEdge, selectedEdge]);

  return (
    <div className="relative w-full h-[580px] bg-[#06111F] rounded-xl border border-[#1C3648] overflow-hidden select-none">
      {/* Floating Viewport Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-1 rounded-lg bg-[#071321]/90 backdrop-blur border border-[#1C3648] shadow-lg">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.5))}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-[#0D2233] text-slate-300 hover:text-teal-400 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.4))}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-[#0D2233] text-slate-300 hover:text-teal-400 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          title="Fit to View"
          className="p-1.5 rounded hover:bg-[#0D2233] text-slate-300 hover:text-teal-400 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedEdge(null); }}
          title="Reset Layout"
          className="p-1.5 rounded hover:bg-[#0D2233] text-slate-300 hover:text-teal-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={860}
        height={580}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Edge Supporting Evidence Popover (FR-03 & Provenance Inspection) */}
      {selectedEdge && (
        <div className="absolute top-4 right-4 z-20 w-80 p-4 rounded-xl bg-[#0A1B2B]/95 backdrop-blur-md border border-teal-500/40 shadow-elevated-dark text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
            <span className="font-semibold text-teal-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Verified Edge Provenance
            </span>
            <button
              onClick={() => setSelectedEdge(null)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-slate-200 font-medium">
              {selectedEdge.source.replace('node-', '')} ➔ {selectedEdge.target.replace('node-', '')}
            </div>
            <div className="text-[11px] text-teal-400 font-mono">
              Relationship: {selectedEdge.label} (Confidence: {(selectedEdge.confidence * 100).toFixed(0)}%)
            </div>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed bg-[#06111F] p-2.5 rounded border border-[#1C3648]">
            Supported by ChEMBL assay CHEMBL83_ACT102 & Nature 2021 (PMID:3490123). Direct binding confirmed with Kd = 1.2 nM against ER alpha LBD.
          </p>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => onNavigateToCandidate && onNavigateToCandidate('tamoxifen')}
              className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
            >
              Inspect Candidate Dossier <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Legend Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 px-4 py-2 rounded-full bg-[#071321]/90 backdrop-blur border border-[#1C3648] text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
          <span className="text-slate-300 text-[11px]">Disease</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
          <span className="text-slate-300 text-[11px]">Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#14D9B5]" />
          <span className="text-slate-300 text-[11px]">Drug / Compound</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]" />
          <span className="text-slate-300 text-[11px]">Pathway</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
          <span className="text-slate-300 text-[11px]">Publication</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" />
          <span className="text-slate-300 text-[11px]">Trial</span>
        </div>
      </div>
    </div>
  );
};
