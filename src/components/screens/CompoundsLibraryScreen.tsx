import React, { useState } from 'react';
import { Candidate, NavigationTab } from '../../types';
import { StatusBadge } from '../scientific/StatusBadge';
import { FactorScoreBar } from '../scientific/FactorScoreBar';
import {
  Search,
  Filter,
  Bookmark,
  LayoutGrid,
  List,
  ArrowRight,
  ExternalLink,
  Plus,
  Boxes,
} from 'lucide-react';

interface CompoundsLibraryScreenProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewInvestigation: () => void;
}

export const CompoundsLibraryScreen: React.FC<CompoundsLibraryScreenProps> = ({
  candidates,
  onSelectCandidate,
  onNavigate,
  onOpenNewInvestigation,
}) => {
  const [activePreset, setActivePreset] = useState<'all' | 'saved' | 'recent' | 'watchlist'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = candidates.filter(c => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chembl_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.known_indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.predicted_target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono text-[10px] border border-teal-500/30">
              CHEMICAL ENTITY REGISTRY
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              1,248 Indexed Bioactive Structures • ChEMBL v33 & PubChem
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Biomedical Compounds Library
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Searchable repository of canonical small-molecule structures, targets, and measured bioactivities
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewInvestigation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14D9B5] text-[#06111F] text-xs font-bold shadow-teal-glow hover:bg-[#10B981] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Investigation
          </button>
        </div>
      </div>

      {/* Preset Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Preset Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'all', label: 'All Compounds (1,248)' },
            { id: 'saved', label: 'Saved (42)' },
            { id: 'recent', label: 'Recently Viewed (18)' },
            { id: 'watchlist', label: 'Watchlist (12)' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePreset(p.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activePreset === p.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'bg-[#0A1B2B] text-slate-400 border border-[#1C3648] hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* View Switcher: Table vs Grid */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="p-1 rounded-lg bg-[#071321] border border-[#1C3648] flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-[#0D2233] text-teal-300' : 'text-slate-400'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#0D2233] text-teal-300' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3.5 rounded-xl bg-[#0A1B2B] border border-[#1C3648] flex items-center gap-3">
        <Search className="w-4 h-4 text-teal-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by compound name, ChEMBL ID, PubChem CID, SMILES, or indication..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white text-xs">
            Clear
          </button>
        )}
      </div>

      {/* View Mode: Table vs Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-[#0A1B2B] border border-[#1C3648] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1C3648] bg-[#071321] text-[#9BB0BF] font-mono text-[10px] uppercase">
                  <th className="py-3 px-3">Compound & Structure</th>
                  <th className="py-3 px-3">Identifiers</th>
                  <th className="py-3 px-3">Known Indications</th>
                  <th className="py-3 px-3">Targets & Affinities</th>
                  <th className="py-3 px-3">Clinical Status</th>
                  <th className="py-3 px-3">Evidence Records</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C3648]/50">
                {filteredCandidates.map(cand => (
                  <tr
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand.id)}
                    className="hover:bg-[#071321] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#06111F] border border-[#1C3648] flex items-center justify-center p-1 font-mono text-[8px] text-teal-400">
                          2D
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-teal-300">
                            {cand.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {cand.formula} • {cand.mw} g/mol
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      <div>{cand.chembl_id}</div>
                      <div className="text-[10px] text-slate-500">CID: {cand.pubchem_cid}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-200">
                      {cand.known_indication}
                    </td>

                    <td className="py-3 px-3 font-mono text-cyan-300 text-[11px]">
                      {cand.predicted_target}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge type="clinical" value={cand.clinical_status} />
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-teal-400 font-semibold">
                        {cand.evidence_count} sources
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="text-teal-400 group-hover:translate-x-1 inline-block transition-transform text-xs font-semibold">
                        Inspect →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCandidates.map(cand => (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate(cand.id)}
              className="p-4 rounded-xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] hover:border-teal-500/50 cursor-pointer transition-all group space-y-3"
            >
              <div className="h-28 bg-[#06111F] rounded-lg border border-slate-800 flex items-center justify-center p-2 font-mono text-xs text-teal-400">
                <Boxes className="w-8 h-8 text-slate-700 group-hover:text-teal-400/80 transition-colors" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-teal-300">
                    {cand.name}
                  </h3>
                  <StatusBadge type="clinical" value={cand.clinical_status} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {cand.chembl_id} • {cand.formula}
                </div>
              </div>

              <div className="text-xs text-slate-300 line-clamp-1">
                Indication: {cand.known_indication}
              </div>

              <div className="pt-2 border-t border-[#1C3648] flex items-center justify-between text-xs">
                <span className="font-mono text-teal-400 font-bold">
                  Score: {cand.priority_score.toFixed(2)}
                </span>
                <span className="text-slate-400 group-hover:text-teal-300 flex items-center gap-1 font-semibold text-[11px]">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
