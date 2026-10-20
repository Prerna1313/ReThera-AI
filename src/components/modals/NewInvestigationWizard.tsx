import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Database,
  Radio,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

interface NewInvestigationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onRunComplete: () => void;
}

export const NewInvestigationWizard: React.FC<NewInvestigationWizardProps> = ({
  isOpen,
  onClose,
  onRunComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [disease, setDisease] = useState('Breast Cancer (MONDO:0004980)');
  const [target, setTarget] = useState('ESR1 — Estrogen receptor alpha (P03372)');
  const [compound, setCompound] = useState('Tamoxifen (CHEMBL83)');
  const [question, setQuestion] = useState(
    'Identify existing approved compounds with high biological affinity and clinical support for Breast Cancer (ESR1 / PI3K pathways).'
  );
  const [investigationType, setInvestigationType] = useState('repurpose-approved');
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'Open Targets',
    'ChEMBL',
    'PubChem',
    'ClinicalTrials.gov',
    'Drugs@FDA',
    'TinyFish',
  ]);
  const [jobState, setJobState] = useState<'idle' | 'running' | 'completed' | 'partial'>('idle');
  const [jobProgressStage, setJobProgressStage] = useState(0);

  if (!isOpen) return null;

  const stages = [
    { title: 'Resolving Entities & Disambiguation', detail: 'Mapping MONDO:0004980 and UniProt:P03372...' },
    { title: 'Retrieving Curated Data from APIs', detail: 'Querying ChEMBL v33, Open Targets GraphQL, PubChem...' },
    { title: 'Building Evidence Knowledge Graph', detail: 'Assembling 8.4M relationship paths & verified edges...' },
    { title: 'Ranking Repurposing Candidates', detail: 'Applying calibrated 6-factor triage scoring model...' },
    { title: 'Searching Live Evidence via TinyFish', detail: 'Fetching latest PubMed, preprints & clinical trial updates...' },
    { title: 'Challenging Findings & Detecting Contradictions', detail: 'Screening for resistance mutations and conflicting trials...' },
    { title: 'Generating Audit-Ready Dossier', detail: 'Compiling structured report with data snapshot timestamps...' },
  ];

  const handleStartInvestigation = () => {
    setJobState('running');
    setJobProgressStage(0);

    // Simulate realistic staged pipeline progression
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setJobProgressStage(current);
      if (current >= stages.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setJobState('completed');
        }, 800);
      }
    }, 900);
  };

  const handleFinish = () => {
    onRunComplete();
    onClose();
  };

  const toggleSource = (src: string) => {
    setSelectedSources(prev =>
      prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0A1B2B] border border-[#1C3648] rounded-2xl shadow-elevated-dark flex flex-col overflow-hidden text-slate-200">
        {/* Wizard Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C3648] bg-[#071321]">
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14D9B5]" />
              New Scientific Investigation Wizard
            </h2>
            <p className="text-[11px] text-[#9BB0BF] mt-0.5">
              Structured 5-step evidence retrieval and candidate prioritization pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        {jobState === 'idle' && (
          <div className="flex items-center justify-between px-8 py-3 bg-[#06111F] border-b border-[#1C3648] text-xs">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    currentStep === step
                      ? 'bg-[#14D9B5] text-[#06111F] shadow-teal-glow'
                      : currentStep > step
                      ? 'bg-teal-500/20 text-[#14D9B5] border border-teal-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
                </span>
                <span className={`hidden sm:inline text-[11px] font-medium ${currentStep === step ? 'text-teal-300' : 'text-slate-400'}`}>
                  {step === 1 && 'Question'}
                  {step === 2 && 'Resolution'}
                  {step === 3 && 'Type'}
                  {step === 4 && 'Scope'}
                  {step === 5 && 'Run'}
                </span>
                {step < 5 && <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />}
              </div>
            ))}
          </div>
        )}

        {/* Step Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] text-xs">
          {jobState === 'idle' && (
            <>
              {/* STEP 1: Research Question */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Target Disease or Indication</label>
                    <select
                      value={disease}
                      onChange={e => setDisease(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-slate-100 text-xs focus:border-teal-400 focus:outline-none"
                    >
                      <option>Breast Cancer (MONDO:0004980)</option>
                      <option>Alzheimer's Disease (MONDO:0004975)</option>
                      <option>Type 2 Diabetes Mellitus (MONDO:0005148)</option>
                      <option>Solid Tumors (MONDO:0005070)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Target Protein or Biomarker</label>
                    <select
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-slate-100 text-xs focus:border-teal-400 focus:outline-none"
                    >
                      <option>ESR1 — Estrogen receptor alpha (P03372)</option>
                      <option>mTOR — Mechanistic target of rapamycin (P42345)</option>
                      <option>AMPK — AMP-activated protein kinase (P54646)</option>
                      <option>PARP1 — Poly [ADP-ribose] polymerase 1 (P09874)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Reference Compound (Optional)</label>
                    <input
                      type="text"
                      value={compound}
                      onChange={e => setCompound(e.target.value)}
                      placeholder="e.g. Tamoxifen, Metformin..."
                      className="w-full p-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-slate-100 text-xs focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Free-Text Research Scope & Hypothesis</label>
                    <textarea
                      rows={3}
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-slate-100 text-xs focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Entity Resolution */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-teal-300">Entity Disambiguation & Resolution Status</div>
                      <div className="text-[11px] text-teal-200/80">
                        Mapped 3 biomedical entities to canonical database registries with 98.4% confidence.
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-teal-400 text-[#06111F] font-bold text-[10px] font-mono">
                      MATCHED
                    </span>
                  </div>

                  <div className="space-y-2 font-mono">
                    <div className="p-3 rounded-lg bg-[#071321] border border-[#1C3648] flex items-center justify-between">
                      <div>
                        <div className="text-slate-200 font-bold">Disease: Breast Cancer</div>
                        <div className="text-[11px] text-slate-400">Aliases: Mammary carcinoma, Breast Neoplasm</div>
                      </div>
                      <div className="text-right">
                        <span className="text-teal-300 font-semibold">MONDO:0004980</span>
                        <div className="text-[10px] text-slate-400">Confidence: 99.2%</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#071321] border border-[#1C3648] flex items-center justify-between">
                      <div>
                        <div className="text-slate-200 font-bold">Target: Estrogen receptor alpha</div>
                        <div className="text-[11px] text-slate-400">Aliases: ER-alpha, ESR, NR3A1</div>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-300 font-semibold">UniProt: P03372</span>
                        <div className="text-[10px] text-slate-400">Gene: ESR1 (HGNC:3467)</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#071321] border border-[#1C3648] flex items-center justify-between">
                      <div>
                        <div className="text-slate-200 font-bold">Compound: Tamoxifen</div>
                        <div className="text-[11px] text-slate-400">InChIKey: NKANXQFJJICGDU-QPLCGJKRSA-N</div>
                      </div>
                      <div className="text-right">
                        <span className="text-indigo-300 font-semibold">ChEMBL: CHEMBL83</span>
                        <div className="text-[10px] text-slate-400">PubChem CID: 2733527</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Investigation Type */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="font-semibold text-slate-200 mb-1">Select Primary Research Investigation Mode</div>
                  {[
                    {
                      id: 'repurpose-approved',
                      title: 'Repurpose Approved Drugs (Primary)',
                      desc: 'Screen approved FDA/EMA compounds with high biological affinity and clinical safety baselines.',
                      badge: 'Recommended',
                    },
                    {
                      id: 'experimental-interactions',
                      title: 'Retrieve Experimentally Observed Interactions',
                      desc: 'Filter directly measured bioactivities (IC50, Kd, Ki) from ChEMBL and PubChem assays.',
                      badge: 'High Precision',
                    },
                    {
                      id: 'target-graph',
                      title: 'Explore Target-Associated Knowledge Graph',
                      desc: 'Multi-hop network traversal across pathways, phenotypic associations and co-mentions.',
                      badge: 'Multi-omic',
                    },
                    {
                      id: 'refresh-existing',
                      title: 'Refresh an Existing Investigation Snapshot',
                      desc: 'Synchronize live-web updates and check for newly published contradictory studies.',
                      badge: 'Incremental',
                    },
                  ].map(item => (
                    <div
                      key={item.id}
                      onClick={() => setInvestigationType(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        investigationType === item.id
                          ? 'bg-[#0D2233] border-teal-400 shadow-teal-glow'
                          : 'bg-[#071321] border-[#1C3648] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-100">{item.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 4: Evidence Scope */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-200 mb-2">Connected Biomedical Data Sources</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Open Targets',
                        'ChEMBL',
                        'PubChem',
                        'ClinicalTrials.gov',
                        'Drugs@FDA',
                        'PubMed / Europe PMC',
                        'Therapeutics Data Commons',
                        'TinyFish',
                      ].map(src => (
                        <div
                          key={src}
                          onClick={() => toggleSource(src)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                            selectedSources.includes(src)
                              ? 'bg-[#0D2233] border-teal-500/60 text-teal-200'
                              : 'bg-[#071321] border-[#1C3648] text-slate-400'
                          }`}
                        >
                          <span className="font-medium text-xs">{src}</span>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${selectedSources.includes(src) ? 'bg-teal-400 text-black' : 'bg-slate-700'}`}>
                            ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Evidence-Type Inclusion Filter</label>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">E1: Human / Clinical</span>
                      <span className="px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">E2: In Vivo Animal</span>
                      <span className="px-2.5 py-1 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">E3: In Vitro Assays</span>
                      <span className="px-2.5 py-1 rounded bg-slate-700 text-slate-300 border border-slate-600">E4: Computational DTI</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Run */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#06111F] border border-[#1C3648] space-y-2">
                    <div className="font-semibold text-teal-300 text-sm">Execution Summary</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong className="text-slate-400">Condition:</strong> Breast Cancer</div>
                      <div><strong className="text-slate-400">Primary Target:</strong> ESR1 (P03372)</div>
                      <div><strong className="text-slate-400">Mode:</strong> Approved Drug Repurposing</div>
                      <div><strong className="text-slate-400">Live Web:</strong> TinyFish Search & Fetch Active</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#071321] border border-[#1C3648] text-xs space-y-1">
                    <div className="font-semibold text-slate-200">What this run will do:</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>Query ChEMBL v33 for affinity measurements and known ligands</li>
                      <li>Extract target–disease genetic associations from Open Targets</li>
                      <li>Execute scoped TinyFish Search for current trial outcomes and preprints</li>
                      <li>Run the contradiction challenge engine to flag resistance mutations</li>
                      <li>Generate a reproducible, source-linked Research Dossier</li>
                    </ul>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    *Computational predictions are hypotheses for research triage, not proof of clinical efficacy or safety.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Staged Job Execution Tracker */}
          {jobState !== 'idle' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
                <div className="flex items-center gap-2">
                  <RotateCw className={`w-4 h-4 text-teal-400 ${jobState === 'running' ? 'animate-spin' : ''}`} />
                  <span className="font-bold text-slate-100 text-sm">
                    {jobState === 'running' ? 'Executing Pipeline Stages...' : 'Investigation Completed Successfully'}
                  </span>
                </div>
                <span className="text-xs font-mono text-teal-300">
                  {jobState === 'running' ? `Stage ${jobProgressStage + 1} of 7` : 'Ready'}
                </span>
              </div>

              {/* Stage List */}
              <div className="space-y-2">
                {stages.map((stg, idx) => {
                  const isDone = idx < jobProgressStage || jobState === 'completed';
                  const isCurrent = idx === jobProgressStage && jobState === 'running';

                  return (
                    <div
                      key={stg.title}
                      className={`p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-[#0D2233] border-teal-500 shadow-teal-glow'
                          : isDone
                          ? 'bg-[#071321] border-teal-500/30'
                          : 'bg-[#071321]/40 border-[#1C3648]/60 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 font-medium text-xs">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-teal-400" />
                          ) : isCurrent ? (
                            <span className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                          )}
                          <span className={isCurrent ? 'text-teal-300 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'}>
                            {stg.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isDone ? 'DONE' : isCurrent ? 'RUNNING' : 'QUEUED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6.5 mt-0.5">{stg.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-[#1C3648] bg-[#071321] flex items-center justify-between">
          {jobState === 'idle' ? (
            <>
              <button
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#1C3648] text-xs text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, 5))}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#14D9B5] text-[#06111F] text-xs font-semibold hover:bg-[#10B981] transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleStartInvestigation}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-[#14D9B5] to-[#31C5F4] text-[#06111F] text-xs font-bold shadow-teal-glow hover:opacity-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Investigation
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={handleFinish}
                disabled={jobState !== 'completed'}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#14D9B5] text-[#06111F] text-xs font-bold shadow-teal-glow hover:bg-[#10B981] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <CheckCircle2 className="w-4 h-4" />
                Open Repurposing Workbench & Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
