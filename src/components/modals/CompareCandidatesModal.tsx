import React from 'react';
import { Candidate } from '../../types';
import { FactorScoreBar } from '../scientific/FactorScoreBar';
import { StatusBadge } from '../scientific/StatusBadge';
import { X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface CompareCandidatesModalProps {
  candidates: Candidate[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (candidateId: string) => void;
}

export const CompareCandidatesModal: React.FC<CompareCandidatesModalProps> = ({
  candidates,
  isOpen,
  onClose,
  onSelectCandidate,
}) => {
  if (!isOpen || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-[#0A1B2B] border border-[#1C3648] rounded-2xl shadow-elevated-dark flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C3648] bg-[#071321]">
          <div>
            <h2 className="font-bold text-base text-white">Compare Repurposing Candidates</h2>
            <p className="text-[11px] text-[#9BB0BF]">
              Side-by-side multi-factor triage comparison and ADMET profiling
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table Grid */}
        <div className="p-6 overflow-y-auto max-h-[70vh] text-xs">
          <div className="grid grid-cols-4 gap-4 pb-4 border-b border-[#1C3648]">
            <div className="text-slate-400 font-semibold uppercase text-[10px]">Evaluation Metric</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center">
                <span className="font-bold text-sm text-teal-300 block">{c.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{c.chembl_id}</span>
              </div>
            ))}
          </div>

          {/* Row 1: Priority Score */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#1C3648]/60 items-center">
            <div className="text-slate-300 font-medium">Priority Score (Triage)</div>
            {candidates.map(c => (
              <div key={c.id}>
                <FactorScoreBar score={c.priority_score} />
              </div>
            ))}
          </div>

          {/* Row 2: Indication */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#1C3648]/60 items-center">
            <div className="text-slate-300 font-medium">Known Indication</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center font-medium text-slate-200">
                {c.known_indication}
              </div>
            ))}
          </div>

          {/* Row 3: Target & Mechanism */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#1C3648]/60 items-center">
            <div className="text-slate-300 font-medium">Predicted Target</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center font-mono text-cyan-300">
                {c.predicted_target}
              </div>
            ))}
          </div>

          {/* Row 4: Regulatory Status */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#1C3648]/60 items-center">
            <div className="text-slate-300 font-medium">Regulatory Status</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center">
                <StatusBadge type="clinical" value={c.clinical_status} />
              </div>
            ))}
          </div>

          {/* Row 5: Contradiction Flag */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#1C3648]/60 items-center">
            <div className="text-slate-300 font-medium">Contradictions Noted</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center">
                {c.contradiction_flag ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" /> {c.contradiction_count} flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> None detected
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Row 6: ADMET Profile */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-[#1C3648]/60 items-center">
            <div className="text-slate-300 font-medium">ADMET Toxicity & Safety</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center font-mono text-[11px]">
                <span className="text-emerald-400">{c.admet.toxicity}</span>
                <div className="text-[10px] text-slate-400">Absorp: {c.admet.absorption} • Metab: {c.admet.metabolism}</div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-4 gap-4 pt-4 items-center">
            <div className="text-slate-400 text-xs">Inspect Full Dossier</div>
            {candidates.map(c => (
              <div key={c.id} className="text-center">
                <button
                  onClick={() => {
                    onSelectCandidate(c.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-500/40 text-xs font-semibold transition-colors"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
