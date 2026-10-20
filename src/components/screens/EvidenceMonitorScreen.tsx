import React, { useState } from 'react';
import { EvidenceRecord, NavigationTab } from '../../types';
import { StatusBadge } from '../scientific/StatusBadge';
import {
  Search,
  Filter,
  RefreshCw,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  History,
} from 'lucide-react';

interface EvidenceMonitorScreenProps {
  evidenceList: EvidenceRecord[];
  onOpenEvidenceDrawer: (evidenceId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const EvidenceMonitorScreen: React.FC<EvidenceMonitorScreenProps> = ({
  evidenceList,
  onOpenEvidenceDrawer,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'monitored' | 'library'>('recent');
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord>(evidenceList[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshTinyFish = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const filteredEvidence = evidenceList.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.source_provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              TINYFISH LIVE SEARCH & FETCH
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Quota: 1,000 URLs/day (642 remaining) • 99.8% Sync Integrity
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Live Evidence Monitor
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Discover and extract current clinical outcomes, regulatory approvals, and preprint findings beyond structured databases
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshTinyFish}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#14D9B5] to-[#31C5F4] text-[#06111F] text-xs font-bold shadow-teal-glow hover:opacity-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Running Fetch...' : 'Run Live Search & Fetch'}
          </button>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="p-4 rounded-xl bg-[#0A1B2B] border border-[#1C3648] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'recent', label: `Recent Findings (${evidenceList.length})` },
              { id: 'monitored', label: 'Monitored Candidates (8)' },
              { id: 'library', label: 'Source Library (120)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-[#071321] text-slate-400 border border-[#1C3648] hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Last sync: 2 hours ago via TinyFish Agent v1.2</span>
          </div>
        </div>

        {/* Live Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search new publications, NCT trials, FDA updates, or candidate drugs (e.g. Tamoxifen resistance)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main 12-Col Split Grid: Feed (8 cols) / Selected Evidence Side Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 cols: Results Table */}
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-2xl bg-[#0A1B2B] border border-[#1C3648] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C3648] bg-[#071321] text-[#9BB0BF] font-mono text-[10px] uppercase">
                    <th className="py-3 px-3">Source Title & Citation</th>
                    <th className="py-3 px-3">Provider</th>
                    <th className="py-3 px-3">Linked Entities</th>
                    <th className="py-3 px-3">Direction</th>
                    <th className="py-3 px-3">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C3648]/50">
                  {filteredEvidence.map(ev => {
                    const isSelected = selectedRecord?.id === ev.id;
                    return (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedRecord(ev)}
                        className={`hover:bg-[#071321] transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-semibold text-slate-100 hover:text-cyan-300 line-clamp-1">
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {ev.published_date} • {ev.retrieved_date.split(' ')[0]}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-[11px] text-slate-300 font-mono">
                          {ev.source_provider.split('/')[0]}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {ev.linked_compounds.map(c => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300">
                                {c.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge type="direction" value={ev.direction} />
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge type="review" value={ev.review_status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Selected Evidence Side Inspection Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C3648]">
            <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              Evidence Extraction Telemetry
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#071321] text-cyan-300 border border-cyan-500/30">
              {selectedRecord.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-100 leading-snug mb-1">
                {selectedRecord.title}
              </h4>
              <a
                href={selectedRecord.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 break-all"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                {selectedRecord.url}
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge type="category" value={selectedRecord.category} />
              <StatusBadge type="direction" value={selectedRecord.direction} />
              <StatusBadge type="review" value={selectedRecord.review_status} />
            </div>

            {/* Extracted Claim Box */}
            <div className={`p-3.5 rounded-xl border leading-relaxed text-[11px] ${
              selectedRecord.direction === 'contradicts'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                : 'bg-[#071321] border-[#1C3648] text-slate-200'
            }`}>
              <span className="font-bold uppercase tracking-wider text-[9px] block mb-1 opacity-75">
                Extracted Finding:
              </span>
              {selectedRecord.claim}
            </div>

            {/* Metadata specs */}
            <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-1.5 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>Extraction Confidence:</span>
                <span className="text-cyan-300 font-bold">{(selectedRecord.extraction_confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Published Date:</span>
                <span className="text-slate-300">{selectedRecord.published_date}</span>
              </div>
              <div className="flex justify-between">
                <span>Retrieved Date:</span>
                <span className="text-teal-300">{selectedRecord.retrieved_date}</span>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-1 text-[10px] font-mono text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider block">Provenance Steps:</span>
              <div className="p-2 rounded bg-[#06111F] border border-slate-800 space-y-1">
                {selectedRecord.audit_trail.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Full Review Drawer CTA */}
            <div className="pt-2">
              <button
                onClick={() => onOpenEvidenceDrawer(selectedRecord.id)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D2233] text-cyan-300 border border-cyan-500/40 hover:bg-[#112D42] text-xs font-semibold transition-colors"
              >
                Open Full Audit Drawer & Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
