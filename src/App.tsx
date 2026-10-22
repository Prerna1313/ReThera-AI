import React, { useState, useEffect } from 'react';
import { NavigationTab, Candidate, EvidenceRecord, ResearcherProfile, ResearchScope } from './types';
import {
  mockCandidates,
  mockInvestigations,
  mockDataSources,
  mockGraphNodes,
  mockGraphEdges,
  mockEvidenceRecords,
} from './data/mockData';

import { isLiveEvidence } from './data/evidence';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { HelpModal } from './components/layout/HelpModal';
import { NotificationDropdown } from './components/layout/NotificationDropdown';

import { DashboardScreen } from './components/screens/DashboardScreen';
import { WorkbenchScreen } from './components/screens/WorkbenchScreen';
import { CandidateDetailsScreen } from './components/screens/CandidateDetailsScreen';
import { KnowledgeGraphScreen } from './components/screens/KnowledgeGraphScreen';
import { CompoundsLibraryScreen } from './components/screens/CompoundsLibraryScreen';
import { EvidenceMonitorScreen } from './components/screens/EvidenceMonitorScreen';
import { ResearchDossierScreen } from './components/screens/ResearchDossierScreen';
import { ReportsLibraryScreen } from './components/screens/ReportsLibraryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { DiscoverPreviewScreen } from './components/screens/DiscoverPreviewScreen';
import { DatasetLabScreen } from './components/screens/DatasetLabScreen';

import { NewInvestigationWizard } from './components/modals/NewInvestigationWizard';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { CompareCandidatesModal } from './components/modals/CompareCandidatesModal';
import { EvidenceReviewDrawer } from './components/modals/EvidenceReviewDrawer';

const DEFAULT_RESEARCHER_PROFILE: ResearcherProfile = {
  displayName: 'Dr. Sarah Chen',
  credentials: 'Ph.D.',
  role: 'Lead Bio-Cheminformatics',
  email: 'sarah.chen@rethera.biotech',
  institution: 'Demo Translational Lab',
};

function loadResearcherProfile(): ResearcherProfile {
  try {
    const saved = JSON.parse(localStorage.getItem('rethera-researcher-profile') || 'null');
    if (saved && typeof saved === 'object') {
      return Object.fromEntries(Object.keys(DEFAULT_RESEARCHER_PROFILE).map(key => [
        key,
        typeof saved[key] === 'string' ? saved[key] : DEFAULT_RESEARCHER_PROFILE[key as keyof ResearcherProfile],
      ])) as unknown as ResearcherProfile;
    }
  } catch { /* Use the editable demo profile defaults when storage is unavailable. */ }
  return DEFAULT_RESEARCHER_PROFILE;
}

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('rethera-theme');
    return saved ? saved === 'dark' : true;
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [researcherProfile, setResearcherProfile] = useState<ResearcherProfile>(loadResearcherProfile);
  
  const [researchScope, setResearchScope] = useState<ResearchScope | null>(() => {
    try { return JSON.parse(localStorage.getItem('rethera-active-investigation') || 'null'); }
    catch { return null; }
  });
  useEffect(() => { localStorage.setItem('rethera-active-investigation', JSON.stringify(researchScope)); }, [researchScope]);

  // Specific view sub-states
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand-1');
  const [viewingDossier, setViewingDossier] = useState<boolean>(false);

  // Modal visibility states
  const [isNewInvestigationOpen, setIsNewInvestigationOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareCandidates, setCompareCandidates] = useState<Candidate[]>([]);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [activeEvidenceRecord, setActiveEvidenceRecord] = useState<EvidenceRecord | null>(null);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rethera-live-evidence') || '[]');
      return [...mockEvidenceRecords, ...(Array.isArray(saved) ? saved : [])];
    } catch {
      return mockEvidenceRecords;
    }
  });
  const [storageError, setStorageError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronize dark/light theme class on root html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('rethera-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('rethera-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const liveRecords = evidenceRecords.filter(isLiveEvidence);
    try {
      localStorage.setItem('rethera-live-evidence', JSON.stringify(liveRecords));
      setStorageError('');
    } catch {
      setStorageError('Browser storage is full or unavailable. Your latest evidence is only in memory; download its brief before closing this page.');
    }
  }, [evidenceRecords]);

  useEffect(() => {
    localStorage.setItem('rethera-researcher-profile', JSON.stringify(researcherProfile));
  }, [researcherProfile]);

  // Global keyboard shortcuts (Ctrl/Cmd+K for search, ? for help, Esc for modal close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsHelpOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
        setIsNewInvestigationOpen(false);
        setIsCompareOpen(false);
        setIsEvidenceDrawerOpen(false);
        setIsHelpOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleNavigate = (tab: NavigationTab, candidateId?: string) => {
    setViewingDossier(false);
    if (candidateId) {
      setSelectedCandidateId(candidateId);
      setCurrentTab('candidate-details');
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setViewingDossier(false);
    setCurrentTab('candidate-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCompare = (selected: Candidate[]) => {
    setCompareCandidates(selected);
    setIsCompareOpen(true);
  };

  const handleOpenEvidenceReview = (evidenceId: string) => {
    const found = evidenceRecords.find(e => e.id === evidenceId);
    if (!found) return;
    setActiveEvidenceRecord(found);
    setIsEvidenceDrawerOpen(true);
  };

  const handleAddEvidence = (record: EvidenceRecord) => {
    setEvidenceRecords(current => [record, ...current]);
    setActiveEvidenceRecord(record);
    setIsEvidenceDrawerOpen(true);
  };

  const handleUpdateEvidence = (evidenceId: string, status: EvidenceRecord['review_status'], notes: string) => {
    setEvidenceRecords(current => current.map(record => record.id === evidenceId
      ? { ...record, review_status: status, reviewer_notes: notes, reviewed_at: new Date().toISOString(), reviewed_by: researcherProfile.displayName, audit_trail: [...record.audit_trail, `Researcher review by ${researcherProfile.displayName} at ${new Date().toISOString()}: ${status}`, ...(notes ? [`Reviewer note: ${notes}`] : [])] }
      : record));
    setActiveEvidenceRecord(current => current?.id === evidenceId
      ? { ...current, review_status: status, reviewer_notes: notes, reviewed_at: new Date().toISOString(), reviewed_by: researcherProfile.displayName, audit_trail: [...current.audit_trail, `Researcher review by ${researcherProfile.displayName} at ${new Date().toISOString()}: ${status}`, ...(notes ? [`Reviewer note: ${notes}`] : [])] }
      : current);
  };

  const handleRunInvestigationComplete = (scope: ResearchScope) => {
    setResearchScope(scope);
    setIsNewInvestigationOpen(false);
    setCurrentTab('evidence-monitor');
    setViewingDossier(false);
  };

  const handleOpenReport = (reportId: string) => {
    setViewingDossier(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCandidate =
    mockCandidates.find(c => c.id === selectedCandidateId) || mockCandidates[0];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#06111F] text-[#E8F3F7]' : 'bg-[#F4F7FA] text-[#122435]'} flex transition-colors duration-200`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setViewingDossier(false);
          handleNavigate(tab);
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-60">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 h-16 shrink-0">
          <TopBar
            currentTab={currentTab}
            profile={researcherProfile}
            onSelectTab={handleNavigate}
            onOpenNewInvestigation={() => setIsNewInvestigationOpen(true)}
            onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
            onToggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
            unreadCount={6}
            onOpenNotifications={() => setIsNotificationsOpen(prev => !prev)}
          />

          {/* Floating Notification Dropdown */}
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onNavigate={(tab) => {
              setIsNotificationsOpen(false);
              handleNavigate(tab);
            }}
          />
        </div>

        {/* View Content Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div role="note" className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
            <strong>Research prototype · sample analysis.</strong> Candidate scores, citations and molecular illustrations are demo data and are not scientifically validated. Evidence Monitor retrieves live TinyFish sources with a server key and structured ClinicalTrials.gov records without a key; retrieved pages remain unreviewed until a researcher checks them.
          </div>
          {storageError && <div role="alert" className="mb-4 rounded-lg border border-amber-500/40 p-3 text-sm text-amber-200">{storageError}</div>}
          {viewingDossier ? (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => setViewingDossier(false)}
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1 mb-2"
                >
                  ← Back to Reports Archive
                </button>
              </div>
              <ResearchDossierScreen
                candidates={mockCandidates}
                evidenceRecords={evidenceRecords}
                onNavigate={handleNavigate}
              />
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardScreen
                  onNavigate={handleNavigate}
                  onOpenNewInvestigation={() => setIsNewInvestigationOpen(true)}
                  investigations={mockInvestigations}
                  dataSources={mockDataSources}
                />
              )}

              {currentTab === 'repurposing' && (
                <WorkbenchScreen
                  candidates={mockCandidates}
                  onSelectCandidate={handleSelectCandidate}
                  onNavigate={handleNavigate}
                  onOpenCompare={handleOpenCompare}
                />
              )}

              {currentTab === 'candidate-details' && (
                <CandidateDetailsScreen
                  candidate={currentCandidate}
                  evidenceRecords={evidenceRecords}
                  onBack={() => handleNavigate('repurposing')}
                  onNavigate={handleNavigate}
                  onOpenEvidenceReview={handleOpenEvidenceReview}
                />
              )}

              {currentTab === 'knowledge-graph' && (
                <KnowledgeGraphScreen
                  nodes={mockGraphNodes}
                  edges={mockGraphEdges}
                  evidenceRecords={evidenceRecords}
                  onNavigate={handleNavigate}
                  onOpenEvidenceReview={handleOpenEvidenceReview}
                />
              )}

              {currentTab === 'compounds' && (
                <CompoundsLibraryScreen
                  candidates={mockCandidates}
                  onSelectCandidate={handleSelectCandidate}
                  onNavigate={handleNavigate}
                  onOpenNewInvestigation={() => setIsNewInvestigationOpen(true)}
                />
              )}

              {(
                <div hidden={currentTab !== 'evidence-monitor'}><EvidenceMonitorScreen
                  scope={researchScope}
                  researcherName={researcherProfile.displayName}
                  candidates={mockCandidates}
                  evidenceList={evidenceRecords}
                  onOpenEvidenceDrawer={handleOpenEvidenceReview}
                  onAddEvidence={handleAddEvidence}
                  onNavigate={handleNavigate}
                /></div>
              )}

              {currentTab === 'reports' && (
                <ReportsLibraryScreen
                  evidenceRecords={evidenceRecords}
                  onOpenEvidenceDrawer={handleOpenEvidenceReview}
                  investigations={mockInvestigations}
                  onOpenReport={handleOpenReport}
                  onNavigate={handleNavigate}
                />
              )}

              {currentTab === 'dataset-lab' && <DatasetLabScreen />}

              {currentTab === 'discover-preview' && (
                <DiscoverPreviewScreen onNavigate={handleNavigate} />
              )}

              {currentTab === 'settings' && (
                <SettingsScreen
                  dataSources={mockDataSources}
                  profile={researcherProfile}
                  onProfileChange={setResearcherProfile}
                  isDarkMode={isDarkMode}
                  onToggleTheme={toggleTheme}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewInvestigationWizard
        isOpen={isNewInvestigationOpen}
        onClose={() => setIsNewInvestigationOpen(false)}
        onRunComplete={handleRunInvestigationComplete}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <CompareCandidatesModal
        candidates={compareCandidates}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectCandidate={handleSelectCandidate}
      />

      <EvidenceReviewDrawer
        evidence={activeEvidenceRecord}
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        onUpdateStatus={handleUpdateEvidence}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
