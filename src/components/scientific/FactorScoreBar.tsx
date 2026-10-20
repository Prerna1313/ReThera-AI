import React from 'react';
import { FactorScores } from '../../types';
import { Info } from 'lucide-react';

interface FactorScoreBarProps {
  score: number;
  factorScores?: FactorScores;
  showBreakdown?: boolean;
}

export const FactorScoreBar: React.FC<FactorScoreBarProps> = ({ score, factorScores, showBreakdown = false }) => {
  // Score color gradient
  const getScoreColor = (val: number) => {
    if (val >= 0.85) return 'text-[#14D9B5] border-[#14D9B5]/40 bg-[#14D9B5]/15';
    if (val >= 0.75) return 'text-[#31C5F4] border-[#31C5F4]/40 bg-[#31C5F4]/15';
    if (val >= 0.65) return 'text-[#7C73FF] border-[#7C73FF]/40 bg-[#7C73FF]/15';
    return 'text-[#8293A5] border-[#8293A5]/40 bg-[#8293A5]/15';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${getScoreColor(score)}`}>
          {score.toFixed(2)}
        </span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#31C5F4] to-[#14D9B5] rounded-full transition-all duration-500"
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>

      {showBreakdown && factorScores && (
        <div className="mt-3 p-3 bg-slate-900/60 dark:bg-[#071321] rounded-lg border border-slate-700/50 dark:border-[#1C3648] text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">Factor-Level Score Rationale</span>
            <span className="flex items-center gap-1 text-[10px] text-teal-400">
              <Info className="w-3 h-3" /> Triage Heuristic
            </span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Biological Support (25%)</span>
                <span className="font-mono text-teal-300">{(factorScores.biological_support * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: `${factorScores.biological_support * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Measured Pharmacology (25%)</span>
                <span className="font-mono text-teal-300">{(factorScores.measured_pharmacology * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${factorScores.measured_pharmacology * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Computational Support (15%)</span>
                <span className="font-mono text-indigo-300">{(factorScores.computational_support * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400" style={{ width: `${factorScores.computational_support * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Human / Development Context (10%)</span>
                <span className="font-mono text-emerald-300">{(factorScores.human_development_context * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${factorScores.human_development_context * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Live Evidence Relevance (10%)</span>
                <span className="font-mono text-cyan-300">{(factorScores.live_evidence_relevance * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-300" style={{ width: `${factorScores.live_evidence_relevance * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-300">Evidence Coverage / Provenance (15%)</span>
                <span className="font-mono text-slate-300">{(factorScores.evidence_coverage * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400" style={{ width: `${factorScores.evidence_coverage * 100}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400/80 pt-1 border-t border-slate-800/80 italic">
            *Heuristic prioritization score for research triage. Not a clinical probability of success.
          </p>
        </div>
      )}
    </div>
  );
};
