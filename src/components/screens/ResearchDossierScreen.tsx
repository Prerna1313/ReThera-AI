import React, { useState } from 'react';
import { Candidate, EvidenceRecord, NavigationTab } from '../../types';
import { EvidenceBreakdownChart } from '../scientific/EvidenceBreakdownChart';
import { StatusBadge } from '../scientific/StatusBadge';
import { FactorScoreBar } from '../scientific/FactorScoreBar';
import {
  Download,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Printer,
  ChevronDown,
  Layers,
  BookOpen,
} from 'lucide-react';

interface ResearchDossierScreenProps {
  candidates: Candidate[];
  evidenceRecords: EvidenceRecord[];
  onNavigate: (tab: NavigationTab, candidateId?: string) => void;
}

export const ResearchDossierScreen: React.FC<ResearchDossierScreenProps> = ({
  candidates,
  evidenceRecords,
  onNavigate,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      window.print();
      return;
    }

    const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['record_type', 'name_or_title', 'identifier_or_url', 'score_or_direction', 'evidence_type', 'review_status', 'fetched_source_text', 'limitations_and_review_notes'],
      ...candidates.map(candidate => [
        'Illustrative candidate', candidate.name, `${candidate.chembl_id}; ${candidate.pubchem_cid}`,
        candidate.priority_score, 'Static sample score', 'Not scientifically validated', '', candidate.rationale,
      ]),
      ...evidenceRecords.filter(record => record.source_provider === 'TinyFish Search & Fetch').map(record => [
        'TinyFish source record', record.title, record.url, record.direction, record.category,
        record.review_status, record.claim, `Retrieved ${record.retrieved_date}. ${record.limitations} ${record.reviewer_notes || ''}`,
      ]),
    ];
    const csv = rows.map(row => row.map(cell).join(',')).join('\r\n');
    const file = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `rethera-brca-001-dossier-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1_000);
    setDownloading('csv');
    window.setTimeout(() => setDownloading(null), 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Dossier Header Card */}
      <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-elevated-dark space-y-4">
        <div role="note" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
          Example dossier generated from static prototype records. Candidate scores, example evidence claims, and citations have not been verified. Live TinyFish source records appear below and do not change this sample ranking.
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                DOSSIER ID: BRCA-001
              </span>
              <span className="text-slate-400">
                Prototype preview · static candidate data
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                SAMPLE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Breast Cancer Repurposing Analysis
            </h1>
            <p className="text-xs text-[#9BB0BF] mt-1">
              Comprehensive evidence-backed investigation for target ESR1 and associated oncogenic signaling pathways
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleExport('pdf')}
              disabled={downloading === 'pdf'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#14D9B5] to-[#31C5F4] text-[#06111F] text-xs font-bold shadow-teal-glow hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
            Print / Save PDF
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={downloading === 'csv'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071321] text-slate-200 border border-[#1C3648] hover:bg-[#0D2233] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              Export CSV
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#071321] text-slate-300 border border-[#1C3648] hover:text-white transition-colors"
              title="Share Research Dossier"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Snapshot & Model Specs Bar */}
        <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div>
            Data Snapshot: <span className="text-slate-200">Illustrative local prototype records</span>
          </div>
          <div>
            Ranking Model: <span className="text-teal-400">Static illustrative scores · not evaluated</span>
          </div>
        </div>
      </div>

      {/* Upper Summary Grid: Key Highlights & Evidence Breakdown (Image 2 style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left 6 cols: Highlights */}
        <div className="md:col-span-6 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
          <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider block">
            Executive Investigation Highlights
          </span>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#071321] border border-teal-500/30">
              <div className="font-bold text-teal-300 mb-0.5">Sample score: Tamoxifen (0.92)</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Example record only. This score is static demo data, not a validated result or clinical estimate.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#071321] border border-cyan-500/30">
              <div className="font-bold text-cyan-300 mb-0.5">Sample candidate: Metformin (0.87)</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Example record only. This is not an evidence-validated repurposing lead.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#071321] border border-rose-500/30">
              <div className="font-bold text-rose-300 mb-0.5">Example contradiction record · not live-verified</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Static fixture for demonstrating how contradictory evidence could be presented.
              </p>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Evidence Breakdown Donut Chart */}
        <div className="md:col-span-6">
          <EvidenceBreakdownChart />
        </div>
      </div>

      {/* 12 Structured Report Sections */}
      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        {/* Section 1: Executive Summary */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-teal-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono text-[10px]">1</span>
            Executive Summary
          </h2>
          <p>
            This screen illustrates a possible dossier layout for a breast-cancer research question. It displays {candidates.length} static sample candidate records; no compounds were screened by this application, and no live database or TinyFish result produced these ranks.
          </p>
        </div>

        {/* Section 2: Research Question & Scope */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-teal-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono text-[10px]">2</span>
            Research Question & Inclusion Criteria
          </h2>
          <div className="p-3 rounded-xl bg-[#071321] font-mono text-[11px] space-y-1">
            <div><strong>Disease Ontology:</strong> MONDO:0004980 (Breast Cancer)</div>
            <div><strong>Primary Target:</strong> UniProt:P03372 (ESR1)</div>
            <div><strong>Compound Space:</strong> Small molecules approved by FDA or EMA</div>
            <div><strong>Minimum Bioactivity Threshold:</strong> IC50 / Kd &lt; 10 µM in human cellular or enzymatic assays</div>
          </div>
        </div>

        {/* Section 3: Candidate Rankings Table */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-teal-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono text-[10px]">3</span>
            Ranked Candidate Shortlist & Factor Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1C3648] text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2 px-2">Rank</th>
                  <th className="py-2 px-2">Compound</th>
                  <th className="py-2 px-2">Known Indication</th>
                  <th className="py-2 px-2">Target</th>
                  <th className="py-2 px-2">Priority Score</th>
                  <th className="py-2 px-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C3648]/40">
                {candidates.map(cand => (
                  <tr key={cand.id} className="hover:bg-[#071321] cursor-pointer" onClick={() => onNavigate('candidate-details', cand.id)}>
                    <td className="py-2.5 px-2 font-mono font-bold text-teal-400">#{cand.rank}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-100">{cand.name}</td>
                    <td className="py-2.5 px-2 text-slate-300">{cand.known_indication}</td>
                    <td className="py-2.5 px-2 font-mono text-cyan-300">{cand.predicted_target}</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-teal-400">{cand.priority_score.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right text-teal-400 hover:underline">Inspect →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Supporting Evidence */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px]">4</span>
            Curated Supporting Evidence & Assay Telemetry
          </h2>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
              <span className="font-bold text-slate-100">ChEMBL83_ACT102 (ESR1 Ligand Binding Domain)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Direct measured Kd = 1.2 nM, IC50 = 15 nM in human MCF-7 assay. Competitive inhibition of 17β-estradiol validated.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
              <span className="font-bold text-slate-100">Lancet Oncology 2026 (ATLAS Trial Extended Cohort)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Continuation of Tamoxifen for 10 years conferred a 50% relative reduction in recurrence rate during years 10-14.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Contradictory or Negative Evidence */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-rose-500/40 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono text-[10px]">5</span>
            Contradictory Findings & Resistance Telemetry
          </h2>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-100">
              <span className="font-bold">Nature Medicine 2026: Activating ESR1 Y537S/D538G Mutations</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Circulating tumor DNA in 412 patients demonstrates 28.4% prevalence of activating mutations in loop 11/12, conferring ligand-independent activation and an 18-fold decrease in Tamoxifen binding affinity.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-100">
              <span className="font-bold">CYP2D6 *4 Null Allele Impairment</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Poor metabolizers fail to form therapeutically active endoxifen, resulting in an elevated hazard ratio (HR 1.48).
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Evidence Gaps & Uncertainty */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono text-[10px]">6</span>
            Identified Research Gaps & Uncertainty Factors
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-300 text-[11px]">
            <li>Sparse prospective human clinical trial data on combination synergy with CDK4/6 inhibitors in triple-negative or low-ER staining phenotypes.</li>
            <li>Lack of predictive circulating micro-RNA biomarkers to differentiate early endometrial hyperplasia from malignant endometrial carcinoma under extended adjuvant therapy.</li>
          </ul>
        </div>

        {/* Section 7: Live Web Monitoring via TinyFish */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-teal-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono text-[10px]">7</span>
            Live-Web Updates · Demo Workflow
          </h2>
          <p>
            TinyFish retrieval is on demand in Evidence Monitor. Choose a search result, fetch its page, inspect the returned text, and save it for source review. Retrieved evidence does not automatically alter the scores or content in this static example dossier.
          </p>
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-slate-200">Saved TinyFish source records ({evidenceRecords.filter(record => record.source_provider === 'TinyFish Search & Fetch').length})</h3>
            {evidenceRecords.filter(record => record.source_provider === 'TinyFish Search & Fetch').length === 0 ? (
              <p className="text-slate-400">No live source has been saved yet. Run a Search and Fetch in Evidence Monitor to add one here.</p>
            ) : evidenceRecords.filter(record => record.source_provider === 'TinyFish Search & Fetch').map(record => (
              <article key={record.id} className="rounded-lg border border-[#1C3648] bg-[#071321] p-3 space-y-2">
                <a className="font-semibold text-cyan-300 hover:underline" href={record.url} target="_blank" rel="noreferrer">{record.title} ↗</a>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge type="category" value={record.category} />
                  <StatusBadge type="direction" value={record.direction} />
                  <StatusBadge type="review" value={record.review_status} />
                </div>
                <p className="text-[10px] text-slate-400">Retrieved {record.retrieved_date}. Verify the original source before using its contents.</p>
              </article>
            ))}
          </div>
        </div>

        {/* Section 8: Methodology & Data Sources */}
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-2">
          <h2 className="font-bold text-sm text-teal-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono text-[10px]">8</span>
            Methodology & Citations
          </h2>
          <p className="text-[11px] text-slate-300">
            Citations: Open Targets Platform (CC0 1.0), ChEMBL v33 (CC BY-SA 3.0), PubChem PUG REST, ClinicalTrials.gov REST API v2, Therapeutics Data Commons (TDC).
          </p>
        </div>
      </div>

      {/* Mandatory UI Disclaimer in Footer */}
      <div className="p-5 rounded-2xl bg-[#071321] border border-[#1C3648] text-xs text-[#8293A5] leading-relaxed flex items-start gap-3 shadow-inner">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 block mb-1">Mandatory Research-Support Software Notice</strong>
          ReThera AI provides computational research prioritization and evidence organization. Candidate scores, predicted interactions, similarity metrics and extracted web claims are hypotheses or summaries, not confirmation of biological activity, safety or clinical benefit. Verify original sources and obtain appropriate expert and experimental validation before making research or development decisions.
        </div>
      </div>
    </div>
  );
};
