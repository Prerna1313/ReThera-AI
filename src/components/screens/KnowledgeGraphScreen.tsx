import React, { useState } from 'react';
import { GraphNode, GraphEdge, NavigationTab } from '../../types';
import { KnowledgeGraphCanvas } from '../scientific/KnowledgeGraphCanvas';
import { StatusBadge } from '../scientific/StatusBadge';
import {
  Search,
  Filter,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface KnowledgeGraphScreenProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNavigate: (tab: NavigationTab, candidateId?: string) => void;
}

export const KnowledgeGraphScreen: React.FC<KnowledgeGraphScreenProps> = ({
  nodes,
  edges,
  onNavigate,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(
    nodes.find(n => n.id === 'node-drug-tamoxifen') || nodes[0]
  );
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = nodes.filter(n => {
    const matchesFilter = filterType === 'all' ? true : n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.sublabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
              INTERACTOME CANVAS
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              7 Nodes • 9 Verified Edges • 91.4% Avg Confidence
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Biomedical Knowledge Graph Explorer
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Explore provenance-preserving relationships between diseases, targets, compounds, and live evidence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('evidence-monitor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071321] hover:bg-[#0D2233] border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh via TinyFish
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#071321] hover:bg-[#0D2233] border border-[#1C3648] text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Subgraph
          </button>
        </div>
      </div>

      {/* Subheader Search & Filters */}
      <div className="p-4 rounded-xl bg-[#0A1B2B] border border-[#1C3648] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full sm:w-auto max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search nodes, e.g. BRCA1, aspirin, breast cancer, ESR1, mTOR..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Filter:</span>
          {['all', 'disease', 'target', 'compound', 'pathway'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors whitespace-nowrap text-xs ${
                filterType === t
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'bg-[#071321] text-slate-400 border border-[#1C3648] hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid (Central Canvas 8 cols / Right Contextual Panel 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Central Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          <KnowledgeGraphCanvas
            nodes={filteredNodes}
            edges={edges}
            selectedNodeId={selectedNode.id}
            onSelectNode={node => setSelectedNode(node)}
            onNavigateToCandidate={candId => onNavigate('candidate-details', candId)}
          />

          <div className="px-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Tip: Click on any node to view inspector; click on any connecting edge to audit supporting evidence.</span>
            <span>Force-Directed Engine Active</span>
          </div>
        </div>

        {/* Right Contextual Inspection Panel (4 cols - Matching Image 2 Middle Center) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C3648]">
            <span className="font-bold text-sm text-slate-100">Node Inspector</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase">
              {selectedNode.type}
            </span>
          </div>

          {/* Node Identity Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedNode.label}</h3>
                <span className="font-mono text-xs text-teal-400">{selectedNode.sublabel}</span>
              </div>
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedNode.color }} />
            </div>

            {/* If Selected Node is Tamoxifen or Compound, render chemical thumbnail */}
            {selectedNode.type === 'compound' && (
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">2D Skeletal Preview</span>
                  <StatusBadge type="clinical" value="Approved" />
                </div>
                <div className="h-28 flex items-center justify-center bg-[#06111F] rounded-lg border border-slate-800">
                  <svg viewBox="0 0 160 100" className="w-36 h-24">
                    <line x1="60" y1="50" x2="90" y2="50" stroke="#31C5F4" strokeWidth="2.5" />
                    <line x1="62" y1="46" x2="88" y2="46" stroke="#14D9B5" strokeWidth="1.5" />
                    <polygon points="40,30 20,40 20,60 40,70 60,60 60,40" fill="none" stroke="#31C5F4" strokeWidth="2" />
                    <polygon points="110,30 90,40 90,60 110,70 130,60 130,40" fill="none" stroke="#31C5F4" strokeWidth="2" />
                    <circle cx="40" cy="50" r="10" fill="none" stroke="#14D9B5" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="110" cy="50" r="10" fill="none" stroke="#14D9B5" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>
                </div>
              </div>
            )}

            {/* Node Metadata Specs */}
            <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Registry Identifier:</span>
                <span className="text-slate-200">{selectedNode.sublabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Receptors:</span>
                <span className="text-cyan-300">ESR1, PGR, GPER1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Indication:</span>
                <span className="text-slate-200">Breast Cancer (ER+)</span>
              </div>
            </div>

            {/* Evidence Statistics Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-center">
                <div className="font-bold font-mono text-teal-300 text-sm">24</div>
                <div className="text-[10px] text-slate-400">Supporting Records</div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                <div className="font-bold font-mono text-rose-300 text-sm">2</div>
                <div className="text-[10px] text-slate-400">Flagged Caveats</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onNavigate('candidate-details', 'tamoxifen')}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#14D9B5] text-[#06111F] font-bold text-xs shadow-teal-glow hover:bg-[#10B981] transition-colors"
              >
                View Candidate Details <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('evidence-monitor')}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071321] text-cyan-300 border border-cyan-500/30 hover:bg-[#0D2233] text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Evidence via TinyFish
              </button>
            </div>

            {/* Illustrative Dataset Disclaimer */}
            <div className="p-3 rounded-lg bg-[#06111F] border border-slate-800 text-[10px] text-slate-400 leading-tight">
              Illustrative Data — Graph edges correspond to curated ChEMBL/Open Targets records and PubMed literature extraction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
