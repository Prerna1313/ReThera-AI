import React, { useState } from 'react';
import { DataSource } from '../../types';
import {
  Settings,
  Database,
  Sliders,
  Shield,
  Palette,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  RefreshCw,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';

interface SettingsScreenProps {
  dataSources: DataSource[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  dataSources,
  isDarkMode,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'appearance' | 'models' | 'security'>('sources');
  const [weights, setWeights] = useState({
    bio: 25,
    pharm: 25,
    comp: 15,
    human: 10,
    live: 10,
    coverage: 15,
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono text-[10px] border border-teal-500/30">
            SYSTEM ARCHITECTURE & OPERATIONS
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Workspace: Demo Translational Lab • User: Dr. Sarah Chen
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100">
          Settings & Data Operations
        </h1>
        <p className="text-xs text-[#9BB0BF] mt-0.5">
          Manage connected biomedical data sources, licensing compliance, ranking heuristics, and security
        </p>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-[#1C3648] mt-4 pt-3 overflow-x-auto text-xs">
          {[
            { id: 'sources', label: 'Data Sources & Licences (9)', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'appearance', label: 'Appearance & Theme', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'models', label: 'Models & Ranking Weights', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'security', label: 'Security & TinyFish API', icon: <Shield className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#14D9B5] text-[#06111F] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#071321]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Data Sources & Licences */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Data Ingestion Health Card */}
          <div className="p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-3">
            <span className="text-xs font-semibold text-[#9BB0BF] uppercase tracking-wider block">
              Ingestion Health & Provenance Audit
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Ingested Records</div>
                <div className="text-teal-300 font-bold text-base mt-0.5">10.7M facts</div>
              </div>
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Duplicate Merges</div>
                <div className="text-cyan-300 font-bold text-base mt-0.5">142,890</div>
              </div>
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">Unmapped Ambiguities</div>
                <div className="text-amber-300 font-bold text-base mt-0.5">18 (Quarantined)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648]">
                <div className="text-slate-400 text-[10px]">TinyFish Live Sync</div>
                <div className="text-emerald-400 font-bold text-base mt-0.5">Active (642 left)</div>
              </div>
            </div>
          </div>

          {/* Sources List */}
          <div className="rounded-2xl bg-[#0A1B2B] border border-[#1C3648] overflow-hidden shadow-sm">
            <div className="p-4 bg-[#071321] border-b border-[#1C3648] flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">
                Connected Biomedical Knowledge Repositories
              </span>
              <span className="text-[10px] text-teal-400 font-mono">All licences audited</span>
            </div>

            <div className="divide-y divide-[#1C3648]/60 text-xs">
              {dataSources.map(ds => (
                <div key={ds.name} className="p-4 hover:bg-[#071321]/50 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <span>{ds.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {ds.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ds.purpose}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap self-start sm:self-auto">
                      {ds.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] text-slate-400 pt-1">
                    <div>Records: <strong className="text-slate-200">{ds.records_count}</strong></div>
                    <div>Last Retrieved: <strong className="text-slate-200">{ds.last_retrieval}</strong></div>
                    <div className="text-teal-300">Licence: {ds.license_terms}</div>
                  </div>

                  {ds.warnings && (
                    <div className="text-[10px] text-amber-400/90 italic flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      {ds.warnings}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Licensing Gate Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 dark:bg-[#071321] border border-[#1C3648] text-[11px] text-[#8293A5] space-y-1 leading-relaxed">
            <strong className="text-slate-300 block">Commercial Licensing Policy:</strong>
            ReThera AI strictly respects database license terms. Open Targets Platform is CC0 1.0; ChEMBL data is CC BY-SA 3.0. DrugBank is purposefully excluded unless an enterprise commercial redistribution license is verified. TinyFish Search and Fetch query public and authorized records only.
          </div>
        </div>
      )}

      {/* TAB 2: Appearance & Theme Toggle */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Color Theme & Visual Mode</h3>
            <p className="text-[#9BB0BF]">
              Toggle between the dark scientific interface (Image 2 style) and the light research theme.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Theme Option */}
            <div
              onClick={() => { if (!isDarkMode) onToggleTheme(); }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                isDarkMode
                  ? 'border-teal-400 bg-[#071321] shadow-teal-glow'
                  : 'border-[#1C3648] bg-[#071321]/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-cyan-400" /> Dark Scientific (Default)
                </span>
                {isDarkMode && <span className="text-teal-400 text-xs font-bold font-mono">ACTIVE</span>}
              </div>
              <div className="h-20 rounded-lg bg-[#06111F] border border-[#1C3648] p-3 flex items-center justify-center">
                <span className="text-[#14D9B5] font-mono text-xs">#06111F Navy & Glowing Teal</span>
              </div>
            </div>

            {/* Light Theme Option */}
            <div
              onClick={() => { if (isDarkMode) onToggleTheme(); }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                !isDarkMode
                  ? 'border-teal-600 bg-white shadow-md'
                  : 'border-[#1C3648] bg-[#071321]/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" /> Light Laboratory
                </span>
                {!isDarkMode && <span className="text-teal-600 text-xs font-bold font-mono">ACTIVE</span>}
              </div>
              <div className="h-20 rounded-lg bg-[#F4F7FA] border border-[#DCE5EC] p-3 flex items-center justify-center">
                <span className="text-[#087F70] font-mono text-xs">#F4F7FA Crisp Paper White</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Models & Ranking Weights */}
      {activeTab === 'models' && (
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Heuristic Ranking Weights</h3>
            <p className="text-[#9BB0BF]">
              Calibrate multi-factor prioritization weights across biological support, measured pharmacology, and live web relevance.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-200">Biological Support (Open Targets)</span>
                <span className="font-mono text-teal-300">{weights.bio}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.bio}
                onChange={e => setWeights(prev => ({ ...prev, bio: Number(e.target.value) }))}
                className="w-full accent-teal-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-200">Measured Pharmacology (ChEMBL Bioactivity)</span>
                <span className="font-mono text-cyan-300">{weights.pharm}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.pharm}
                onChange={e => setWeights(prev => ({ ...prev, pharm: Number(e.target.value) }))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-200">Computational DTI & Similarity Support</span>
                <span className="font-mono text-indigo-300">{weights.comp}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.comp}
                onChange={e => setWeights(prev => ({ ...prev, comp: Number(e.target.value) }))}
                className="w-full accent-indigo-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-200">Live Web Evidence (TinyFish Discovery)</span>
                <span className="font-mono text-cyan-300">{weights.live}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.live}
                onChange={e => setWeights(prev => ({ ...prev, live: Number(e.target.value) }))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & TinyFish API */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Security & TinyFish Credential Management</h3>
            <p className="text-[#9BB0BF]">
              Credentials remain strictly server-side. Secret keys are never exposed in browser bundles or client requests.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#071321] border border-[#1C3648] space-y-2 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span>TinyFish Search API Key:</span>
              <span className="text-emerald-400 font-bold">•••••••••••••••••••••••• (Active Server-Side Secret)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>TinyFish Fetch API Key:</span>
              <span className="text-emerald-400 font-bold">•••••••••••••••••••••••• (Encrypted in Secret Manager)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Client-Side Bundle Exposure Check:</span>
              <span className="text-teal-300">0 Secrets Injected (Verified Compliant)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-200 space-y-1">
            <div className="font-bold text-teal-300">Data Isolation Guarantee</div>
            <p className="text-[11px] leading-relaxed">
              Proprietary internal candidate molecules and confidential research notes are never shared with public LLMs or web scrapers without explicit researcher opt-in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
