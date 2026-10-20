import React from 'react';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  GitBranch,
  Network,
  Boxes,
  Radio,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Atom,
  Sparkles,
  Server,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenHelp: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHelp,
  isOpenMobile,
  onCloseMobile,
}) => {
  const primaryNavItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'repurposing', label: 'Repurposing', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'knowledge-graph', label: 'Knowledge Graph', icon: <Network className="w-4 h-4" /> },
    { id: 'compounds', label: 'Compounds', icon: <Boxes className="w-4 h-4" /> },
    { id: 'evidence-monitor', label: 'Evidence Monitor', icon: <Radio className="w-4 h-4" />, badge: 'Demo' },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#071321] text-[#E8F3F7] border-r border-[#1C3648] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#1C3648] bg-[#071321]">
            <div
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14D9B5] to-[#31C5F4] p-0.5 flex items-center justify-center shadow-teal-glow">
                <div className="w-full h-full bg-[#06111F] rounded-[7px] flex items-center justify-center">
                  <Atom className="w-4 h-4 text-[#14D9B5] group-hover:rotate-180 transition-transform duration-700" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[#E8F3F7] leading-tight">
                  ReThera <span className="text-[#14D9B5]">AI</span>
                </span>
                <span className="text-[10px] text-[#9BB0BF] font-mono tracking-wider">
                  RESEARCH PLATFORM
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Primary Navigation in exact required order */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9BB0BF]/70 font-semibold">
              Research Workflows
            </div>
            {primaryNavItems.map(item => {
              const isActive = currentTab === item.id || (item.id === 'repurposing' && currentTab === 'candidate-details');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#0A1B2B] text-[#14D9B5] border-l-2 border-[#14D9B5] shadow-sm font-semibold'
                      : 'text-[#9BB0BF] hover:text-[#E8F3F7] hover:bg-[#0A1B2B]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-[#14D9B5]' : 'text-[#9BB0BF] group-hover:text-[#31C5F4]'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        item.badge === 'Live'
                          ? 'bg-[#14D9B5]/15 text-[#14D9B5] border border-[#14D9B5]/30 animate-pulse'
                          : 'bg-[#1C3648] text-[#9BB0BF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Discover Module Item (marked preview) */}
            <button
              onClick={() => {
                onSelectTab('discover-preview');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group mt-2 ${
                currentTab === 'discover-preview'
                  ? 'bg-[#0A1B2B] text-[#7C73FF] border-l-2 border-[#7C73FF] font-semibold'
                  : 'text-[#9BB0BF] hover:text-[#E8F3F7] hover:bg-[#0A1B2B]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#7C73FF]" />
                <span>ReThera Discover</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7C73FF]/15 text-[#7C73FF] border border-[#7C73FF]/30 font-mono">
                Preview
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#1C3648] space-y-2 bg-[#071321]">
          {/* Prototype status */}
          <div className="p-2.5 rounded-lg bg-[#0A1B2B] border border-[#1C3648] text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-medium">Prototype</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-300">Demo workspace</span>
          </div>

          <button
            onClick={() => {
              onSelectTab('settings');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'settings'
                ? 'bg-[#0A1B2B] text-[#14D9B5] font-semibold'
                : 'text-[#9BB0BF] hover:text-[#E8F3F7] hover:bg-[#0A1B2B]/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-[#9BB0BF] hover:text-[#E8F3F7] hover:bg-[#0A1B2B]/60 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Documentation</span>
          </button>

          {/* Mandatory Demo Workspace Badge */}
          <div className="pt-2 px-1 text-center">
            <span className="inline-block px-2.5 py-1 rounded bg-[#0A1B2B] border border-[#1C3648] text-[10px] font-mono text-[#8293A5] tracking-wide">
              Demo Workspace • Illustrative Data
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
