import React, { useState } from 'react';
import { EvidenceRecord, Investigation, NavigationTab } from '../../types';
import { isLiveEvidence, downloadBrief } from '../../data/evidence';
import {
  FileSpreadsheet,
  Download,
  Share2,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

interface ReportsLibraryScreenProps {
  evidenceRecords: EvidenceRecord[];
  onOpenEvidenceDrawer: (id: string) => void;
  investigations: Investigation[];
  onOpenReport: (reportId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ReportsLibraryScreen: React.FC<ReportsLibraryScreenProps> = ({
  evidenceRecords,
  onOpenEvidenceDrawer,
  investigations,
  onOpenReport,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const live = evidenceRecords.filter(isLiveEvidence);
  const briefs = [...new Map(live.map(record => [record.investigation_id || 'legacy', record.research_question || 'Legacy sources — question not recorded'])).entries()];

  const filteredReports = investigations.filter(inv =>
    inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.disease_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <section className="space-y-3 rounded-2xl border border-cyan-500/40 bg-[#0A1B2B] p-5">
        <h1 className="text-xl font-bold text-slate-100">Live investigation evidence briefs</h1>
        <p className="text-xs text-slate-400">Researcher-authored briefs with source material and provenance. Pending and rejected sources retain their review status in exports.</p>
        {!briefs.length && <button onClick={() => onNavigate('evidence-monitor')} className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#06111F]">Find and review your first live source</button>}
        {briefs.map(([id, question]) => {
          const sources = live.filter(record => (record.investigation_id || 'legacy') === id);
          return <article key={id} className="space-y-2 rounded-xl border border-cyan-500/30 bg-[#071321] p-4">
            <h2 className="font-semibold text-slate-100">{question}</h2>
            <p className="text-xs text-cyan-200">Live retrieval · {sources.length} sources · {sources.filter(record => record.review_status === 'Needs Review').length} need review</p>
            {sources.map(record => <button key={record.id} onClick={() => onOpenEvidenceDrawer(record.id)} className="block text-left text-xs text-cyan-300 hover:underline">{record.title} · {record.source_provider} · {record.review_status}</button>)}
            <button onClick={() => downloadBrief(sources, question)} className="rounded-lg border border-teal-500/40 px-3 py-2 text-xs font-semibold text-teal-200">Download investigation evidence brief (.md)</button>
          </article>;
        })}
      </section>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono text-[10px] border border-teal-500/30">
              SAMPLE DOSSIER ARCHIVE
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Illustrative report fixtures
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Research Dossiers & Reports Library
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Preview sample dossiers. Export live investigation briefs from Evidence Monitor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCompareMode(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              compareMode
                ? 'bg-teal-500 text-[#06111F] border-teal-400 shadow-teal-glow'
                : 'bg-[#071321] text-slate-300 border-[#1C3648] hover:bg-[#0D2233]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {compareMode ? 'Exit Version Diff' : 'Compare Run Versions'}
          </button>
        </div>
      </div>

      {/* Version Diff Callout if active */}
      {compareMode && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs space-y-2">
          <div className="font-bold text-teal-300 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-teal-400" />
            Sample comparison: BRCA-001 (Snapshot 2026-10-20) vs BRCA-001 (Snapshot 2026-04-12)
          </div>
          <p className="text-slate-300 text-[11px]">
            Illustrative report preview. This record does not represent a live TinyFish retrieval or an evidence-driven candidate rank change.
          </p>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="p-3.5 rounded-xl bg-[#0A1B2B] border border-[#1C3648] flex items-center gap-3">
        <Search className="w-4 h-4 text-teal-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by dossier title, investigation ID, or disease..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map(inv => (
          <div
            key={inv.id}
            onClick={() => onOpenReport(inv.id)}
            className="p-5 rounded-2xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] hover:border-teal-500/50 cursor-pointer transition-all group space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#071321] text-teal-300 border border-teal-500/20 font-bold">
                {inv.id}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {inv.last_updated}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-teal-300 transition-colors">
                {inv.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {inv.disease_name} • Target: <span className="text-cyan-400 font-mono">{inv.target_name}</span>
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60 text-[11px] font-mono flex items-center justify-between text-slate-400">
              <span>{inv.candidates_count} Candidates Ranked</span>
              <span className="text-teal-400">{inv.snapshot_version.split('(')[0]}</span>
            </div>

            <div className="pt-2 border-t border-[#1C3648] flex items-center justify-between text-xs">
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
              </span>
              <span className="text-teal-400 group-hover:translate-x-1 inline-flex items-center gap-1 font-semibold transition-transform">
                Open Dossier <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
