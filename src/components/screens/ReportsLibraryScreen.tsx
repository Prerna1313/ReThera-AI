import React, { useState } from 'react';
import { Investigation, NavigationTab } from '../../types';
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
  investigations: Investigation[];
  onOpenReport: (reportId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ReportsLibraryScreen: React.FC<ReportsLibraryScreenProps> = ({
  investigations,
  onOpenReport,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);

  const filteredReports = investigations.filter(inv =>
    inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.disease_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono text-[10px] border border-teal-500/30">
              AUDIT-READY ARCHIVE
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              5 Finalized Research Dossiers • Version Controlled
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Research Dossiers & Reports Library
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Access reproducible, provenance-preserved drug repurposing dossiers with version comparison
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
            Comparing BRCA-001 (Snapshot 2026-10-20) vs BRCA-001 (Snapshot 2026-04-12)
          </div>
          <p className="text-slate-300 text-[11px]">
            New evidence added: <strong>14 live web citations</strong> retrieved via TinyFish, including Nature Medicine 2026 ESR1 Y537S resistance mutation. Priority ranking for Metformin shifted from #4 to #2 (+0.08 score delta).
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
