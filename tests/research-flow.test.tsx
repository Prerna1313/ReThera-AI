import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { EvidenceMonitorScreen } from '../src/components/screens/EvidenceMonitorScreen';
import { KnowledgeGraphCanvas } from '../src/components/scientific/KnowledgeGraphCanvas';
import { ReportsLibraryScreen } from '../src/components/screens/ReportsLibraryScreen';
import { evidenceBrief } from '../src/data/evidence';
import { mockCandidates, mockEvidenceRecords } from '../src/data/mockData';
import type { EvidenceRecord, ResearchScope } from '../src/types';

const scope: ResearchScope = { id: 'investigation-a', question: 'What remains unknown about metformin in Alzheimer disease?', disease: 'Alzheimer disease', target: 'AMPK', compound: 'Metformin', query: 'metformin Alzheimer disease', createdAt: '2026-10-20T10:00:00Z' };
const source = { title: 'Retrieved study', url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/', snippet: 'Study context', publishedDate: '2024-01-01' };
const fetched = { ...source, content: 'Original fetched material\nwith study context.', retrievedAt: '2026-10-20T10:02:00Z', sourceContext: { requestedUrl: source.url }, truncated: false };
const response = (value: unknown, status = 200) => ({ ok: status < 400, status, json: async () => value });
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('scrollTo', vi.fn());
  fetchMock = vi.fn(async (url: string) => url === '/api/health' ? response({ tinyfishConfigured: true }) : url.endsWith('/search') ? response({ results: [source], retrievedAt: '2026-10-20T10:01:00Z' }) : response(fetched));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const monitorProps = () => ({ scope, researcherName: 'Test researcher', candidates: mockCandidates, evidenceList: mockEvidenceRecords, onOpenEvidenceDrawer: vi.fn(), onAddEvidence: vi.fn(), onNavigate: vi.fn() });
async function searchAndFetch() {
  fireEvent.click(screen.getByRole('button', { name: 'Search TinyFish' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Fetch this source' }));
  await screen.findByText('Source fetched · researcher review required');
}

it('New Investigation hands the chosen disease and question into real retrieval, review and persistence', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /New Investigation/ }));
  fireEvent.click(screen.getByRole('button', { name: /Example: Alzheimer/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue to source search' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect((screen.getByLabelText('Researcher question') as HTMLTextAreaElement).value).toContain('metformin in Alzheimer');
  expect(fetchMock.mock.calls.filter(([url]) => url !== '/api/health')).toHaveLength(0);
  await searchAndFetch();
  const save = screen.getByRole('button', { name: 'Save to evidence ledger' });
  expect((save as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Finding summary (required)'), { target: { value: 'Study findings need further assessment.' } });
  fireEvent.change(screen.getByLabelText('What remains unknown'), { target: { value: 'Clinical benefit remains unknown.' } });
  fireEvent.click(save);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Source' }));
  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('rethera-live-evidence') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].review_status).toBe('Reviewed / Source Confirmed');
    expect(saved[0].research_question).toContain('metformin in Alzheimer');
    expect(saved[0].linked_compounds).toEqual(['Metformin']);
    expect(saved[0].linked_targets).toEqual([]);
    expect(saved[0].reviewed_at).toBeTruthy();
    expect(saved[0].provenance).toBe('live');
    const brief = evidenceBrief(saved);
    for (const value of [fetched.content.split('\n')[0], source.url, fetched.retrievedAt, 'Clinical benefit remains unknown.', 'Reviewed / Source Confirmed']) expect(brief).toContain(value);
    expect(brief).not.toContain(mockEvidenceRecords[0].title);
  });
});

describe('failure states never advance to a completed retrieval or save evidence', () => {
  for (const [status, error] of [[503, 'TinyFish is not configured.'], [502, 'TinyFish rejected the API key.'], [429, 'TinyFish rate limit reached.'], [504, 'TinyFish took too long to respond.']] as const) {
    it(`search displays ${status}: ${error}`, async () => {
      fetchMock.mockImplementation(async url => url === '/api/health' ? response({ tinyfishConfigured: status !== 503 }) : response({ error }, status));
      const props = monitorProps();
      render(<EvidenceMonitorScreen {...props} />);
      fireEvent.click(screen.getByRole('button', { name: 'Search TinyFish' }));
      expect((await screen.findByRole('alert')).textContent).toBe(error);
      expect(screen.queryByRole('button', { name: 'Fetch this source' })).toBeNull();
      expect(props.onAddEvidence).not.toHaveBeenCalled();
    });
  }
  it('empty results explain the next step', async () => {
    fetchMock.mockImplementation(async url => url === '/api/health' ? response({ tinyfishConfigured: true }) : response({ results: [], filteredCount: 2 }));
    render(<EvidenceMonitorScreen {...monitorProps()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Search TinyFish' }));
    expect((await screen.findByRole('alert')).textContent).toContain('No useful approved source found');
  });
  it('failed Fetch keeps results available for another selection', async () => {
    fetchMock.mockImplementation(async url => url === '/api/health' ? response({ tinyfishConfigured: true }) : url.endsWith('/search') ? response({ results: [source] }) : response({ error: 'No readable material. Choose another source.' }, 502));
    render(<EvidenceMonitorScreen {...monitorProps()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Search TinyFish' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Fetch this source' }));
    expect((await screen.findByRole('alert')).textContent).toContain('No readable material');
    expect(screen.queryByRole('button', { name: 'Save to evidence ledger' })).toBeNull();
    expect((screen.getByRole('button', { name: 'Fetch this source' }) as HTMLButtonElement).disabled).toBe(false);
  });
});

it('ClinicalTrials.gov uses structured record endpoints and preserves NCT context', async () => {
  const props = monitorProps();
  fetchMock.mockImplementation(async url => url === '/api/health' ? response({ tinyfishConfigured: false }) : url.endsWith('/search') ? response({ results: [{ ...source, id: 'NCT01234567' }], retrievedAt: 'search time' }) : response({ ...fetched, sourceContext: { nctId: 'NCT01234567', hasResults: false } }));
  render(<EvidenceMonitorScreen {...props} />);
  fireEvent.change(screen.getByLabelText('Source integration'), { target: { value: 'clinicaltrials' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search trials' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Fetch this source' }));
  await screen.findByText('Source fetched · researcher review required');
  fireEvent.change(screen.getByLabelText('Finding summary (required)'), { target: { value: 'Registry description only.' } });
  fireEvent.change(screen.getByLabelText('What remains unknown'), { target: { value: 'Clinical outcomes unknown.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save to evidence ledger' }));
  expect(props.onAddEvidence.mock.calls[0][0].source_context.nctId).toBe('NCT01234567');
  expect(props.onAddEvidence.mock.calls[0][0].source_provider).toBe('ClinicalTrials.gov API v2');
  expect(fetchMock.mock.calls.some(([url]) => url === '/api/clinicaltrials/fetch')).toBe(true);
});

it('a late search from a previous investigation cannot populate the new investigation', async () => {
  let resolveSearch!: (value: unknown) => void;
  fetchMock.mockImplementation(url => url === '/api/health' ? Promise.resolve(response({ tinyfishConfigured: true })) : new Promise(resolve => { resolveSearch = resolve; }));
  const props = monitorProps();
  const { rerender } = render(<EvidenceMonitorScreen {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Search TinyFish' }));
  rerender(<EvidenceMonitorScreen {...props} scope={{ ...scope, id: 'investigation-b', question: 'What is known about ESR1 in breast cancer?' }} />);
  resolveSearch(response({ results: [source] }));
  await waitFor(() => expect((screen.getByRole('button', { name: 'Search TinyFish' }) as HTMLButtonElement).disabled).toBe(false));
  expect(screen.queryByRole('button', { name: 'Fetch this source' })).toBeNull();
  expect((screen.getByLabelText('Researcher question') as HTMLTextAreaElement).value).toContain('ESR1');
});

it('briefs include rejected status and preserve unknowns without importing sample claims', () => {
  const live = { ...mockEvidenceRecords[0], provenance: 'live', research_question: scope.question, researcher_brief: { finding: 'Uncertain', study_type: 'Review', model_population: '', limitations: 'Limited scope', unknowns: 'Dose translation unknown' }, review_status: 'Rejected / Irrelevant', source_context: { nctId: 'NCT01234567' } } as EvidenceRecord;
  const brief = evidenceBrief([live, { ...mockEvidenceRecords[1], provenance: 'sample' }]);
  expect(brief).toContain(scope.question);
  expect(brief).toContain('Dose translation unknown');
  expect(brief).toContain('Rejected / Irrelevant');
  expect(brief).toContain('NCT01234567');
  expect(brief).not.toContain(mockEvidenceRecords[1].title);
});

it('sample graph citations never become live researcher links', () => {
  const nodes = ['a', 'b'].map((id, i) => ({ id, label: id, sublabel: 'Sample node', type: 'target' as const, x: 100 + i * 200, y: 100, radius: 20, color: '#fff', border_color: '#aaa', meta: {} }));
  const edge = { id: 'sample-edge', source: 'a', target: 'b', label: 'sample interaction', direction: 'supports', confidence: 0.9, evidence_ids: [mockEvidenceRecords[0].id] };
  const { container } = render(<KnowledgeGraphCanvas nodes={nodes} edges={[edge]} evidenceRecords={mockEvidenceRecords} onSelectNode={vi.fn()} />);
  fireEvent.click(container.querySelector('[data-graph-item="true"]')!);
  expect(screen.getByText('Sample relationship')).toBeTruthy();
  expect(screen.queryByText('Live source annotation')).toBeNull();
  expect(screen.getByText(/Source URLs in fixtures do not validate/)).toBeTruthy();
});

it('reports keep separate questions and live providers distinct from sample dossiers', () => {
  const records = ['Question about Alzheimer disease', 'Question about ESR1'].map((question, index) => ({ ...mockEvidenceRecords[index], provenance: 'live' as const, investigation_id: `investigation-${index}`, research_question: question, source_provider: index ? 'ClinicalTrials.gov API v2' : 'TinyFish Search & Fetch' }));
  render(<ReportsLibraryScreen evidenceRecords={records} onOpenEvidenceDrawer={vi.fn()} investigations={[]} onOpenReport={vi.fn()} onNavigate={vi.fn()} />);
  expect(screen.getByRole('heading', { name: records[0].research_question })).toBeTruthy();
  expect(screen.getByRole('heading', { name: records[1].research_question })).toBeTruthy();
  expect(screen.getAllByRole('button', { name: 'Download investigation evidence brief (.md)' })).toHaveLength(2);
});

it('changing source integration invalidates previous results and prevents accidental reuse', async () => {
  render(<EvidenceMonitorScreen {...monitorProps()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Search TinyFish' }));
  await screen.findByRole('button', { name: 'Fetch this source' });
  fireEvent.change(screen.getByLabelText('Source integration'), { target: { value: 'clinicaltrials' } });
  expect(screen.queryByRole('button', { name: 'Fetch this source' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Search trials' })).toBeTruthy();
});
