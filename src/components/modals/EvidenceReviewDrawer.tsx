import { isLiveEvidence } from '../../data/evidence';
import { downloadBrief } from '../../data/evidence';
import React, { useEffect, useState } from 'react';
import { EvidenceRecord } from '../../types';
import { StatusBadge } from '../scientific/StatusBadge';
import { X, ExternalLink, CheckCircle2, AlertTriangle, AlertCircle, Clock, ShieldCheck, History } from 'lucide-react';

interface EvidenceReviewDrawerProps {
  evidence: EvidenceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (evidenceId: string, status: EvidenceRecord['review_status'], notes: string) => void;
}

export const EvidenceReviewDrawer: React.FC<EvidenceReviewDrawerProps> = ({
  evidence,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [note, setNote] = useState(evidence?.reviewer_notes || '');
  const [currentStatus, setCurrentStatus] = useState(evidence?.review_status || 'Needs Review');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNote(evidence?.reviewer_notes || '');
    setCurrentStatus(evidence?.review_status || 'Needs Review');
    setIsSaved(false);
  }, [evidence?.id, evidence?.reviewer_notes, evidence?.review_status]);

  if (!isOpen || !evidence) return null;

  const handleAction = (newStatus: EvidenceRecord['review_status']) => {
    setCurrentStatus(newStatus);
    setIsSaved(true);
    if (onUpdateStatus) {
      onUpdateStatus(evidence.id, newStatus, note);
    }
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl h-full bg-[#0A1B2B] border-l border-[#1C3648] shadow-2xl flex flex-col text-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#1C3648] bg-[#071321] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
              {evidence.id}
            </span>
            <span className="text-xs font-semibold text-slate-300">Evidence Audit & Provenance Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div role="note" className={`rounded-lg border p-3 ${isLiveEvidence(evidence) ? 'border-cyan-500/40 text-cyan-200' : 'border-amber-500/40 text-amber-200'}`}>
            {isLiveEvidence(evidence) ? 'Live retrieved source · researcher annotations. Confirming the source does not validate a biological relationship.' : 'Illustrative sample record · claims and review history are demo data.'}
          </div>
          {isLiveEvidence(evidence) && <section className="space-y-2 rounded-lg border border-cyan-500/30 p-3">
            <p><strong>Research question:</strong> {evidence.research_question || 'Not recorded (legacy record)'}</p>
            <p><strong>What remains unknown:</strong> {evidence.researcher_brief?.unknowns || 'Not recorded'}</p>
            <p><strong>Assessment:</strong> {evidence.direction} · {evidence.review_status}</p>
            <p><strong>Researcher:</strong> {evidence.researcher || 'Not recorded'} · Reviewed: {evidence.reviewed_by || 'Pending'} / {evidence.reviewed_at || 'Pending'}</p>
            <p>{evidence.content_truncated ? 'Fetched material truncated at 30,000 characters. Read the original for the remainder.' : 'Provider-returned material; may not include full publication text.'}</p>
            <details><summary>Source record context</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap">{JSON.stringify(evidence.source_context || {}, null, 2)}</pre></details>
            <button onClick={() => downloadBrief([evidence], evidence.research_question)} className="rounded border border-teal-500/40 p-2 font-semibold text-teal-200">Download this source’s evidence brief</button>
          </section>}
          {/* Title & External Link */}
          <div>
            <h3 className="font-bold text-sm text-slate-100 leading-snug mb-1">
              {evidence.title}
            </h3>
            <a
              href={evidence.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-[11px] font-mono break-all"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              {evidence.url}
            </a>
          </div>

          {/* Badges Matrix */}
          <div className="flex flex-wrap gap-2 pt-1">
            <StatusBadge type="category" value={evidence.category} />
            <StatusBadge type="direction" value={evidence.direction} />
            <StatusBadge type="review" value={currentStatus} />
          </div>

          {evidence.researcher_brief && (
            <section className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 space-y-2">
              <h3 className="font-semibold text-cyan-100 text-xs">Researcher-authored evidence brief</h3>
              <p className="text-[10px] text-slate-400">These are reviewer notes, not automated extraction or independent verification.</p>
              <dl className="space-y-2 text-xs">
                {[
                  ['Finding summary', evidence.researcher_brief.finding],
                  ['Study type', evidence.researcher_brief.study_type],
                  ['Model / population', evidence.researcher_brief.model_population],
                  ['Limitations', evidence.researcher_brief.limitations],
                ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="text-slate-100 leading-relaxed">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#06111F] border border-[#1C3648] font-mono text-[11px]">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Source Provider</div>
              <div className="text-slate-200 font-medium">{evidence.source_provider}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Published Date</div>
              <div className="text-slate-200 font-medium">{evidence.published_date}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Retrieved At</div>
              <div className="text-teal-300 font-medium">{evidence.retrieved_date}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">{isLiveEvidence(evidence) ? 'Scientific extraction' : 'Demo extraction confidence'}</div>
              <div className="text-cyan-300 font-medium">{isLiveEvidence(evidence) || evidence.extraction_confidence == null ? 'Not performed' : 'Illustrative only'}</div>
            </div>
          </div>

          {/* Extracted Claim Text */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              {isLiveEvidence(evidence) ? 'Fetched source text · not AI-interpreted' : 'Illustrative demo claim'}
            </label>
            <div className={`p-4 rounded-xl border leading-relaxed text-slate-100 text-xs ${
              evidence.direction === 'contradicts'
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-[#071321] border-[#1C3648]'
            }`}>
              {evidence.claim}
            </div>
          </div>

          {isLiveEvidence(evidence) && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
              The provider retrieved the source material. ReThera has not independently verified the source or interpreted its scientific meaning. Review the original page before confirming this record.
            </div>
          )}

          {/* Researcher-entered entity links */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Researcher-entered entity links
            </label>
            <div className="flex flex-wrap gap-2 font-mono text-[11px]">
              {evidence.linked_compounds.map(c => (
                <span key={c} className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {c}
                </span>
              ))}
              {evidence.linked_targets.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {t}
                </span>
              ))}
              {evidence.linked_diseases.map(d => (
                <span key={d} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Study Limitations */}
          <div className="p-3 rounded-lg bg-[#071321] border border-[#1C3648] text-[11px] text-slate-300">
            <span className="font-bold text-amber-400 block mb-0.5">Extraction Limitations:</span>
            {evidence.limitations}
          </div>

          {/* Audit Provenance Trail */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-teal-400" />
              Provenance & Ingestion Audit Trail
            </label>
            <div className="p-3 rounded-lg bg-[#06111F] border border-[#1C3648] space-y-1.5 font-mono text-[10px] text-slate-400">
              {evidence.audit_trail.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Notes Field */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Researcher Reviewer Notes
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add scientific context or validation remarks..."
              className="w-full p-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-slate-100 text-xs focus:border-teal-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Drawer Action Controls */}
        <div className="p-4 border-t border-[#1C3648] bg-[#071321] space-y-2">
          {isSaved && (
            <div className="text-center text-[11px] font-mono text-teal-400">
              ✓ Audit decision saved to reproducible dossier ledger
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction('Reviewed / Source Confirmed')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/40 hover:bg-teal-500/25 text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Confirm Source
            </button>

            <button
              onClick={() => handleAction('Contradictory Finding')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-semibold transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Flag Contradiction
            </button>
          </div>

          <button
            onClick={() => handleAction('Rejected / Irrelevant')}
            className="w-full py-1.5 rounded text-slate-400 hover:text-slate-200 text-[11px] hover:bg-slate-800 transition-colors"
          >
            Mark as Irrelevant / Exclude from Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
