import React from 'react';
import { NavigationTab, Investigation, DataSource } from '../../types';
import {
  Sparkles,
  GitBranch,
  Network,
  Cpu,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Activity,
  Atom,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (tab: NavigationTab, candidateId?: string) => void;
  onOpenNewInvestigation: () => void;
  investigations: Investigation[];
  dataSources: DataSource[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenNewInvestigation,
  investigations,
  dataSources,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner Section with Glowing Molecular Globe Visual */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071321] via-[#0A1B2B] to-[#06111F] border border-[#1C3648] p-6 md:p-8 shadow-elevated-dark">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 scientific-grid-dark opacity-35 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text & CTAs */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#14D9B5] animate-ping" />
              Reimagining Therapeutics with AI
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-[#E8F3F7] tracking-tight leading-tight">
              Evidence-driven intelligence <br />
              <span className="bg-gradient-to-r from-[#14D9B5] via-[#31C5F4] to-[#7C73FF] bg-clip-text text-transparent">
                for therapeutic discovery.
              </span>
            </h1>

            <p className="text-sm text-[#9BB0BF] leading-relaxed">
              Turn fragmented biomedical knowledge into traceable drug-repurposing hypotheses. Explore candidate relationships, review evidence for and against each hypothesis, and identify research gaps in this prototype.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenNewInvestigation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#14D9B5] to-[#31C5F4] text-[#06111F] font-bold text-xs shadow-teal-glow hover:opacity-95 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                Start New Study
              </button>

              <button
                onClick={() => onNavigate('knowledge-graph')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#31C5F4]/40 text-[#31C5F4] text-xs font-semibold transition-all hover:border-[#31C5F4]"
              >
                <Network className="w-4 h-4" />
                Explore Knowledge Graph
              </button>
            </div>
          </div>

          {/* Right Hero Molecular Visual (Image 2 style) */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 flex items-center justify-center">
            {/* Outer Glowing Orbital Rings */}
            <div className="absolute inset-0 rounded-full border border-[#14D9B5]/20 animate-spin" style={{ animationDuration: '40s' }} />
            <div className="absolute inset-4 rounded-full border border-[#31C5F4]/30 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
            <div className="absolute inset-10 rounded-full border border-dashed border-[#7C73FF]/25 animate-spin" style={{ animationDuration: '30s' }} />

            {/* Central Glowing Protein / Molecular Core */}
            <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#14D9B5]/20 via-[#31C5F4]/30 to-[#7C73FF]/20 backdrop-blur-md border border-teal-500/40 flex items-center justify-center shadow-teal-glow">
              <svg viewBox="0 0 200 200" className="w-36 h-36">
                {/* Molecular bonds */}
                <line x1="60" y1="70" x2="100" y2="100" stroke="#14D9B5" strokeWidth="2.5" />
                <line x1="100" y1="100" x2="140" y2="70" stroke="#31C5F4" strokeWidth="2.5" />
                <line x1="100" y1="100" x2="100" y2="150" stroke="#7C73FF" strokeWidth="2.5" />
                <line x1="60" y1="70" x2="40" y2="110" stroke="#31C5F4" strokeWidth="2" />
                <line x1="140" y1="70" x2="160" y2="110" stroke="#14D9B5" strokeWidth="2" />
                <line x1="100" y1="150" x2="60" y2="170" stroke="#14D9B5" strokeWidth="2" />
                <line x1="100" y1="150" x2="140" y2="170" stroke="#31C5F4" strokeWidth="2" />

                {/* Atoms */}
                <circle cx="100" cy="100" r="14" fill="#14D9B5" className="animate-pulse" />
                <circle cx="60" cy="70" r="11" fill="#31C5F4" />
                <circle cx="140" cy="70" r="11" fill="#31C5F4" />
                <circle cx="100" cy="150" r="12" fill="#7C73FF" />
                <circle cx="40" cy="110" r="8" fill="#14D9B5" />
                <circle cx="160" cy="110" r="8" fill="#14D9B5" />
                <circle cx="60" cy="170" r="8" fill="#31C5F4" />
                <circle cx="140" cy="170" r="8" fill="#7C73FF" />
              </svg>
            </div>

            {/* Orbiting Telemetry Badges */}
            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#06111F]/90 border border-teal-500/30 text-[10px] font-mono text-teal-300 shadow-md">
              Kd: 1.2 nM
            </div>
            <div className="absolute bottom-4 left-2 px-2.5 py-1 rounded-full bg-[#06111F]/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 shadow-md">
              ΔG: -42.8 kcal/mol
            </div>
          </div>
        </div>
      </div>

      {/* Four Workflow Cards (Matching Image 2) */}
      <div>
        <div className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider mb-3 px-1">
          Discovery & Analysis Workflows
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Drug Repurposing */}
          <div
            onClick={() => onNavigate('repurposing')}
            className="p-4 rounded-xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] hover:border-teal-500/50 cursor-pointer transition-all group shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 group-hover:text-teal-300 mb-1 flex items-center justify-between">
              Drug Repurposing
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-[11px] text-[#9BB0BF] leading-relaxed">
              Find new uses for existing drugs and compounds with explainable 6-factor triage ranking.
            </p>
          </div>

          {/* Card 2: Knowledge Graph */}
          <div
            onClick={() => onNavigate('knowledge-graph')}
            className="p-4 rounded-xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] hover:border-cyan-500/50 cursor-pointer transition-all group shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 mb-1 flex items-center justify-between">
              Knowledge Graph
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-[11px] text-[#9BB0BF] leading-relaxed">
              Explore 13+ biomedical datasets linking diseases, genes, proteins, pathways, and trials.
            </p>
          </div>

          {/* Card 3: In-Silico Testing / Compound Analysis */}
          <div
            onClick={() => onNavigate('compounds')}
            className="p-4 rounded-xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] hover:border-indigo-500/50 cursor-pointer transition-all group shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 mb-1 flex items-center justify-between">
              In-Silico Testing
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-[11px] text-[#9BB0BF] leading-relaxed">
              Inspect bioactivity measurements, predict binding affinity, ADMET safety & similarity.
            </p>
          </div>

          {/* Card 4: ReThera Discover (Preview) */}
          <div
            onClick={() => onNavigate('discover-preview')}
            className="p-4 rounded-xl bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] hover:border-purple-500/50 cursor-pointer transition-all group shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-[9px] font-mono text-purple-300">
              Coming Later
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 mb-1">
              De Novo Generation
            </h3>
            <p className="text-[11px] text-[#9BB0BF] leading-relaxed">
              Create novel molecules using SOTA generative models. Preview module clearly separated from MVP.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Lower Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Studies Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C3648] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">Recent Investigations</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {investigations.length} Active Studies
                </span>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                View all reports →
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C3648]/80 text-[#9BB0BF] font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Investigation</th>
                    <th className="py-2.5 px-3">Target Condition</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C3648]/40">
                  {investigations.map(inv => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#071321] transition-colors cursor-pointer group"
                      onClick={() => onNavigate('repurposing')}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-100 group-hover:text-teal-300">
                          {inv.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {inv.id} • {inv.last_updated}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300">{inv.disease_name}</span>
                        <div className="text-[10px] text-cyan-400 font-mono">{inv.target_name}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {inv.type}
                      </td>
                      <td className="py-3 px-3">
                        {inv.status === 'Running' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 font-mono text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                            Running ({inv.progress}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-teal-400 group-hover:translate-x-1 inline-block transition-transform text-xs font-semibold">
                          View →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TinyFish Live Evidence Updates Stream */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C3648] mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-bold text-sm text-slate-100">Live Evidence Activity Feed (TinyFish)</span>
              </div>
              <button
                onClick={() => onNavigate('evidence-monitor')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Open Evidence Monitor →
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-mono border border-rose-500/30">
                      Contradiction Alert
                    </span>
                    <span className="text-slate-100 font-medium text-xs">
                      Nature Medicine: ESR1 Y537S resistance mutation detected in metastatic ER+ cohort
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Circulating tumor DNA in 412 patients shows 18-fold reduction in Tamoxifen relative binding efficacy.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">2h ago</span>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                      Trial Update
                    </span>
                    <span className="text-slate-100 font-medium text-xs">
                      Lancet Oncology: ATLAS 10-year Tamoxifen follow-up trial confirms continuing benefit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Continuing treatment for 10 years versus 5 years produced additional 50% relative recurrence reduction.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Key Stats & System Data-Source Status */}
        <div className="lg:col-span-4 space-y-4">
          {/* Key Stats Panel (Matching Image 2) */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4">
            <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider block">
              Key Platform Stats
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-xl font-bold font-mono text-[#14D9B5]">2.4M</div>
                <div className="text-[11px] text-[#9BB0BF] mt-0.5">Molecules Evaluated</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-xl font-bold font-mono text-[#31C5F4]">15</div>
                <div className="text-[11px] text-[#9BB0BF] mt-0.5">Biomedical Datasets</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-xl font-bold font-mono text-[#7C73FF]">8</div>
                <div className="text-[11px] text-[#9BB0BF] mt-0.5">Targets Analyzed</div>
              </div>

              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-xl font-bold font-mono text-emerald-400">94.2%</div>
                <div className="text-[11px] text-[#9BB0BF] mt-0.5">Valid Compounds</div>
              </div>
            </div>
          </div>

          {/* Connected Data Sources Health */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C3648]">
              <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider">
                Data Sources & Integration
              </span>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[10px] text-teal-400 hover:underline"
              >
                Inspect Licences
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {dataSources.slice(0, 5).map(ds => (
                <div key={ds.name} className="flex items-center justify-between p-2 rounded-lg bg-[#071321] border border-[#1C3648]/60">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium text-slate-200 text-[11px]">{ds.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{ds.records_count.split(',')[0]}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-[#8293A5] italic leading-tight">
              *Live connections simulated in Demo Workspace. All facts backed by cited public datasets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
