import React, { useState } from 'react';
import { NavigationTab, ResearcherProfile } from '../../types';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Bell,
  Menu,
  ChevronRight,
  User,
  Shield,
  LogOut,
} from 'lucide-react';

interface TopBarProps {
  currentTab: NavigationTab;
  profile: ResearcherProfile;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewInvestigation: () => void;
  onOpenGlobalSearch: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onToggleMobileMenu: () => void;
  unreadCount?: number;
  onOpenNotifications: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  profile,
  onSelectTab,
  onOpenNewInvestigation,
  onOpenGlobalSearch,
  onToggleTheme,
  isDarkMode,
  onToggleMobileMenu,
  unreadCount = 6,
  onOpenNotifications,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const initials = profile.displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('') || 'DR';

  // Render breadcrumbs based on active tab
  const renderBreadcrumbs = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Workspace
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#E8F3F7] font-semibold">Overview</span>
          </div>
        );
      case 'repurposing':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#E8F3F7] font-semibold">Repurposing Workbench</span>
          </div>
        );
      case 'candidate-details':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('repurposing')}>
              Repurposing
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#14D9B5] font-semibold">Tamoxifen (CHEMBL83)</span>
          </div>
        );
      case 'knowledge-graph':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#E8F3F7] font-semibold">Knowledge Graph Explorer</span>
          </div>
        );
      case 'compounds':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#E8F3F7] font-semibold">Compounds Library</span>
          </div>
        );
      case 'evidence-monitor':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#31C5F4] font-semibold">Live Evidence Monitor (TinyFish)</span>
          </div>
        );
      case 'reports':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#E8F3F7] font-semibold">Research Dossiers & Reports</span>
          </div>
        );
      case 'discover-preview':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#7C73FF] font-semibold">ReThera Discover (Future Preview)</span>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#9BB0BF]">
            <span className="hover:text-[#E8F3F7] cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8293A5]" />
            <span className="text-[#E8F3F7] font-semibold">Settings & Data Operations</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-60 z-30 bg-[#071321]/90 backdrop-blur-md border-b border-[#1C3648] px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          {renderBreadcrumbs()}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] text-xs text-[#9BB0BF] transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-teal-400 group-hover:text-teal-300" />
            <span className="truncate">Search diseases, targets, compounds, SMILES...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#06111F] text-[10px] font-mono text-slate-400 border border-[#1C3648]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
          title="Search"
        >
          <Search className="w-4 h-4 text-teal-400" />
        </button>

        {/* Primary CTA: New Investigation */}
        <button
          onClick={onOpenNewInvestigation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14D9B5] hover:bg-[#10B981] text-[#06111F] text-xs font-semibold shadow-teal-glow transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">New Investigation</span>
          <span className="sm:hidden">New</span>
        </button>

        <div className="h-5 w-[1px] bg-[#1C3648] mx-1" />

        {/* Global Light / Dark Appearance Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-2 rounded-lg bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] text-[#9BB0BF] hover:text-[#14D9B5] transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          title="View Notifications"
          className="relative p-2 rounded-lg bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] text-[#9BB0BF] hover:text-[#31C5F4] transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FB7185] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Researcher Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-[#0A1B2B] hover:bg-[#0D2233] border border-[#1C3648] text-xs transition-colors"
          >
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-[#14D9B5] to-[#7C73FF] p-0.5">
              <div className="w-full h-full rounded-full bg-[#06111F] flex items-center justify-center font-bold text-[10px] text-teal-300">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-[#06111F]" />
            </div>
            <span className="font-medium text-[#E8F3F7] hidden sm:inline">{profile.displayName || 'Researcher'}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0A1B2B] border border-[#1C3648] shadow-elevated-dark p-2 text-xs space-y-1 z-50">
              <div className="px-3 py-2 border-b border-[#1C3648]">
                <div className="font-semibold text-slate-100">{profile.displayName || 'Researcher'}{profile.credentials ? `, ${profile.credentials}` : ''}</div>
                {profile.role && <div className="text-[10px] text-teal-400 font-mono">{profile.role}</div>}
                {profile.email && <div className="text-[10px] text-slate-400">{profile.email}</div>}
              </div>

              <button
                onClick={() => { onSelectTab('settings'); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#0D2233] text-slate-300"
              >
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>Researcher Profile & Roles</span>
              </button>

              <button
                onClick={() => { onSelectTab('settings'); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#0D2233] text-slate-300"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Workspace Access & Security</span>
              </button>

              <div className="pt-1 border-t border-[#1C3648]">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
