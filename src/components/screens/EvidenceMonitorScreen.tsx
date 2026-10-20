import { isLiveEvidence, downloadBrief } from '../../data/evidence';
import React, { useEffect, useRef, useState } from 'react';
import { Candidate, EvidenceCategory, EvidenceDirection, EvidenceRecord, NavigationTab, ResearchScope } from '../../types';
import { StatusBadge } from '../scientific/StatusBadge';
import {
  Search,
  Filter,
  RefreshCw,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  History,
  Link2,
} from 'lucide-react';

interface TinyFishSearchResult {
  id?: string;
  title: string;
  url: string;
  snippet: string;
  publishedDate: string | null;
}

interface TinyFishFetchedPage extends TinyFishSearchResult {
  content: string;
  retrievedAt: string;
  sourceContext?: Record<string, unknown>;
  truncated?: boolean;
}

interface EvidenceMonitorScreenProps {
  scope: ResearchScope | null;
  researcherName: string;
  candidates: Candidate[];
  evidenceList: EvidenceRecord[];
  onOpenEvidenceDrawer: (evidenceId: string) => void;
  onAddEvidence: (record: EvidenceRecord) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const EvidenceMonitorScreen: React.FC<EvidenceMonitorScreenProps> = ({
  scope,
  researcherName,
  candidates,
  evidenceList,
  onOpenEvidenceDrawer,
  onAddEvidence,
  onNavigate,
}) => {
  const requestVersion = useRef(0);
  useEffect(() => () => { requestVersion.current += 1; }, []);
  const [activeTab, setActiveTab] = useState<'recent' | 'monitored' | 'library'>('monitored');
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(
    () => evidenceList.find(record => isLiveEvidence(record)) || null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [tinyfishQuery, setTinyfishQuery] = useState(scope?.query || 'metformin Alzheimer disease clinical study');
  const [researchQuestion, setResearchQuestion] = useState(scope?.question || 'What studies have investigated metformin in Alzheimer disease, and what remains unknown?');
  const [workspaceId, setWorkspaceId] = useState(scope?.id || crypto.randomUUID());
  const [provider, setProvider] = useState<'tinyfish' | 'clinicaltrials'>('tinyfish');
  const [searchContext, setSearchContext] = useState<{ query: string; question: string; id: string; retrievedAt: string; provider: string } | null>(null);
  const [briefUnknowns, setBriefUnknowns] = useState('');
  const [briefScope, setBriefScope] = useState('current');
  const [tinyfishConfigured, setTinyfishConfigured] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TinyFishSearchResult[]>([]);
  const [fetchedPage, setFetchedPage] = useState<TinyFishFetchedPage | null>(null);
  const [liveError, setLiveError] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceCategory>('E0: Unclassified source');
  const [evidenceDirection, setEvidenceDirection] = useState<EvidenceDirection>('unclear');
  const [briefFinding, setBriefFinding] = useState('');
  const [briefStudyType, setBriefStudyType] = useState('');
  const [briefModel, setBriefModel] = useState('');
  const [briefLimitations, setBriefLimitations] = useState('');
  const [directionFilter, setDirectionFilter] = useState<EvidenceDirection | 'all' | 'unknown'>('all');
  const [demoProgress, setDemoProgress] = useState(0);
  const [linkedCandidateId, setLinkedCandidateId] = useState('');
  const [linkedCompound, setLinkedCompound] = useState(scope?.compound || '');
  const [linkedTarget, setLinkedTarget] = useState(scope?.target || '');
  const [linkedDisease, setLinkedDisease] = useState(scope?.disease || '');

  useEffect(() => {
    fetch('/api/health')
      .then(response => response.json())
      .then(data => setTinyfishConfigured(Boolean(data.tinyfishConfigured)))
      .catch(() => setTinyfishConfigured(false));
  }, []);

  useEffect(() => {
    if (!scope) return;
    requestVersion.current += 1;
    setIsSearching(false);
    setFetchingUrl(null);
    setWorkspaceId(scope.id);
    setResearchQuestion(scope.question);
    setTinyfishQuery(scope.query);
    setLinkedCompound(scope.compound);
    setLinkedDisease(scope.disease);
    setLinkedTarget(scope.target);
    setLinkedCandidateId('');
    setSearchResults([]);
    setFetchedPage(null);
    setSearchContext(null);
    setLiveError('');
    setDemoProgress(0);
    setBriefScope('current');
  }, [scope?.id]);

  const busy = isSearching || fetchingUrl !== null;
  const invalidateSearch = () => {
    requestVersion.current += 1;
    setSearchResults([]); setFetchedPage(null); setSearchContext(null); setDemoProgress(0); setLiveError('');
  };
  const currentRecord = selectedRecord ? evidenceList.find(record => record.id === selectedRecord.id) || selectedRecord : null;

  const handleTinyFishSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const version = ++requestVersion.current;
    setIsSearching(true);
    setDemoProgress(0);
    setLiveError('');
    setSearchResults([]);
    setFetchedPage(null);
    try {
      const response = await fetch(`/api/${provider}/search`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: tinyfishQuery }),
      });
      const data = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok) throw new Error(data.error || 'Search could not be completed.');
      setSearchResults(data.results || []);
      setSearchContext({ query: tinyfishQuery.trim(), question: researchQuestion.trim(), id: workspaceId, retrievedAt: data.retrievedAt, provider });
      if (data.results?.length) setDemoProgress(1);
      if (!data.results?.length) setLiveError('No approved biomedical or regulatory sources matched. Try a different search.');
      if (data.filteredCount) setLiveError(`${data.results?.length ? '' : 'No useful approved source found. '}${data.filteredCount} result(s) were hidden because their domains are outside the approved-source list. Refine your query or try ClinicalTrials.gov.`);
    } catch (error) {
      if (version !== requestVersion.current) return;
      setLiveError(error instanceof Error ? error.message : 'Search could not be completed.');
    } finally {
      if (version === requestVersion.current) setIsSearching(false);
    }
  };

  const handleTinyFishFetch = async (result: TinyFishSearchResult) => {
    if (!searchContext) return;
    const version = ++requestVersion.current;
    setFetchingUrl(result.url);
    setDemoProgress(1);
    setLiveError('');
    setFetchedPage(null);
    try {
      const response = await fetch(`/api/${searchContext.provider}/fetch`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: result.url, title: result.title, id: result.id }),
      });
      const data = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok) throw new Error(data.error || 'The selected page could not be fetched.');
      setFetchedPage({ ...result, ...data, publishedDate: data.publishedDate || result.publishedDate });
      setDemoProgress(2);
      setEvidenceType('E0: Unclassified source');
      setEvidenceDirection('unclear');
      setBriefFinding('');
      setBriefStudyType('');
      setBriefModel('');
      setBriefLimitations('');
      setBriefUnknowns('');
    } catch (error) {
      if (version !== requestVersion.current) return;
      setLiveError(error instanceof Error ? error.message : 'The selected page could not be fetched.');
    } finally {
      if (version === requestVersion.current) setFetchingUrl(null);
    }
  };

  const handleSaveFetchedEvidence = () => {
    if (!fetchedPage || !searchContext || !briefFinding.trim() || !briefUnknowns.trim()) return;
    const candidate = candidates.find(item => item.id === linkedCandidateId);
    const record: EvidenceRecord = {
      id: `live-${searchContext.provider}-${crypto.randomUUID()}`,
      provenance: 'live',
      investigation_id: searchContext.id,
      research_question: searchContext.question,
      search_query: searchContext.query,
      search_retrieved_at: searchContext.retrievedAt,
      researcher: researcherName,
      source_context: fetchedPage.sourceContext,
      content_truncated: fetchedPage.truncated,
      title: fetchedPage.title,
      url: fetchedPage.url,
      source_provider: searchContext.provider === 'tinyfish' ? 'TinyFish Search & Fetch' : 'ClinicalTrials.gov API v2',
      published_date: fetchedPage.publishedDate || 'Not provided — check source',
      retrieved_date: fetchedPage.retrievedAt,
      linked_compounds: linkedCompound.trim() ? [linkedCompound.trim()] : candidate ? [candidate.name] : [],
      linked_targets: linkedTarget ? [linkedTarget] : [],
      linked_diseases: linkedDisease.trim() ? [linkedDisease.trim()] : [],
      claim: fetchedPage.content,
      category: evidenceType,
      direction: evidenceDirection,
      review_status: 'Needs Review',
      limitations: 'Source material was retrieved from the selected provider and has not been interpreted or verified by ReThera. Check the original source, study context, dates, and relevance before using it as evidence.',
      researcher_brief: {
        finding: briefFinding.trim(),
        study_type: briefStudyType.trim(),
        model_population: briefModel.trim(),
        limitations: briefLimitations.trim(),
        unknowns: briefUnknowns.trim(),
      },
      audit_trail: [
        `Research question: ${searchContext.question}`,
        `${searchContext.provider} Search query: ${searchContext.query} at ${searchContext.retrievedAt}`,
        `Selected source: ${fetchedPage.url}`,
        `${searchContext.provider} Fetch completed: ${fetchedPage.retrievedAt}`,
        `Researcher linked this source to ${linkedCompound.trim() || candidate?.name || 'no compound'}${linkedTarget ? ` and target ${linkedTarget}` : ''}${linkedDisease ? ` for ${linkedDisease}` : ''}.`,
        'Classification entered by the researcher; source confirmation is still required.',
      ],
    };
    onAddEvidence(record);
    setDemoProgress(3);
    setSelectedRecord(record);
    setFetchedPage(null);
    setSearchResults([]);
    setLiveError('');
  };

  const matchingEvidence = evidenceList.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.source_provider.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const liveEvidenceCount = evidenceList.filter(record => isLiveEvidence(record)).length;
  const liveEvidence = evidenceList.filter(record => isLiveEvidence(record));
  const directionCounts = {
    supports: liveEvidence.filter(record => record.direction === 'supports').length,
    contradicts: liveEvidence.filter(record => record.direction === 'contradicts').length,
    unknown: liveEvidence.filter(record => record.direction === 'unclear' || record.direction === 'contextual').length,
  };
  const filteredEvidence = matchingEvidence.filter(record =>
    activeTab === 'monitored'
      ? isLiveEvidence(record)
      : activeTab === 'library'
        ? !isLiveEvidence(record)
        : true
  ).filter(record => directionFilter === 'all' || (directionFilter === 'unknown'
    ? record.direction === 'unclear' || record.direction === 'contextual'
    : record.direction === directionFilter));

  const exportRecords = liveEvidence.filter(record => briefScope === 'current' ? record.investigation_id === workspaceId : (record.investigation_id || 'legacy') === briefScope);
  const investigationOptions = [...new Map(liveEvidence.filter(record => record.investigation_id).map(record => [record.investigation_id!, record.research_question || record.investigation_id!])).entries()];
  const downloadEvidenceBrief = () => downloadBrief(exportRecords, briefScope === 'current' ? researchQuestion : exportRecords[0]?.research_question);

  const restartGuidedDemo = () => {
    invalidateSearch();
    setSearchResults([]);
    setFetchedPage(null);
    setLiveError('');
    setBriefFinding('');
    setBriefStudyType('');
    setBriefModel('');
    setBriefLimitations('');
    setDemoProgress(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE SOURCE RESEARCH
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {tinyfishConfigured === null ? 'Checking server configuration…' : tinyfishConfigured ? 'Server key configured · source review required' : 'Add server key to enable live retrieval'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Live Evidence Monitor
          </h1>
          <p className="text-xs text-[#9BB0BF] mt-0.5">
            Discover and extract current clinical outcomes, regulatory approvals, and preprint findings beyond structured databases
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-slate-400">Search → select → Fetch → researcher review → brief</span>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="p-4 rounded-xl bg-[#0A1B2B] border border-[#1C3648] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'recent', label: `All Evidence (${evidenceList.length})` },
              { id: 'monitored', label: `Live sources (${liveEvidenceCount})` },
              { id: 'library', label: `Example Records (${evidenceList.length - liveEvidenceCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setDirectionFilter('all'); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-[#071321] text-slate-400 border border-[#1C3648] hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>{liveEvidenceCount} live source record{liveEvidenceCount === 1 ? '' : 's'} saved in this browser</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Live evidence by researcher assessment">
          {([
            { key: 'all', label: 'All live evidence', count: liveEvidenceCount, color: 'text-cyan-200' },
            { key: 'supports', label: 'Appears to support', count: directionCounts.supports, color: 'text-emerald-200' },
            { key: 'contradicts', label: 'Appears to challenge', count: directionCounts.contradicts, color: 'text-rose-200' },
            { key: 'unknown', label: 'Context / unknown', count: directionCounts.unknown, color: 'text-amber-200' },
          ] as const).map(item => (
            <button key={item.key} type="button" onClick={() => { setActiveTab('monitored'); setDirectionFilter(item.key); }} className={`rounded-lg border px-3 py-2 text-left transition-colors ${directionFilter === item.key ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-[#1C3648] bg-[#071321] hover:bg-[#0A1B2B]'}`}>
              <span className={`block text-sm font-bold ${item.color}`}>{item.count}</span>
              <span className="block text-[10px] text-slate-400">{item.label}</span>
            </button>
          ))}
          <button type="button" onClick={downloadEvidenceBrief} disabled={exportRecords.length === 0} className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-100 disabled:opacity-40 sm:col-span-4">
            <FileText className="h-4 w-4" /> Download source-linked evidence brief (.md)
          </button>
        </div>

        <label className="block text-xs text-slate-300">Evidence brief investigation
          <select aria-label="Evidence brief investigation" value={briefScope} onChange={event => setBriefScope(event.target.value)} className="ml-2 max-w-full rounded border border-[#1C3648] bg-[#071321] p-2">
            <option value="current">Current question ({liveEvidence.filter(record => record.investigation_id === workspaceId).length} sources)</option>
            {liveEvidence.some(record => !record.investigation_id) && <option value="legacy">Legacy live sources · question not recorded</option>}
            {investigationOptions.filter(([id]) => id !== workspaceId).map(([id, question]) => <option key={id} value={id}>{question}</option>)}
          </select>
        </label>
        {/* Local filter for already visible evidence records */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter visible evidence records..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#071321] border border-[#1C3648] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <section className="rounded-2xl bg-[#0A1B2B] border border-cyan-500/30 p-5 space-y-4" aria-labelledby="tinyfish-search-title">
        <div>
          <h2 id="tinyfish-search-title" className="font-semibold text-slate-100">Investigate a question with live sources</h2>
          <p className="mt-1 text-xs text-slate-400">Search approved biomedical and regulatory sources, choose one result, then fetch and review its original page. Retrieved text is not an AI-verified claim.</p>
        </div>
        <div className="rounded-xl border border-[#1C3648] bg-[#071321] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-200">Explore a condition, target, compound, or trial</span>
            <button type="button" disabled={busy} onClick={restartGuidedDemo} className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100"><RefreshCw className="h-3 w-3" />Clear retrieval steps</button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Examples: Parkinson’s disease and GLP-1 drugs · metformin and Alzheimer’s · aspirin and colorectal cancer · any question you choose.</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="TinyFish guided workflow progress">
            {[
              { label: 'Search', detail: 'Find current sources' },
              { label: 'Fetch', detail: 'Choose a result to inspect' },
              { label: 'Assess', detail: 'Record finding and unknowns' },
              { label: 'Review & export', detail: 'Confirm source in audit drawer' },
            ].map((step, index) => {
              const complete = index < demoProgress;
              const current = index === demoProgress;
              return <li key={step.label} aria-current={current ? 'step' : undefined} className={`flex items-start gap-2 rounded-lg border p-2 ${complete ? 'border-teal-500/40 bg-teal-500/10' : current ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-[#1C3648] bg-[#06111F]'}`}>
                {complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /> : <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] ${current ? 'border-cyan-300 text-cyan-200' : 'border-slate-600 text-slate-500'}`}>{index + 1}</span>}
                <span><span className={`block text-[11px] font-semibold ${complete || current ? 'text-slate-100' : 'text-slate-400'}`}>{step.label}</span><span className="block text-[9px] text-slate-500">{step.detail}</span></span>
              </li>;
            })}
          </ol>
          <p className="mt-2 text-[10px] text-slate-500" role="status">{demoProgress === 0 ? 'Start by searching. The guide advances as each step succeeds.' : demoProgress === 1 ? 'Search complete — choose one result and fetch its original page.' : demoProgress === 2 ? 'Source fetched — inspect it, add your assessment, then save it.' : 'Saved with Needs Review status. Review in the audit drawer, then download this investigation’s brief.'}</p>
        </div>
        <label className="block text-xs text-slate-300">Researcher’s question
          <textarea aria-label="Researcher question" disabled={busy} maxLength={2000} value={researchQuestion} onChange={event => { invalidateSearch(); setResearchQuestion(event.target.value); setWorkspaceId(crypto.randomUUID()); setBriefScope('current'); }} className="mt-1 block w-full rounded-lg border border-[#1C3648] bg-[#071321] p-3 text-sm text-slate-100" />
        </label>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label>Source integration <select aria-label="Source integration" disabled={busy} value={provider} onChange={event => { invalidateSearch(); setProvider(event.target.value as typeof provider); }} className="rounded-lg border border-[#1C3648] bg-[#071321] p-2 text-slate-100"><option value="tinyfish">TinyFish Search / Fetch</option><option value="clinicaltrials">ClinicalTrials.gov API v2</option></select></label>
          <span className="text-slate-400">{provider === 'clinicaltrials' ? 'Structured registry · no API key needed · registration is not proof of benefit' : 'Live web retrieval · approved domains · server key required'}</span>
        </div>
        <form onSubmit={handleTinyFishSearch} className="flex flex-col sm:flex-row gap-2">
          <label className="sr-only" htmlFor="tinyfish-query">Biomedical source search</label>
          <input
            id="tinyfish-query"
            required
            minLength={3}
            maxLength={280}
            value={tinyfishQuery}
            disabled={busy}
            onChange={event => { invalidateSearch(); setTinyfishQuery(event.target.value); }}
            placeholder="Drug, target, disease, or trial question"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#071321] border border-[#1C3648] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button type="submit" disabled={busy || tinyfishQuery.trim().length < 3 || researchQuestion.trim().length < 10} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-[#06111F] text-sm font-semibold disabled:opacity-50">
            <Search className={`w-4 h-4 ${isSearching ? 'animate-pulse' : ''}`} />
            {isSearching ? 'Searching…' : provider === 'tinyfish' ? 'Search TinyFish' : 'Search trials'}
          </button>
        </form>

        {provider === 'tinyfish' && tinyfishConfigured === false && <p role="note" className="text-xs text-amber-200">No server key configured. Add TINYFISH_API_KEY to .env and restart, or choose ClinicalTrials.gov.</p>}
        {liveError && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{liveError}</div>}

        {searchResults.length > 0 && (
          <div className="space-y-2" aria-live="polite">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">{searchResults.length} approved source{searchResults.length === 1 ? '' : 's'} found · choose one to fetch</h3>
            {searchResults.map(result => (
              <article key={result.url} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1C3648] bg-[#071321] p-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-100">{result.title}</h4>
                  <a className="mt-1 block truncate text-xs text-cyan-300 hover:underline" href={result.url} target="_blank" rel="noreferrer">{result.url}</a>
                  {result.snippet && <p className="mt-1 line-clamp-2 text-xs text-slate-400">{result.snippet}</p>}
                </div>
                <button type="button" onClick={() => handleTinyFishFetch(result)} disabled={busy} className="shrink-0 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50">
                  {fetchingUrl === result.url ? 'Fetching…' : 'Fetch this source'}
                </button>
              </article>
            ))}
          </div>
        )}

        {fetchedPage && (
          <div className="space-y-3 rounded-xl border border-teal-500/30 bg-[#071321] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-200"><Link2 className="h-4 w-4" />Source fetched · researcher review required</div>
            <a className="block text-xs text-cyan-300 hover:underline" href={fetchedPage.url} target="_blank" rel="noreferrer">{fetchedPage.title} ↗</a>
            <p className="text-xs text-slate-400">Retrieved at (UTC): {fetchedPage.retrievedAt} · {fetchedPage.truncated ? 'Truncated to 30,000 characters; inspect the original for more.' : 'Provider-returned material; may not contain full publication text.'}</p>
            {fetchedPage.sourceContext && <details className="text-xs text-slate-300"><summary>Source ID, dates and record context</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">{JSON.stringify(fetchedPage.sourceContext, null, 2)}</pre></details>}
            <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#1C3648] bg-[#06111F] p-3 text-xs leading-relaxed text-slate-300">{fetchedPage.content}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-xs text-slate-300">Optional sample compound link
                <select value={linkedCandidateId} onChange={event => {
                  const nextCandidate = candidates.find(candidate => candidate.id === event.target.value);
                  setLinkedCandidateId(event.target.value);
                  setLinkedCompound(nextCandidate?.name || '');
                }} className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100">
                  <option value="">No sample compound</option>{candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name} · {candidate.known_indication}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-xs text-slate-300">Compound (any researcher-entered name)
                <input aria-label="Compound annotation" value={linkedCompound} maxLength={120} onChange={event => { setLinkedCompound(event.target.value); setLinkedCandidateId(''); }} className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100" />
              </label>
              <label className="space-y-1 text-xs text-slate-300">Disease / research area
                <input value={linkedDisease} onChange={event => setLinkedDisease(event.target.value)} maxLength={120} placeholder="e.g. Alzheimer's disease, Parkinson's disease, lung cancer" className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100 placeholder:text-slate-500" />
              </label>
              <label className="space-y-1 text-xs text-slate-300">Target link
                <input value={linkedTarget} onChange={event => setLinkedTarget(event.target.value)} maxLength={100} placeholder="Enter a target, or leave blank" className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100 placeholder:text-slate-500" />
              </label>
              <label className="space-y-1 text-xs text-slate-300">Evidence type
                <select value={evidenceType} onChange={event => setEvidenceType(event.target.value as EvidenceCategory)} className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100">
                  <option value="E0: Unclassified source">Unclassified — review later</option>
                  <option value="E1: Human / Regulatory">Human / Regulatory</option>
                  <option value="E2: In Vivo">In Vivo</option>
                  <option value="E3: In Vitro / Assay">In Vitro / Assay</option>
                  <option value="E4: Computational">Computational</option>
                  <option value="E5: Inferred / Hypothesis">Inferred / Hypothesis</option>
                </select>
              </label>
              <label className="space-y-1 text-xs text-slate-300">Your initial assessment
                <select value={evidenceDirection} onChange={event => setEvidenceDirection(event.target.value as EvidenceDirection)} className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100">
                  <option value="unclear">Unclear / not assessed</option>
                  <option value="supports">Appears to support</option>
                  <option value="contradicts">Appears to contradict</option>
                  <option value="contextual">Contextual information</option>
                </select>
              </label>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-cyan-100">Researcher-authored evidence brief</h3>
                <p className="mt-1 text-[10px] text-slate-400">Enter details after inspecting the source. ReThera does not generate or verify this interpretation.</p>
              </div>
              <label className="block space-y-1 text-xs text-slate-300">Finding summary (required)
                <textarea value={briefFinding} onChange={event => setBriefFinding(event.target.value)} maxLength={1200} rows={2} placeholder="What does this source report that matters to the question?" className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100 placeholder:text-slate-500" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-slate-300">Study type
                  <select value={briefStudyType} onChange={event => setBriefStudyType(event.target.value)} className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100">
                    <option value="">Not assessed</option><option>Cell / in vitro</option><option>Animal / in vivo</option><option>Human observational</option><option>Clinical trial</option><option>Review / meta-analysis</option><option>Other / unclear</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs text-slate-300">Model or population
                  <input value={briefModel} onChange={event => setBriefModel(event.target.value)} maxLength={500} placeholder="e.g. MCF-7 cells; patient cohort details" className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100 placeholder:text-slate-500" />
                </label>
              </div>
              <label className="block space-y-1 text-xs text-slate-300">What remains unknown (required)
                <textarea aria-label="What remains unknown" value={briefUnknowns} onChange={event => setBriefUnknowns(event.target.value)} maxLength={1200} rows={2} placeholder="What does this source leave unanswered about your research question?" className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100" />
              </label>
              <label className="block space-y-1 text-xs text-slate-300">Limitations / uncertainty
                <textarea value={briefLimitations} onChange={event => setBriefLimitations(event.target.value)} maxLength={1200} rows={2} placeholder="What should a researcher be cautious about?" className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100 placeholder:text-slate-500" />
              </label>
            </div>
            <p className="text-[11px] text-amber-200">Candidate, target, evidence type, and direction are your research annotations; ReThera does not infer them from the page. The source is saved as unreviewed until you confirm it in the evidence drawer.</p>
            <button type="button" onClick={handleSaveFetchedEvidence} disabled={!briefFinding.trim() || !briefUnknowns.trim()} className="disabled:opacity-40 rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#06111F]">Save to evidence ledger</button>
          </div>
        )}
      </section>

      {/* Main 12-Col Split Grid: Feed (8 cols) / Selected Evidence Side Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 cols: Results Table */}
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-2xl bg-[#0A1B2B] border border-[#1C3648] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C3648] bg-[#071321] text-[#9BB0BF] font-mono text-[10px] uppercase">
                    <th className="py-3 px-3">Source Title & Citation</th>
                    <th className="py-3 px-3">Provider</th>
                    <th className="py-3 px-3">Linked Entities</th>
                    <th className="py-3 px-3">Direction</th>
                    <th className="py-3 px-3">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C3648]/50">
                  {filteredEvidence.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No matching records in this view yet. Run a TinyFish Search above to add a live source.</td></tr>
                  )}
                  {filteredEvidence.map(ev => {
                    const isSelected = selectedRecord?.id === ev.id;
                    return (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedRecord(ev)}
                        className={`hover:bg-[#071321] transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-semibold text-slate-100 hover:text-cyan-300 line-clamp-1">
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {ev.published_date} • {ev.retrieved_date.split(' ')[0]}
                          </div>
                          {isLiveEvidence(ev) ? <div className="mt-1 text-[10px] text-cyan-300">Live retrieval · researcher-linked source</div> : <div className="mt-1 text-[10px] text-amber-300">Illustrative sample · not a live result</div>}
                        </td>

                        <td className="py-3 px-3 text-[11px] text-slate-300 font-mono">
                          {ev.source_provider.split('/')[0]}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {ev.linked_compounds.map(c => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300">
                                {c.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge type="direction" value={ev.direction} />
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge type="review" value={ev.review_status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Selected Evidence Side Inspection Panel */}
        {currentRecord && <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C3648]">
            <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              {isLiveEvidence(currentRecord) ? 'Retrieved Evidence Details' : 'Illustrative Evidence Preview'}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#071321] text-cyan-300 border border-cyan-500/30">
              {currentRecord.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-100 leading-snug mb-1">
                {currentRecord.title}
              </h4>
              <a
                href={currentRecord.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 break-all"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                {currentRecord.url}
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge type="category" value={currentRecord.category} />
              <StatusBadge type="direction" value={currentRecord.direction} />
              <StatusBadge type="review" value={currentRecord.review_status} />
            </div>

            {currentRecord.researcher_brief && (
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3 space-y-2">
                <div className="font-bold uppercase tracking-wider text-[9px] text-cyan-200">Researcher-authored brief</div>
                <p className="text-xs text-slate-200"><strong>Question:</strong> {currentRecord.research_question || 'Not recorded (sample or legacy)'}</p>
                <p className="text-xs text-amber-100"><strong>What remains unknown:</strong> {currentRecord.researcher_brief?.unknowns || 'Not recorded'}</p>
                {currentRecord.researcher_brief.finding && <p className="text-[11px] text-slate-200"><strong>Finding:</strong> {currentRecord.researcher_brief.finding}</p>}
                {currentRecord.researcher_brief.study_type && <p className="text-[11px] text-slate-300"><strong>Study type:</strong> {currentRecord.researcher_brief.study_type}</p>}
                {currentRecord.researcher_brief.model_population && <p className="text-[11px] text-slate-300"><strong>Model / population:</strong> {currentRecord.researcher_brief.model_population}</p>}
                {currentRecord.researcher_brief.limitations && <p className="text-[11px] text-amber-100"><strong>Limitations:</strong> {currentRecord.researcher_brief.limitations}</p>}
              </div>
            )}

            {/* Live records contain source text, not a generated or extracted claim. */}
            <div className={`p-3.5 rounded-xl border leading-relaxed text-[11px] ${
              currentRecord.direction === 'contradicts'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                : 'bg-[#071321] border-[#1C3648] text-slate-200'
            }`}>
              <span className="font-bold uppercase tracking-wider text-[9px] block mb-1 opacity-75">
                {isLiveEvidence(currentRecord) ? 'Fetched source text · not AI-interpreted:' : 'Illustrative demo claim · not live evidence:'}
              </span>
              {currentRecord.claim}
            </div>

            {/* Metadata specs */}
            <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-1.5 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>{isLiveEvidence(currentRecord) ? 'Scientific extraction:' : 'Demo extraction confidence:'}</span>
                <span className="text-cyan-300 font-bold">{isLiveEvidence(currentRecord) || currentRecord.extraction_confidence == null ? 'Not performed' : 'Illustrative only'}</span>
              </div>
              <div className="flex justify-between">
                <span>Published Date:</span>
                <span className="text-slate-300">{currentRecord.published_date}</span>
              </div>
              <div className="flex justify-between">
                <span>Retrieved Date:</span>
                <span className="text-teal-300">{currentRecord.retrieved_date}</span>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-1 text-[10px] font-mono text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider block">{isLiveEvidence(currentRecord) ? 'Retrieval audit trail:' : 'Demo audit trail:'}</span>
              <div className="p-2 rounded bg-[#06111F] border border-slate-800 space-y-1">
                {(isLiveEvidence(currentRecord) ? currentRecord.audit_trail : ['Illustrative example for interface review; this record was not retrieved or analyzed by the live prototype.']).map((st, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Full Review Drawer CTA */}
            <div className="pt-2">
              <button
                onClick={() => onOpenEvidenceDrawer(currentRecord.id)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D2233] text-cyan-300 border border-cyan-500/40 hover:bg-[#112D42] text-xs font-semibold transition-colors"
              >
                Open Full Audit Drawer & Review
              </button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
};
