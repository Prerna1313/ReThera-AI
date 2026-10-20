import React from 'react';
import { X, BookOpen, ShieldAlert, Cpu, CheckCircle2, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0A1B2B] border border-[#1C3648] rounded-2xl shadow-elevated-dark flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C3648] bg-[#071321]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-base text-white">ReThera AI — Researcher Guide & Scientific Standards</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          <section aria-labelledby="brand-meaning" className="space-y-2">
            <h3 id="brand-meaning" className="font-bold text-sm text-teal-300">Reimagining Therapeutics with AI</h3>
            <p className="text-slate-300">Evidence-driven intelligence for therapeutic discovery.</p>
            <dl className="space-y-2 text-slate-300">
              <div><dt className="font-semibold text-slate-100">Re — Repurpose &amp; Reposition</dt><dd>Explore whether existing drugs merit investigation beyond their original indications.</dd></div>
              <div><dt className="font-semibold text-slate-100">Thera — Therapeutics</dt><dd>Connect medicines, biological targets, diseases, and biomedical evidence.</dd></div>
              <div><dt className="font-semibold text-slate-100">AI — Artificial Intelligence</dt><dd>Integrate evidence, prioritize candidate hypotheses, and identify research gaps.</dd></div>
            </dl>
            <p className="text-slate-400">This is a proposed interpretation of the brand name, rather than an official acronym established by the technical proposal.</p>
            <p className="text-slate-300"><strong>Mission:</strong> Turn fragmented biomedical knowledge into traceable drug-repurposing hypotheses.</p>
            <p className="text-slate-300"><strong>Vision:</strong> Help researchers investigate promising therapeutic possibilities more efficiently, transparently, and systematically.</p>
            <p className="text-slate-400">The initial product focuses on drug repurposing and evidence-backed research. TinyFish evidence retrieval is planned; this prototype uses demo records. ReThera Discover could later extend the platform into computational molecule generation and optimization. These capabilities do not establish safety or efficacy.</p>
          </section>
          {/* Section 1: Core Product Mission */}
          <div>
            <h3 className="font-bold text-sm text-teal-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              1. Evidence-First Drug Repurposing Principles
            </h3>
            <p className="text-slate-300">
              ReThera AI is an evidence-first biomedical intelligence platform designed to prioritize repurposing leads for computational biologists and translational pharmacology teams. The core workflow adheres to:
              <br />
              <span className="font-mono text-cyan-300">
                Resolve Entity ➔ Retrieve Evidence ➔ Construct Graph ➔ Rank Hypotheses ➔ Retrieve New Sources (TinyFish, planned) ➔ Review Contradictions ➔ Export Dossier (planned).
              </span>
            </p>
          </div>

          {/* Section 2: Priority Score Interpretation */}
          <div className="p-4 rounded-xl bg-[#06111F] border border-[#1C3648] space-y-2">
            <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              2. How to Interpret the Priority Score
            </h3>
            <p className="text-slate-300">
              The Candidate Priority Score (0.0 to 1.0) is a <strong>configurable research-triage heuristic</strong>. It represents the strength of multi-source biomedical support and data completeness.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-[#071321] border border-slate-800">
                <div className="text-teal-400 font-bold">25% Biological Support</div>
                <div className="text-slate-400 text-[10px]">Open Targets genetic links</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-slate-800">
                <div className="text-teal-400 font-bold">25% Pharmacology</div>
                <div className="text-slate-400 text-[10px]">Measured ChEMBL Kd/IC50</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-slate-800">
                <div className="text-teal-400 font-bold">15% Computational</div>
                <div className="text-slate-400 text-[10px]">DTI & Morgan fingerprints</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-slate-800">
                <div className="text-teal-400 font-bold">10% Human Context</div>
                <div className="text-slate-400 text-[10px]">Trial registries & FDA labels</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-slate-800">
                <div className="text-teal-400 font-bold">10% Live Evidence</div>
                <div className="text-slate-400 text-[10px]">TinyFish literature updates</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-slate-800">
                <div className="text-teal-400 font-bold">15% Provenance</div>
                <div className="text-slate-400 text-[10px]">Traceability & completeness</div>
              </div>
            </div>
            <p className="text-[11px] text-amber-300/90 italic pt-1">
              IMPORTANT: Never interpret this score as clinical probability of success or patient efficacy.
            </p>
          </div>

          {/* Section 3: Evidence Classification Tiers */}
          <div>
            <h3 className="font-bold text-sm text-indigo-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              3. Standardized Scientific Evidence Categories (E1–E5)
            </h3>
            <div className="space-y-1.5">
              <div className="p-2 rounded bg-[#071321] border border-[#1C3648] flex justify-between">
                <div><strong className="text-emerald-400 font-mono">E1: Human / Regulatory</strong> — Peer-reviewed clinical outcomes, NCT trial records, approved labels.</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-[#1C3648] flex justify-between">
                <div><strong className="text-teal-400 font-mono">E2: In Vivo</strong> — In vivo animal model or organism-level pharmacodynamic data.</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-[#1C3648] flex justify-between">
                <div><strong className="text-cyan-400 font-mono">E3: In Vitro / Assay</strong> — Direct measured binding affinity (Kd, Ki, IC50), enzymatic or cell-line assays.</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-[#1C3648] flex justify-between">
                <div><strong className="text-indigo-400 font-mono">E4: Computational</strong> — Molecular docking, DTI deep learning predictions, QSAR/ADMET estimates.</div>
              </div>
              <div className="p-2 rounded bg-[#071321] border border-[#1C3648] flex justify-between">
                <div><strong className="text-slate-400 font-mono">E5: Inferred / Hypothesis</strong> — Multi-hop knowledge graph path traversal or mechanistic inferences.</div>
              </div>
            </div>
          </div>

          {/* Section 4: Mandatory Regulatory Notice */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Required Research-Support Notice
            </div>
            <p className="text-[11px] leading-relaxed">
              ReThera AI provides computational research prioritization and evidence organization. Candidate scores, predicted interactions, similarity metrics and extracted web claims are hypotheses or summaries, not confirmation of biological activity, safety or clinical benefit. Verify original sources and obtain appropriate expert and experimental validation before making research or development decisions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1C3648] bg-[#071321] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#14D9B5] text-[#06111F] text-xs font-semibold hover:bg-[#10B981] transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
