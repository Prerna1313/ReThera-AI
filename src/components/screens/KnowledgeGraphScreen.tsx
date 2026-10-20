import { isLiveEvidence } from '../../data/evidence';
import React, { useMemo, useState } from 'react';
import { EvidenceRecord, GraphNode, GraphEdge, NavigationTab } from '../../types';
import { KnowledgeGraphCanvas } from '../scientific/KnowledgeGraphCanvas';
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
  evidenceRecords: EvidenceRecord[];
  onNavigate: (tab: NavigationTab, candidateId?: string) => void;
  onOpenEvidenceReview: (evidenceId: string) => void;
}

export const KnowledgeGraphScreen: React.FC<KnowledgeGraphScreenProps> = ({
  nodes,
  edges,
  evidenceRecords,
  onNavigate,
  onOpenEvidenceReview,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(
    nodes.find(n => n.id === 'node-drug-tamoxifen') || nodes[0]
  );
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { graphNodes, graphEdges, liveEvidenceEdges } = useMemo(() => {
    const combinedNodes = [...nodes];
    const combinedEdges = [...edges];
    const liveEdges: GraphEdge[] = [];
    const entityNodes = new Map<string, GraphNode>();
    const liveRecords = evidenceRecords.filter(record => isLiveEvidence(record));
    const palette = {
      compound: { color: '#14D9B5', border: '#54FCD6' },
      target: { color: '#0284C7', border: '#38BDF8' },
      disease: { color: '#F43F5E', border: '#FB7185' },
    };

    liveRecords.forEach((record, index) => {
      const sourceId = `node-live-evidence-${record.id}`;
      combinedNodes.push({
        id: sourceId,
        label: record.title.length > 34 ? `${record.title.slice(0, 33)}…` : record.title,
        sublabel: `${new URL(record.url).hostname} · ${record.published_date}`.slice(0, 40),
        type: 'publication',
        x: 700,
        y: 100 + (index % 5) * 80,
        radius: 18,
        color: '#67D7C3',
        border_color: '#9EF0DF',
        meta: { liveEvidence: true, evidenceId: record.id },
      });

      const linkedEntities = [
        ...record.linked_compounds.map(label => ({ label, type: 'compound' as const })),
        ...record.linked_targets.map(label => ({ label, type: 'target' as const })),
        ...record.linked_diseases.map(label => ({ label, type: 'disease' as const })),
      ];
      linkedEntities.forEach((entity, entityIndex) => {
        const normalized = entity.label.trim().toLocaleLowerCase();
        if (!normalized) return;
        let graphNode = combinedNodes.find(node => node.type === entity.type && node.label.trim().toLocaleLowerCase() === normalized)
          || entityNodes.get(`${entity.type}:${normalized}`);
        if (!graphNode) {
          const colors = palette[entity.type];
          graphNode = {
            id: `node-live-entity-${entity.type}-${normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
            label: entity.label.slice(0, 48),
            sublabel: 'Researcher-linked entity',
            type: entity.type,
            x: 480 + entityIndex * 45,
            y: 420 + index * 18,
            radius: 23,
            color: colors.color,
            border_color: colors.border,
            meta: { liveLinked: true },
          };
          combinedNodes.push(graphNode);
          entityNodes.set(`${entity.type}:${normalized}`, graphNode);
        }
        const edge: GraphEdge = {
          id: `edge-live-${record.id}-${entity.type}-${entityIndex}`,
          source: sourceId,
          target: graphNode.id,
          label: 'researcher linked',
          direction: record.direction,
          confidence: 0,
          evidence_ids: [record.id],
        };
        combinedEdges.push(edge);
        liveEdges.push(edge);
      });
    });

    return { graphNodes: combinedNodes, graphEdges: combinedEdges, liveEvidenceEdges: liveEdges };
  }, [nodes, edges, evidenceRecords]);

  const filteredNodes = graphNodes.filter(n => {
    const matchesFilter = filterType === 'all' ? true : n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.sublabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const liveRecordsForSelectedNode = evidenceRecords.filter(record =>
    isLiveEvidence(record) && liveEvidenceEdges.some(edge =>
      (edge.source === selectedNode.id || edge.target === selectedNode.id) && edge.evidence_ids.includes(record.id),
    ),
  );

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
              {filteredNodes.length} Nodes • {graphEdges.filter(edge => filteredNodes.some(node => node.id === edge.source) && filteredNodes.some(node => node.id === edge.target)).length} Relationships • {evidenceRecords.filter(record => isLiveEvidence(record)).length} Live Sources
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Biomedical Knowledge Graph Explorer
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Live source links come from researcher-entered entity associations; sample relationships remain illustrative. Dashed edges are live source annotations and do not validate biological relationships.
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
          {['all', 'disease', 'target', 'compound', 'pathway', 'publication', 'trial'].map(t => (
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
            edges={graphEdges.filter(edge => filteredNodes.some(node => node.id === edge.source) && filteredNodes.some(node => node.id === edge.target))}
            evidenceRecords={evidenceRecords}
            selectedNodeId={selectedNode.id}
            onSelectNode={node => setSelectedNode(node)}
            onNavigateToCandidate={candId => onNavigate('candidate-details', candId)}
            onOpenEvidenceRecord={onOpenEvidenceReview}
          />

          <div className="px-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Click a source-linked edge to inspect its citation and open its review.</span>
            <span>Sample graph layout</span>
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
                <span className="text-[10px] text-slate-400 uppercase font-mono">PubChem structure preview</span>
                <div className="h-28 flex items-center justify-center bg-[#06111F] rounded-lg border border-slate-800">
                  {selectedNode.meta.pubchem_cid ? <img src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${selectedNode.meta.pubchem_cid}/PNG?record_type=2d&image_size=300x180`} alt={`PubChem structure for ${selectedNode.label}`} className="h-full w-full object-contain p-2" /> : <span className="px-4 text-center text-[11px] text-slate-500">No compound identifier is linked to this sample node.</span>}
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
                <span className="text-slate-400">Node category:</span>
                <span className="text-cyan-300">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Context:</span>
                <span className="text-slate-200">{String(selectedNode.meta.indication || selectedNode.meta.indications || (selectedNode.meta.liveEvidence ? 'TinyFish source' : 'Sample graph node'))}</span>
              </div>
            </div>

            {/* Evidence Statistics Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-center">
                <div className="font-bold font-mono text-teal-300 text-sm">{graphEdges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id).length}</div>
                <div className="text-[10px] text-slate-400">Connected relationships</div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                <div className="font-bold font-mono text-rose-300 text-sm">{selectedNode.meta.priority_score != null ? `${Math.round(Number(selectedNode.meta.priority_score) * 100)}%` : '—'}</div>
                <div className="text-[10px] text-slate-400">Sample priority</div>
              </div>
            </div>

            {liveRecordsForSelectedNode.length > 0 && <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2" aria-label="Source records linked to this graph node">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">Linked live source records</h4>
              {liveRecordsForSelectedNode.map(record => <article key={record.id} className="rounded-lg border border-[#1C3648] bg-[#06111F] p-2.5">
                <a href={record.url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold leading-snug text-cyan-200 hover:underline">{record.title}</a>
                <p className="mt-1 text-[9px] text-slate-400">{record.published_date} · {record.review_status}</p>
                <p className="mt-1 text-[10px] text-slate-300">Researcher assessment: {record.direction}</p>
                {record.researcher_brief?.finding && <p className="mt-1 text-[10px] text-slate-400 line-clamp-3">{record.researcher_brief.finding}</p>}
                <button type="button" onClick={() => onOpenEvidenceReview(record.id)} className="mt-2 text-[10px] font-semibold text-teal-300 hover:text-white">Open source review</button>
              </article>)}
              <p className="text-[9px] text-amber-200">Entity links and assessments are researcher-entered; review the original source.</p>
            </section>}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => selectedNode.type === 'compound'
                  ? onNavigate('candidate-details', String(selectedNode.meta.candidate_id || selectedNode.id.replace('node-drug-', '')))
                  : onNavigate('evidence-monitor')}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#14D9B5] text-[#06111F] font-bold text-xs shadow-teal-glow hover:bg-[#10B981] transition-colors"
              >
                {selectedNode.type === 'compound' ? 'View Candidate Details' : 'Search Live Evidence'} <ArrowRight className="w-3.5 h-3.5" />
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
              Solid relationships and confidence values are sample data. Dashed live source links are researcher annotations, not validated biological relationships.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
