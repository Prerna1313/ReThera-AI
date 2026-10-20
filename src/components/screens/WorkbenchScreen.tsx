import React, { useState } from 'react';
import { Candidate, NavigationTab } from '../../types';
import { FactorScoreBar } from '../scientific/FactorScoreBar';
import { StatusBadge } from '../scientific/StatusBadge';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  RotateCcw,
  Layers,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';

interface WorkbenchScreenProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenCompare: (selected: Candidate[]) => void;
}

export const WorkbenchScreen: React.FC<WorkbenchScreenProps> = ({
  candidates,
  onSelectCandidate,
  onNavigate,
  onOpenCompare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedDisease = 'Breast Cancer (ER+)';
  const [selectedTarget, setSelectedTarget] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [onlyContradictions, setOnlyContradictions] = useState(false);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.known_indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.predicted_target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chembl_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.smiles.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContradiction = onlyContradictions ? c.contradiction_flag : true;
    const matchesTarget = selectedTarget === 'All' || c.predicted_target === selectedTarget;
    const matchesStatus = selectedStatus === 'All' || c.clinical_status === selectedStatus;
    return matchesSearch && matchesContradiction && matchesTarget && matchesStatus;
  });

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleCompareClick = () => {
    const selectedObjs = candidates.filter(c => selectedForCompare.includes(c.id));
    if (selectedObjs.length > 0) {
      onOpenCompare(selectedObjs);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono text-[10px] border border-teal-500/30">
              INVESTIGATION: BRCA-001
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Snapshot: 2026-10-20 • ChEMBL v33 & Open Targets
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Drug Repurposing Workbench
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Identify and prioritize approved compounds for Breast Cancer (ER+ / ESR1 & PI3K/mTOR pathways)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedForCompare.length > 0 && (
            <button
              onClick={handleCompareClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 text-[#06111F] text-xs font-bold shadow-teal-glow animate-pulse"
            >
              Compare Selected ({selectedForCompare.length})
            </button>
          )}

          <button
            onClick={() => onNavigate('evidence-monitor')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#071321] hover:bg-[#0D2233] border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Evidence
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#071321] hover:bg-[#0D2233] border border-[#1C3648] text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Dossier
          </button>
        </div>
      </div>

      {/* Filter Row (Matching Image 2 Middle Left) */}
      <div className="p-4 rounded-xl bg-[#0A1B2B] border border-[#1C3648] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search candidate, target, SMILES..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Disease Dropdown */}
          <div>
            <select
              value={selectedDisease}
              disabled
              aria-label="Disease: prototype includes Breast Cancer ER+ only"
              title="This prototype includes one breast cancer investigation"
              className="w-full p-2 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-200 focus:outline-none focus:border-teal-400"
            >
              <option>Breast Cancer (ER+)</option>
            </select>
          </div>

          {/* Target Dropdown */}
          <div>
            <select
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-200 focus:outline-none focus:border-teal-400"
            >
              <option value="All">Target: All (ESR1, mTOR, AMPK...)</option>
              <option value="ESR1">ESR1 (Estrogen receptor alpha)</option>
              <option value="mTOR">mTOR (Serine/threonine kinase)</option>
              <option value="AMPK">AMPK (Protein kinase)</option>
            </select>
          </div>

          {/* Clinical Status */}
          <div>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} aria-label="Clinical status" className="w-full p-2 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-200 focus:outline-none focus:border-teal-400">
              <option value="All">Status: All</option>
              <option value="Approved">Status: Approved</option>
              <option value="Phase III">Status: Phase III</option>
              <option value="Phase II">Status: Phase II</option>
              <option value="Investigational">Status: Investigational</option>
            </select>
          </div>

          {/* Contradiction Toggle & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyContradictions(prev => !prev)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                onlyContradictions
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#071321] text-slate-300 border-[#1C3648] hover:bg-[#0D2233]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Contradictions</span>
            </button>

            <button
              onClick={() => {
                setSearchTerm('');
                setOnlyContradictions(false);
                setSelectedTarget('All');
                setSelectedStatus('All');
              }}
              title="Reset Filters"
              className="p-2 rounded-lg bg-[#071321] border border-[#1C3648] text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row: Candidates (249), Graph View, Analysis */}
      <div className="flex items-center justify-between border-b border-[#1C3648] pb-2">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-[#0D2233] text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5">
            <span>Candidates ({filteredCandidates.length})</span>
          </button>
          <button
            onClick={() => onNavigate('knowledge-graph')}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            Graph View
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            Factor Analysis
          </button>
        </div>

        <div className="text-[11px] text-[#9BB0BF] font-mono">
          Showing {filteredCandidates.length} of {candidates.length} demo candidates
        </div>
      </div>

      {/* Ranked Candidate Table (High Data Density) */}
      <div className="rounded-2xl bg-[#0A1B2B] border border-[#1C3648] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1C3648] bg-[#071321] text-[#9BB0BF] font-mono text-[10px] uppercase">
                <th className="py-3 px-3 w-10 text-center">Select</th>
                <th className="py-3 px-3 w-12 text-center">Rank</th>
                <th className="py-3 px-3">Compound & Identity</th>
                <th className="py-3 px-3">Known Indication</th>
                <th className="py-3 px-3">Predicted Target</th>
                <th className="py-3 px-4 w-44">Evidence Priority Score</th>
                <th className="py-3 px-3">Clinical Status</th>
                <th className="py-3 px-3">Contradiction Flags</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3648]/50">
              {filteredCandidates.map(cand => {
                const isSelected = selectedForCompare.includes(cand.id);
                const isExpanded = expandedCandidateId === cand.id;

                return (
                  <React.Fragment key={cand.id}>
                    <tr
                      className={`hover:bg-[#071321] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-teal-500/5' : ''
                      }`}
                      onClick={() => onSelectCandidate(cand.id)}
                    >
                      {/* Checkbox for Compare */}
                      <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(cand.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-[#071321] text-teal-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                        #{cand.rank}
                      </td>

                      {/* Compound Name & 2D Thumbnail */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {/* Mini 2D chemical structure icon */}
                          <div className="w-8 h-8 rounded bg-[#06111F] border border-[#1C3648] flex items-center justify-center p-1 text-[8px] font-mono text-teal-400">
                            C₂₆
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                              {cand.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cand.chembl_id} • MW: {cand.mw}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Known Indication */}
                      <td className="py-3 px-3 text-slate-200">
                        {cand.known_indication}
                      </td>

                      {/* Predicted Target */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {cand.predicted_target}
                        </span>
                      </td>

                      {/* Evidence Priority Score */}
                      <td
                        className="py-3 px-4"
                        onClick={e => {
                          e.stopPropagation();
                          setExpandedCandidateId(isExpanded ? null : cand.id);
                        }}
                      >
                        <FactorScoreBar score={cand.priority_score} />
                      </td>

                      {/* Clinical Status */}
                      <td className="py-3 px-3">
                        <StatusBadge type="clinical" value={cand.clinical_status} />
                      </td>

                      {/* Contradiction Flags */}
                      <td className="py-3 px-3">
                        {cand.contradiction_flag ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            {cand.contradiction_count} flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Clean
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectCandidate(cand.id);
                          }}
                          className="text-teal-400 hover:text-teal-300 font-semibold text-xs inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Factor-Level Breakdown Row */}
                    {isExpanded && (
                      <tr className="bg-[#06111F]/90 border-b border-[#1C3648]">
                        <td colSpan={9} className="p-4">
                          <FactorScoreBar
                            score={cand.priority_score}
                            factorScores={cand.factor_scores}
                            showBreakdown={true}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Heuristic Notice Footnote */}
        <div className="p-3 bg-[#071321] border-t border-[#1C3648] text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            *Priority score represents an automated research-triage heuristic. It is not an experimental binding proof or clinical probability of success.
          </span>
          <button
            onClick={() => onNavigate('reports')}
            className="text-teal-400 hover:underline font-mono text-[10px]"
          >
            Review Scoring Methodology & Weights
          </button>
        </div>
      </div>
    </div>
  );
};
