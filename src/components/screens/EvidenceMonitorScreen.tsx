import React, { useEffect, useState } from 'react';
import { Candidate, EvidenceCategory, EvidenceDirection, EvidenceRecord, NavigationTab } from '../../types';
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
  title: string;
  url: string;
  snippet: string;
  publishedDate: string | null;
}

interface TinyFishFetchedPage extends TinyFishSearchResult {
  content: string;
  retrievedAt: string;
}

interface EvidenceMonitorScreenProps {
  candidates: Candidate[];
  evidenceList: EvidenceRecord[];
  onOpenEvidenceDrawer: (evidenceId: string) => void;
  onAddEvidence: (record: EvidenceRecord) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const EvidenceMonitorScreen: React.FC<EvidenceMonitorScreenProps> = ({
  candidates,
  evidenceList,
  onOpenEvidenceDrawer,
  onAddEvidence,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'monitored' | 'library'>('recent');
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord>(evidenceList[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tinyfishQuery, setTinyfishQuery] = useState('Tamoxifen ESR1 resistance breast cancer clinical study');
  const [tinyfishConfigured, setTinyfishConfigured] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TinyFishSearchResult[]>([]);
  const [fetchedPage, setFetchedPage] = useState<TinyFishFetchedPage | null>(null);
  const [liveError, setLiveError] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceCategory>('E0: Unclassified source');
  const [evidenceDirection, setEvidenceDirection] = useState<EvidenceDirection>('unclear');
  const [linkedCandidateId, setLinkedCandidateId] = useState(candidates[0]?.id || '');
  const selectedCandidate = candidates.find(candidate => candidate.id === linkedCandidateId);
  const [linkedTarget, setLinkedTarget] = useState(selectedCandidate?.predicted_target || '');

  useEffect(() => {
    fetch('/api/health')
      .then(response => response.json())
      .then(data => setTinyfishConfigured(Boolean(data.tinyfishConfigured)))
      .catch(() => setTinyfishConfigured(false));
  }, []);

  const handleTinyFishSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearching(true);
    setLiveError('');
    setSearchResults([]);
    setFetchedPage(null);
    try {
      const response = await fetch('/api/tinyfish/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: tinyfishQuery }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search could not be completed.');
      setSearchResults(data.results || []);
      if (!data.results?.length) setLiveError('No approved biomedical or regulatory sources matched. Try a different search.');
      if (data.filteredCount) setLiveError(`${data.filteredCount} result(s) were hidden because their domains are outside the approved-source list.`);
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'Search could not be completed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTinyFishFetch = async (result: TinyFishSearchResult) => {
    setFetchingUrl(result.url);
    setLiveError('');
    setFetchedPage(null);
    try {
      const response = await fetch('/api/tinyfish/fetch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: result.url, title: result.title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The selected page could not be fetched.');
      setFetchedPage({ ...result, ...data });
      setEvidenceType('E0: Unclassified source');
      setEvidenceDirection('unclear');
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'The selected page could not be fetched.');
    } finally {
      setFetchingUrl(null);
    }
  };

  const handleSaveFetchedEvidence = () => {
    if (!fetchedPage) return;
    const candidate = candidates.find(item => item.id === linkedCandidateId);
    const record: EvidenceRecord = {
      id: `live-tinyfish-${crypto.randomUUID()}`,
      title: fetchedPage.title,
      url: fetchedPage.url,
      source_provider: 'TinyFish Search & Fetch',
      published_date: fetchedPage.publishedDate || 'Not provided — check source',
      retrieved_date: fetchedPage.retrievedAt,
      linked_compounds: candidate ? [candidate.name] : [],
      linked_targets: linkedTarget ? [linkedTarget] : [],
      linked_diseases: ['Breast Cancer (ER+)'],
      claim: fetchedPage.content,
      category: evidenceType,
      direction: evidenceDirection,
      review_status: 'Needs Review',
      limitations: 'Page text was retrieved with TinyFish and has not been interpreted or verified by ReThera. Check the original source, study context, dates, and relevance before using it as evidence.',
      audit_trail: [
        `TinyFish Search query: ${tinyfishQuery.trim()}`,
        `Selected source: ${fetchedPage.url}`,
        `TinyFish Fetch completed: ${fetchedPage.retrievedAt}`,
        `Researcher linked this source to ${candidate?.name || 'no candidate'}${linkedTarget ? ` and target ${linkedTarget}` : ''} for Breast Cancer (ER+).`,
        'Classification entered by the researcher; source confirmation is still required.',
      ],
    };
    onAddEvidence(record);
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
  const liveEvidenceCount = evidenceList.filter(record => record.source_provider === 'TinyFish Search & Fetch').length;
  const filteredEvidence = matchingEvidence.filter(record =>
    activeTab === 'monitored'
      ? record.source_provider === 'TinyFish Search & Fetch'
      : activeTab === 'library'
        ? record.source_provider !== 'TinyFish Search & Fetch'
        : true
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              TINYFISH SEARCH & FETCH
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
          <span className="text-[11px] text-slate-400">One explicit Search → select → Fetch sequence</span>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="p-4 rounded-xl bg-[#0A1B2B] border border-[#1C3648] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'recent', label: `All Evidence (${evidenceList.length})` },
              { id: 'monitored', label: `Live TinyFish (${liveEvidenceCount})` },
              { id: 'library', label: `Example Records (${evidenceList.length - liveEvidenceCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
            <span>{liveEvidenceCount} TinyFish source record{liveEvidenceCount === 1 ? '' : 's'} saved in this browser</span>
          </div>
        </div>

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
          <h2 id="tinyfish-search-title" className="font-semibold text-slate-100">Find a current source with TinyFish</h2>
          <p className="mt-1 text-xs text-slate-400">Search approved biomedical and regulatory sources, choose one result, then fetch and review its original page. Retrieved text is not an AI-verified claim.</p>
        </div>
        <form onSubmit={handleTinyFishSearch} className="flex flex-col sm:flex-row gap-2">
          <label className="sr-only" htmlFor="tinyfish-query">Biomedical source search</label>
          <input
            id="tinyfish-query"
            required
            minLength={3}
            maxLength={280}
            value={tinyfishQuery}
            onChange={event => setTinyfishQuery(event.target.value)}
            placeholder="Drug, target, disease, or trial question"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#071321] border border-[#1C3648] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button type="submit" disabled={isSearching || tinyfishQuery.trim().length < 3} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-[#06111F] text-sm font-semibold disabled:opacity-50">
            <Search className={`w-4 h-4 ${isSearching ? 'animate-pulse' : ''}`} />
            {isSearching ? 'Searching…' : 'Search TinyFish'}
          </button>
        </form>

        {liveError && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{liveError}</div>}

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
                <button type="button" onClick={() => handleTinyFishFetch(result)} disabled={fetchingUrl !== null} className="shrink-0 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50">
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
            <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#1C3648] bg-[#06111F] p-3 text-xs leading-relaxed text-slate-300">{fetchedPage.content}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-xs text-slate-300">Research candidate link
                <select value={linkedCandidateId} onChange={event => {
                  const nextCandidate = candidates.find(candidate => candidate.id === event.target.value);
                  setLinkedCandidateId(event.target.value);
                  setLinkedTarget(nextCandidate?.predicted_target || '');
                }} className="block w-full rounded-lg border border-[#1C3648] bg-[#06111F] p-2 text-slate-100">
                  {candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name} · {candidate.known_indication}</option>)}
                </select>
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
            <p className="text-[11px] text-amber-200">Candidate, target, evidence type, and direction are your research annotations; ReThera does not infer them from the page. The source is saved as unreviewed until you confirm it in the evidence drawer.</p>
            <button type="button" onClick={handleSaveFetchedEvidence} className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#06111F]">Save to evidence ledger</button>
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
                          {ev.source_provider !== 'TinyFish Search & Fetch' && <div className="mt-1 text-[10px] text-amber-300">Illustrative sample · not a live result</div>}
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
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0A1B2B] border border-[#1C3648] shadow-sm space-y-4 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C3648]">
            <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              {selectedRecord.source_provider === 'TinyFish Search & Fetch' ? 'Retrieved Evidence Details' : 'Illustrative Evidence Preview'}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#071321] text-cyan-300 border border-cyan-500/30">
              {selectedRecord.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-100 leading-snug mb-1">
                {selectedRecord.title}
              </h4>
              <a
                href={selectedRecord.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 break-all"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                {selectedRecord.url}
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge type="category" value={selectedRecord.category} />
              <StatusBadge type="direction" value={selectedRecord.direction} />
              <StatusBadge type="review" value={selectedRecord.review_status} />
            </div>

            {/* Live records contain source text, not a generated or extracted claim. */}
            <div className={`p-3.5 rounded-xl border leading-relaxed text-[11px] ${
              selectedRecord.direction === 'contradicts'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                : 'bg-[#071321] border-[#1C3648] text-slate-200'
            }`}>
              <span className="font-bold uppercase tracking-wider text-[9px] block mb-1 opacity-75">
                {selectedRecord.source_provider === 'TinyFish Search & Fetch' ? 'Fetched source text · not AI-interpreted:' : 'Illustrative demo claim · not live evidence:'}
              </span>
              {selectedRecord.claim}
            </div>

            {/* Metadata specs */}
            <div className="p-3 rounded-xl bg-[#071321] border border-[#1C3648] space-y-1.5 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>{selectedRecord.source_provider === 'TinyFish Search & Fetch' ? 'Scientific extraction:' : 'Demo extraction confidence:'}</span>
                <span className="text-cyan-300 font-bold">{selectedRecord.source_provider === 'TinyFish Search & Fetch' || selectedRecord.extraction_confidence == null ? 'Not performed' : 'Illustrative only'}</span>
              </div>
              <div className="flex justify-between">
                <span>Published Date:</span>
                <span className="text-slate-300">{selectedRecord.published_date}</span>
              </div>
              <div className="flex justify-between">
                <span>Retrieved Date:</span>
                <span className="text-teal-300">{selectedRecord.retrieved_date}</span>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="space-y-1 text-[10px] font-mono text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider block">{selectedRecord.source_provider === 'TinyFish Search & Fetch' ? 'Retrieval audit trail:' : 'Demo audit trail:'}</span>
              <div className="p-2 rounded bg-[#06111F] border border-slate-800 space-y-1">
                {(selectedRecord.source_provider === 'TinyFish Search & Fetch' ? selectedRecord.audit_trail : ['Illustrative example for interface review; this record was not retrieved or analyzed by the live prototype.']).map((st, idx) => (
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
                onClick={() => onOpenEvidenceDrawer(selectedRecord.id)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D2233] text-cyan-300 border border-cyan-500/40 hover:bg-[#112D42] text-xs font-semibold transition-colors"
              >
                Open Full Audit Drawer & Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
