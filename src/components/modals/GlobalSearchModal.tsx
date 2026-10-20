import React, { useState } from 'react';
import { NavigationTab } from '../../types';
import { Search, X, ArrowRight, Dna, Boxes, Radio, Activity } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab, candidateId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const mockResults = [
    {
      category: 'Compounds',
      icon: <Boxes className="w-3.5 h-3.5 text-teal-400" />,
      items: [
        { title: 'Tamoxifen', subtitle: 'CHEMBL83 • PubChem CID 2733527 • Priority: 0.92', tab: 'candidate-details' as NavigationTab, id: 'tamoxifen' },
        { title: 'Metformin', subtitle: 'CHEMBL1431 • PubChem CID 4091 • Priority: 0.87', tab: 'repurposing' as NavigationTab, id: 'metformin' },
        { title: 'Rapamycin (Sirolimus)', subtitle: 'CHEMBL415 • Priority: 0.83', tab: 'repurposing' as NavigationTab, id: 'rapamycin' },
      ],
    },
    {
      category: 'Targets / Genes',
      icon: <Dna className="w-3.5 h-3.5 text-cyan-400" />,
      items: [
        { title: 'ESR1 (Estrogen receptor alpha)', subtitle: 'UniProt P03372 • Association score 0.94 in Breast Cancer', tab: 'knowledge-graph' as NavigationTab },
        { title: 'mTOR (Mechanistic target of rapamycin)', subtitle: 'UniProt P42345 • Association score 0.81', tab: 'knowledge-graph' as NavigationTab },
      ],
    },
    {
      category: 'Live TinyFish Evidence',
      icon: <Radio className="w-3.5 h-3.5 text-rose-400" />,
      items: [
        { title: 'ESR1 Y537S activating resistance mutation', subtitle: 'Nature Medicine 2026 • 28.4% endocrine resistant cohort', tab: 'evidence-monitor' as NavigationTab },
        { title: 'ATLAS 10-year Tamoxifen follow-up trial', subtitle: 'Lancet Oncology 2026 • RR 0.71 reduction', tab: 'evidence-monitor' as NavigationTab },
      ],
    },
  ];

  const filteredResults = query.trim()
    ? mockResults.map(grp => ({
        ...grp,
        items: grp.items.filter(it =>
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.subtitle.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter(grp => grp.items.length > 0)
    : mockResults;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0A1B2B] border border-[#1C3648] rounded-2xl shadow-elevated-dark overflow-hidden text-slate-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#1C3648] flex items-center gap-3 bg-[#071321]">
          <Search className="w-5 h-5 text-teal-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across diseases, targets, compounds, SMILES, or trials..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              ✕
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No matching biomedical entities found for "{query}".
            </div>
          ) : (
            filteredResults.map(group => (
              <div key={group.category} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {group.icon}
                  <span>{group.category}</span>
                </div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <div
                      key={item.title}
                      onClick={() => {
                        onNavigate(item.tab, (item as any).id);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg bg-[#071321] hover:bg-[#0D2233] border border-[#1C3648] cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-slate-100 group-hover:text-teal-300">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.subtitle}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-[#1C3648] bg-[#071321] text-[10px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#06111F] border border-slate-700 text-slate-300 font-mono">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
