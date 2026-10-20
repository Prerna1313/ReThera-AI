import React from 'react';
import { NavigationTab } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Radio, FileText, Database, X } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Investigation Completed',
      desc: 'BRCA1 Target Analysis & Synthetic Lethality completed. 64 candidates ranked.',
      time: '2 hours ago',
      type: 'success',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      actionTab: 'reports' as NavigationTab,
    },
    {
      id: 'notif-2',
      title: 'Contradictory Evidence Flagged',
      desc: 'Illustrative contradiction scenario: ESR1 Y537S activating resistance mutation for Tamoxifen in Nature Medicine.',
      time: '2 hours ago',
      type: 'danger',
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      actionTab: 'evidence-monitor' as NavigationTab,
    },
    {
      id: 'notif-3',
      title: 'Live Web Source Discovered',
      desc: 'Illustrative retrieval scenario: 10-year ATLAS trial update from Lancet Oncology.',
      time: 'Yesterday',
      type: 'live',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      actionTab: 'evidence-monitor' as NavigationTab,
    },
    {
      id: 'notif-4',
      title: 'Partial Results Available',
      desc: "Alzheimer's Kinase Screening: PubChem API query completed; 1 external mirror timed out. Inspect partial findings.",
      time: '12 mins ago',
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      actionTab: 'repurposing' as NavigationTab,
    },
    {
      id: 'notif-5',
      title: 'Dossier Ready for Export',
      desc: 'BRCA-001 Research Dossier finalized with 59 evidence citations and disclaimer notice.',
      time: '1 day ago',
      type: 'report',
      icon: <FileText className="w-4 h-4 text-teal-400" />,
      actionTab: 'reports' as NavigationTab,
    },
    {
      id: 'notif-6',
      title: 'Data Ingestion Snapshot',
      desc: 'ChEMBL v33 & Open Targets 24.09 snapshot synchronized successfully.',
      time: '3 days ago',
      type: 'db',
      icon: <Database className="w-4 h-4 text-indigo-400" />,
      actionTab: 'settings' as NavigationTab,
    },
  ];

  return (
    <div className="fixed top-16 right-4 sm:right-10 z-50 w-88 max-w-sm rounded-xl bg-[#0A1B2B] border border-[#1C3648] shadow-elevated-dark p-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#1C3648] mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100 text-sm">Sample notifications</span>
          <span className="px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 text-[10px] font-mono">
            6 examples
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => {
              onNavigate(n.actionTab);
              onClose();
            }}
            className="p-2.5 rounded-lg bg-[#071321] hover:bg-[#0D2233] border border-[#1C3648]/80 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                {n.icon}
                <span>Sample: {n.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-5.5">
              {n.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1C3648] text-center">
        <button
          onClick={() => { onNavigate('settings'); onClose(); }}
          className="text-[11px] text-teal-400 hover:underline"
        >
          Manage Notification & Audit Settings
        </button>
      </div>
    </div>
  );
};
