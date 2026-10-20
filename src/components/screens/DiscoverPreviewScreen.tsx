import React, { useState } from 'react';
import { NavigationTab } from '../../types';
import { RadarChart } from '../scientific/RadarChart';
import {
  Sparkles,
  Download,
  AlertTriangle,
  RotateCw,
  Sliders,
  CheckCircle2,
  Atom,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DiscoverPreviewScreenProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DiscoverPreviewScreen: React.FC<DiscoverPreviewScreenProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<'generate' | 'optimize' | 'validate' | 'results'>('results');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Simulated generation of 50 new analogues completed.');
    }, 1200);
  };

  const generatedAnalogues = [
    { name: '1,2-dimethoxy-12-methyl-9H...', mw: 378.27, logp: 2.36, binding: 12.5, smiles: 'CC1=C(C=C2C(=C1)C=CC(=O)N2)OC' },
    { name: '(E,R)-7,7-bis(4-hydroxy-5-...', mw: 391.31, logp: 2.18, binding: 10.4, smiles: 'CC(C)C1=CC(=C(C=C1)O)C2=CC=C(C=C2)O' },
    { name: '1-methyl-4-(2-tricyclo[3.3...', mw: 364.44, logp: 3.12, binding: 16.1, smiles: 'CC1=CC2=C(C=C1)C3=C(C=CC=C3)N2' },
    { name: 'tris(4-methylphenyl)borane...', mw: 326.15, logp: 2.81, binding: 18.1, smiles: 'CC1=CC=C(C=C1)B(C2=CC=C(C=C2)C)C3=CC=C(C=C3)C' },
    { name: '1,2-dimethoxy-12-methyl-5H...', mw: 388.35, logp: 2.84, binding: 16.3, smiles: 'COC1=C(C=C2C(=C1)C(=O)C3=CC=CC=C3C2=O)OC' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Notice: Experimental Module Clearly Separated */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            <strong>FUTURE PREVIEW MODULE:</strong> ReThera Discover (De Novo Molecular Design & Optimization) is scheduled for subsequent releases. Drug repurposing and evidence integration remain the primary core product.
          </span>
        </div>
        <button
          onClick={() => onNavigate('repurposing')}
          className="text-purple-300 hover:text-white font-mono text-[11px] underline whitespace-nowrap"
        >
          Return to Core Repurposing →
        </button>
      </div>

      {/* Main Header (Image 2 Top Right Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
              REINVENT4 GENERATIVE PIPELINE
            </span>
            <span className="text-slate-400 font-mono">Seed: Lopinavir (CHEMBL729)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Generation based on Lopinavir
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Generative scaffold hopping and multi-parameter optimization for viral protease inhibitors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg p-0.5 bg-[#071321] border border-[#1C3648]">
            {['Generate', 'Optimize', 'Validate', 'Results'].map(st => (
              <button
                key={st}
                onClick={() => setActiveStep(st.toLowerCase() as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeStep === st.toLowerCase()
                    ? 'bg-[#14D9B5] text-[#06111F] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#14D9B5] to-[#31C5F4] text-[#06111F] text-xs font-bold shadow-teal-glow hover:opacity-95 transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Run Generation'}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Image 2 Top Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Input vs Generated Molecule SMILES & Structure Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4">
            {/* Input & Output SMILES Snippets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-1">
                <span className="text-teal-400 font-bold block text-[10px] uppercase">Input Compound (Lopinavir)</span>
                <p className="text-slate-300 truncate text-[11px]">CC[C@H](C)[C@@H](C(=O)N[C@H](C[C@@H](C(=O)...</p>
                <span className="text-[10px] text-slate-500 hover:text-teal-400 cursor-pointer">[View Full SMILES]</span>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-1">
                <span className="text-cyan-400 font-bold block text-[10px] uppercase">Generated Lead Molecule</span>
                <p className="text-slate-300 truncate text-[11px]">CCCCC[C@@H](C(=O)N[C@H](C[C@@H](C(=O)...</p>
                <span className="text-[10px] text-slate-500 hover:text-cyan-400 cursor-pointer">[View Full SMILES]</span>
              </div>
            </div>

            {/* Generated Molecule 2D/3D Canvas (Image 2 style) */}
            <div className="relative h-72 rounded-xl bg-[#06111F] border border-slate-800 flex items-center justify-center p-4">
              <svg viewBox="0 0 380 200" className="w-80 h-48 drop-shadow-lg">
                {/* Skeletal bonds */}
                <line x1="80" y1="100" x2="110" y2="80" stroke="#31C5F4" strokeWidth="2.5" />
                <line x1="110" y1="80" x2="140" y2="100" stroke="#31C5F4" strokeWidth="2.5" />
                <line x1="140" y1="100" x2="170" y2="80" stroke="#31C5F4" strokeWidth="2.5" />
                <line x1="170" y1="80" x2="200" y2="100" stroke="#31C5F4" strokeWidth="2.5" />
                <line x1="200" y1="100" x2="230" y2="80" stroke="#31C5F4" strokeWidth="2.5" />
                <line x1="230" y1="80" x2="260" y2="100" stroke="#31C5F4" strokeWidth="2.5" />
                {/* Piperidine ring */}
                <polygon points="50,100 65,75 95,75 110,100 95,125 65,125" fill="none" stroke="#14D9B5" strokeWidth="2" />
                {/* Carbonyl double bonds */}
                <line x1="140" y1="100" x2="140" y2="130" stroke="#FB7185" strokeWidth="3" />
                <line x1="144" y1="100" x2="144" y2="130" stroke="#FB7185" strokeWidth="1.5" />
                <text x="136" y="145" fill="#FB7185" fontSize="12" fontWeight="bold">O</text>
                {/* Nitrogen */}
                <text x="194" y="105" fill="#7C73FF" fontSize="12" fontWeight="bold">NH</text>
                {/* Phenyl ring */}
                <polygon points="260,100 285,85 315,85 330,100 315,115 285,115" fill="none" stroke="#31C5F4" strokeWidth="2" />
                <circle cx="300" cy="100" r="14" fill="none" stroke="#14D9B5" strokeWidth="1" strokeDasharray="3 3" />
              </svg>

              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                Formula: C24H32N4O3 • Polar: 2.7 • Flex: 4
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Radar Chart & ADMET Table (Image 2 style) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Radar Chart Card */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
              <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider">
                Physicochemical Radar Profile
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Bioavailability Radar</span>
            </div>

            <RadarChart />
          </div>

          {/* Physicochemical Properties & ADMET Prediction Table (Image 2 style) */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider block">
              Properties & Predicted ADMET
            </span>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Left Specs */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">LogP:</span>
                  <span className="text-slate-100 font-bold">2.8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Molecular Weight:</span>
                  <span className="text-slate-100 font-bold">412.36</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">H-bond Donors:</span>
                  <span className="text-slate-100">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">H-bond Acceptors:</span>
                  <span className="text-slate-100">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TPSA:</span>
                  <span className="text-cyan-300">78.4 Å²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rotatable Bonds:</span>
                  <span className="text-slate-100">4</span>
                </div>
              </div>

              {/* Right ADMET */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Absorption:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ High
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Distribution:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ Good
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Metabolism:</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold">
                    ! Moderate
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Excretion:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ Good
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Toxicity:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ Low Risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Structural Gallery at Bottom (Image 2 style) */}
      <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1C3648]">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-teal-400">620</span>
            <span className="text-xs text-slate-300 font-semibold">Generated Analogues in Batch</span>
            <span className="text-[10px] text-slate-400 font-mono">
              • AVD Molar mass: 378.27 • AVD LogP: 3.94 • AVD Binding Energy: -6.5 kcal/mol
            </span>
          </div>
          <button
            onClick={() => alert('Downloading 620 generated structures in SDF/CSV format...')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold hover:bg-teal-500/30 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Download results (.SDF)
          </button>
        </div>

        {/* Gallery Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {generatedAnalogues.map(item => (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] hover:border-teal-500/40 transition-colors space-y-2 cursor-pointer group"
            >
              <div className="h-20 bg-[#06111F] rounded-lg border border-slate-800 flex items-center justify-center p-2">
                <svg viewBox="0 0 100 60" className="w-20 h-12 text-teal-400">
                  <polygon points="30,15 50,15 65,30 50,45 30,45 15,30" fill="none" stroke="#31C5F4" strokeWidth="1.5" />
                  <circle cx="35" cy="30" r="6" fill="none" stroke="#14D9B5" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="65" y1="30" x2="85" y2="30" stroke="#31C5F4" strokeWidth="1.5" />
                </svg>
              </div>

              <div>
                <div className="font-bold text-[11px] text-slate-100 group-hover:text-teal-300 truncate">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex justify-between">
                  <span>MW: {item.mw}</span>
                  <span>LogP: {item.logp}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-[#1C3648] flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Binding Energy</span>
                <span className="text-teal-400 font-bold">{item.binding} kcal/mol</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Computational Caveat Notice */}
      <div className="p-4 rounded-xl bg-[#071321] border border-[#1C3648] text-[11px] text-[#8293A5] leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 block mb-0.5">Generative Chemistry Computational Notice:</strong>
          All generated chemical structures, predicted property profiles, and binding energy scores are purely computational predictions. Viable chemical synthesis, target compatibility validation, in-vitro bioassays, ADMET toxicology, and human trials are distinct stages requiring expert laboratory validation.
        </div>
      </div>
    </div>
  );
};
