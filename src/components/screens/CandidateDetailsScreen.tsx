import React, { useState } from 'react';
import { Candidate, NavigationTab, EvidenceRecord } from '../../types';
import { MoleculeViewer } from '../scientific/MoleculeViewer';
import { StatusBadge } from '../scientific/StatusBadge';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Dna,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface CandidateDetailsScreenProps {
  candidate: Candidate;
  evidenceRecords: EvidenceRecord[];
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenEvidenceReview: (evidenceId: string) => void;
}

export const CandidateDetailsScreen: React.FC<CandidateDetailsScreenProps> = ({
  candidate,
  evidenceRecords,
  onBack,
  onNavigate,
  onOpenEvidenceReview,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'evidence' | 'trials' | 'properties' | 'related'>('overview');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const linkedLiveEvidence = evidenceRecords.filter(record =>
    record.source_provider === 'TinyFish Search & Fetch' &&
    record.linked_compounds.some(name => name.toLowerCase() === candidate.name.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-[#31C5F4] hover:text-[#14D9B5] mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Repurposing Shortlist
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {candidate.name}
              </h1>
              <StatusBadge type="clinical" value={candidate.clinical_status} />
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-200 border border-amber-500/20">
                Illustrative candidate fixture
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
              <span>ChEMBL: <strong className="text-slate-200">{candidate.chembl_id}</strong></span>
              <span>•</span>
              <span>PubChem CID: <strong className="text-slate-200">{candidate.pubchem_cid}</strong></span>
              <span>•</span>
              <span>Sample priority score: <strong className="text-teal-400 font-bold">{candidate.priority_score.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsWatchlisted(prev => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isWatchlisted
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-[#071321] text-slate-300 border-[#1C3648] hover:bg-[#0D2233]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
              {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#14D9B5] to-[#31C5F4] text-[#06111F] text-xs font-bold shadow-teal-glow hover:opacity-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Dossier
            </button>
          </div>
        </div>

        {/* Detail Tabs Bar */}
        <div className="flex items-center gap-2 border-t border-[#1C3648] pt-3 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'targets', label: 'Targets & Affinity' },
            { id: 'evidence', label: `Evidence (${candidate.supporting_evidence.length + candidate.contradictory_evidence.length + linkedLiveEvidence.length})` },
            { id: 'trials', label: 'Clinical trials (sample)' },
            { id: 'properties', label: 'Properties & ADMET' },
            { id: 'related', label: 'Similar Analogues' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#14D9B5] text-[#06111F] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#071321]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Molecular Structure & Physicochemical Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive 3D / 2D Molecule Viewer */}
          <MoleculeViewer
            name={candidate.name}
            smiles={candidate.smiles}
            inchikey={candidate.inchikey}
            formula={candidate.formula}
            mw={candidate.mw}
            pubchemCid={candidate.pubchem_cid}
          />

          {/* Key Physicochemical Properties Spec Card */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider block">
              Physicochemical Constants & Descriptors
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Mol Weight</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{candidate.mw} g/mol</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">LogP</div>
                <div className="text-teal-400 font-bold text-sm mt-0.5">{candidate.logp}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">H-Bond Donors</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{candidate.hbd}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">H-Bond Acceptors</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{candidate.hba}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">TPSA</div>
                <div className="text-cyan-400 font-bold text-sm mt-0.5">{candidate.tpsa} Å²</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Rotatable Bonds</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{candidate.rotatable_bonds}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Lipinski Rule of 5</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">Passed</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Stereochemistry</div>
                <div className="text-slate-100 font-bold text-sm mt-0.5">(Z)-Isomer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): ADMET, Known Targets & Similarity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Predicted ADMET & Safety Card */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
              <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider">
                Predicted ADMET Profile
              </span>
              <span className="text-[10px] text-teal-400 font-mono">In-Silico Consensus Model</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60">
                <span className="text-slate-300">Absorption (Caco-2)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[11px] font-mono">
                  {candidate.admet.absorption}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60">
                <span className="text-slate-300">Distribution (PPB / Vd)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[11px] font-mono">
                  {candidate.admet.distribution}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60">
                <div>
                  <span className="text-slate-300 block">Metabolism (CYP2D6)</span>
                  <span className="text-[10px] text-amber-400 font-mono">Prodrug Bioactivation Alert</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold text-[11px] font-mono">
                  {candidate.admet.metabolism}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60">
                <span className="text-slate-300">Excretion (Clearance)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[11px] font-mono">
                  {candidate.admet.excretion}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60">
                <div>
                  <span className="text-slate-300 block">Toxicity Profile</span>
                  <span className="text-[10px] text-slate-400">Hepatic transaminase monitoring</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[11px] font-mono">
                  {candidate.admet.toxicity}
                </span>
              </div>
            </div>
          </div>

          {/* Known Targets Card */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
              <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider">
                Primary Validated Targets
              </span>
              <button
                onClick={() => onNavigate('knowledge-graph')}
                className="text-[10px] text-teal-400 hover:underline"
              >
                Inspect in Graph →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {candidate.targets.map(tgt => (
                <div key={tgt.symbol} className="p-2.5 rounded-lg bg-[#071321] border border-[#1C3648]/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{tgt.symbol} ({tgt.name})</span>
                    <span className="font-mono text-teal-400 font-bold text-[11px]">
                      {tgt.affinity_type}: {tgt.affinity_value}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{tgt.uniprot}</span>
                    <span>Source: {tgt.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chemical Similarity Search (Tanimoto Coefficients) */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider block">
              Structural Analogues & Tanimoto Similarity
            </span>

            <div className="space-y-2 text-xs font-mono">
              {candidate.similar_compounds.map(sim => (
                <div key={sim.name} className="flex items-center justify-between p-2 rounded-lg bg-[#071321] border border-[#1C3648]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-bold">{sim.name}</span>
                    <span className="text-[10px] text-slate-400">({sim.status})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold text-[11px]">
                    {sim.similarity.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400/80 italic pt-1">
              *Tanimoto similarity is a structural descriptor metric; it does not guarantee identical pharmacological action.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Balanced Tri-Column Evidence Section (Mandatory Section 5 Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Triangulated Clinical, Genomic & Experimental Evidence Dossier
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Example analysis · live records shown separately
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Supporting Evidence (Green/Teal) */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-teal-500/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1C3648]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100">Evidence Supporting Hypothesis</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono">
                {candidate.supporting_evidence.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {candidate.supporting_evidence.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => onOpenEvidenceReview(ev.id)}
                  className="p-3 rounded-xl bg-[#071321] border border-teal-500/20 hover:border-teal-400/50 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs">{ev.title}</span>
                    <span className="text-[10px] text-teal-400 font-mono">{ev.category.split(':')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ev.claim}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                    {ev.citation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Contradictions & Negative Evidence (Rose/Amber) */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-rose-500/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1C3648]">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-slate-100">Evidence Against / Contradictions</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-mono">
                {candidate.contradictory_evidence.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {candidate.contradictory_evidence.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => onOpenEvidenceReview(ev.id)}
                  className="p-3 rounded-xl bg-[#071321] border border-rose-500/30 hover:border-rose-400/60 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs">{ev.title}</span>
                    <span className="text-[10px] text-rose-400 font-mono">{ev.category.split(':')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ev.claim}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                    {ev.citation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Unknowns and Evidence Gaps (Slate/Cyan) */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1C3648]">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">Unknowns and Evidence Gaps</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono">
                {candidate.evidence_gaps.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {candidate.evidence_gaps.map(gap => (
                <div
                  key={gap.id}
                  className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-1.5"
                >
                  <span className="font-semibold text-slate-100 text-xs block">{gap.title}</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{gap.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {linkedLiveEvidence.length > 0 && (
        <section className="rounded-2xl border border-cyan-500/30 bg-[#0A1B2B] p-5 space-y-3" aria-labelledby="live-linked-evidence-title">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C3648] pb-3">
            <div>
              <h2 id="live-linked-evidence-title" className="font-bold text-slate-100">Live sources linked by the researcher</h2>
              <p className="mt-1 text-xs text-slate-400">Fetched with TinyFish. These records do not affect the sample priority score and require source review.</p>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">{linkedLiveEvidence.length} saved</span>
          </div>
          {linkedLiveEvidence.map(record => (
            <article key={record.id} className="rounded-xl border border-[#1C3648] bg-[#071321] p-3 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <a className="text-sm font-semibold text-cyan-200 hover:underline" href={record.url} target="_blank" rel="noreferrer">{record.title} ↗</a>
                <span className="text-[10px] text-amber-200">{record.review_status}</span>
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{record.claim}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <span>{record.category} · {record.direction} · Retrieved {new Date(record.retrieved_date).toLocaleDateString()}</span>
                <button type="button" onClick={() => onOpenEvidenceReview(record.id)} className="font-semibold text-teal-300 hover:underline">Review source and audit note</button>
              </div>
              {record.linked_targets.length > 0 && <div className="text-[10px] text-slate-500">Researcher-linked target: {record.linked_targets.join(', ')}</div>}
            </article>
          ))}
        </section>
      )}

      {/* Synthesis Callout Boxes: "Why this candidate?" & "What could weaken this hypothesis?" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-teal-500/30 space-y-2">
          <div className="font-bold text-sm text-teal-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Why this candidate entered the shortlist:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tamoxifen presents the gold-standard biological mechanism for ER+ breast oncology. Strong measured pharmacology (Kd = 1.2 nM against ESR1), robust human disease-free survival benefits confirmed in the 10-year ATLAS trial, and a high genetic association score (0.94) establish this lead as the primary benchmark.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-rose-500/30 space-y-2">
          <div className="font-bold text-sm text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            What could weaken this hypothesis:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Emergence of ESR1 Y537S / D538G activating loop mutations in 28.4% of refractory patients eliminates competitive antagonist binding. Furthermore, CYP2D6 poor metabolizers experience impaired bioactivation into Endoxifen, requiring upfront pharmacogenomic sequencing before therapy selection.
          </p>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-slate-900/60 dark:bg-[#071321] border border-slate-700/60 dark:border-[#1C3648] text-[11px] text-[#8293A5] leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          ReThera AI provides computational research prioritization and evidence organization. Candidate scores, predicted interactions, similarity metrics and extracted web claims are hypotheses or summaries, not confirmation of biological activity, safety or clinical benefit. Verify original sources and obtain appropriate expert and experimental validation before making research or development decisions.
        </div>
      </div>
    </div>
  );
};
