import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createResearchApi } from './research.mjs';

const url = 'https://pubmed.ncbi.nlm.nih.gov/12345678/';
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
const api = (fetchImpl, options = {}) => createResearchApi({ fetchImpl, apiKey: () => 'test-private-key', now: () => '2026-10-20T10:00:00.000Z', ...options });
const search = '/api/tinyfish/search';
const fetchPath = '/api/tinyfish/fetch';

test('missing and placeholder keys fail before any provider call', async () => {
  for (const key of ['', 'replace-with-your-tinyfish-api-key']) {
    await assert.rejects(api(() => assert.fail('No network expected'), { apiKey: () => key })(search, { query: 'metformin Alzheimer' }), { code: 'NOT_CONFIGURED', status: 503 });
  }
});

for (const [status, code, expectedStatus] of [[401, 'INVALID_KEY', 502], [403, 'INVALID_KEY', 502], [429, 'RATE_LIMITED', 429], [504, 'TIMEOUT', 504], [500, 'UPSTREAM_ERROR', 502]]) {
  for (const path of [search, fetchPath]) test(`${path}: HTTP ${status} is actionable and never exposes the key`, async () => {
    try {
      await api(async () => json({ error: 'test-private-key' }, status))(path, { query: 'metformin Alzheimer', url });
      assert.fail('Expected failure');
    } catch (error) {
      assert.equal(error.code, code);
      assert.equal(error.status, expectedStatus);
      assert.ok(!error.message.includes('test-private-key'));
    }
  });
}

test('timeouts and network failures produce safe messages', async () => {
  for (const [error, code] of [[new DOMException('expired', 'TimeoutError'), 'TIMEOUT'], [new TypeError('private upstream detail'), 'NETWORK_ERROR']]) {
    await assert.rejects(api(async () => { throw error; })(search, { query: 'valid query' }), { code });
  }
});

test('empty and filtered searches stay empty with provenance time', async () => {
  for (const results of [[], [{ url: 'https://unapproved.example/paper', title: 'Unknown' }]]) {
    const result = await api(async () => json({ results }))(search, { query: 'valid query' });
    assert.deepEqual(result.results, []);
    assert.equal(result.filteredCount, results.length);
    assert.equal(result.retrievedAt, '2026-10-20T10:00:00.000Z');
  }
});

test('actual TinyFish Search schema is normalized without leaking credentials', async () => {
  const result = await api(async (endpoint, init) => {
    assert.equal(new URL(endpoint).searchParams.get('query'), 'ESR1 breast cancer');
    assert.equal(init.headers['X-API-Key'], 'test-private-key');
    return json({ results: [{ title: 'Study', url, snippet: 'Context' }] });
  })(search, { query: 'ESR1 breast cancer' });
  assert.equal(result.results[0].url, url);
  assert.ok(!JSON.stringify(result).includes('test-private-key'));
});

test('HTTP 200 Fetch per-URL errors and empty material cannot become evidence', async () => {
  for (const payload of [{ results: [], errors: [{ url, error: 'blocked' }] }, { results: [{ url, text: '   ' }] }]) {
    await assert.rejects(api(async () => json(payload))(fetchPath, { url }), { code: 'NO_CONTENT' });
  }
  await assert.rejects(api(async () => json({ errors: [{ url, error: 'timeout' }] }))(fetchPath, { url }), { code: 'TIMEOUT', status: 504 });
});

test('Fetch requests fresh material and preserves title, final URL, dates and truncation', async () => {
  const finalUrl = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC123/';
  const result = await api(async (_, init) => {
    assert.equal(JSON.parse(init.body).ttl, 0);
    return json({ results: [{ url, final_url: finalUrl, title: 'Provider title', text: 'a'.repeat(30001), published_date: '2024-01-01' }] });
  })(fetchPath, { url, title: 'Search title' });
  assert.equal(result.url, finalUrl);
  assert.equal(result.sourceContext.requestedUrl, url);
  assert.equal(result.title, 'Provider title');
  assert.equal(result.publishedDate, '2024-01-01');
  assert.equal(result.content.length, 30000);
  assert.equal(result.truncated, true);
});

test('unapproved URLs and redirects cannot enter the ledger', async () => {
  for (const invalid of ['http://pubmed.ncbi.nlm.nih.gov/x', 'https://pubmed.ncbi.nlm.nih.gov.evil.test/', 'https://user:pass@pubmed.ncbi.nlm.nih.gov/', 'https://pubmed.ncbi.nlm.nih.gov:8443/', 'http://127.0.0.1']) {
    await assert.rejects(api(() => assert.fail('No network expected'))(fetchPath, { url: invalid }), { code: 'INVALID_SOURCE' });
  }
  await assert.rejects(api(async () => json({ results: [{ url, final_url: 'https://evil.test', text: 'material' }] }))(fetchPath, { url }), { code: 'UNAPPROVED_REDIRECT' });
});

test('invalid JSON and incompatible schemas are surfaced', async () => {
  await assert.rejects(api(async () => new Response('<html>bad gateway</html>'))(search, { query: 'valid query' }), { code: 'INVALID_RESPONSE' });
  await assert.rejects(api(async () => json({ wrong: [] }))(search, { query: 'valid query' }), { code: 'INVALID_RESPONSE' });
});

const study = { protocolSection: {
  identificationModule: { nctId: 'NCT01234567', briefTitle: 'Example registry study' },
  statusModule: { studyFirstSubmitDate: '2020-01-01', lastUpdatePostDateStruct: { date: '2026-02-01', type: 'ACTUAL' }, overallStatus: 'COMPLETED' },
  designModule: { studyType: 'INTERVENTIONAL', phases: ['PHASE2'] },
  conditionsModule: { conditions: ['Alzheimer disease'] },
  armsInterventionsModule: { interventions: [{ type: 'DRUG', name: 'Metformin' }] },
}, hasResults: false };

test('ClinicalTrials.gov search and fetch work without TinyFish credentials and retain registry context', async () => {
  const client = api(async endpoint => {
    assert.ok(endpoint.startsWith('https://clinicaltrials.gov/api/v2/studies'));
    return json(endpoint.includes('?') ? { studies: [study] } : study);
  }, { apiKey: () => '' });
  const result = await client('/api/clinicaltrials/search', { query: 'metformin Alzheimer' });
  assert.equal(result.results[0].id, 'NCT01234567');
  const page = await client('/api/clinicaltrials/fetch', { id: result.results[0].id });
  assert.equal(page.sourceContext.nctId, 'NCT01234567');
  assert.equal(page.sourceContext.lastUpdatePosted.date, '2026-02-01');
  assert.equal(page.sourceContext.hasResults, false);
  assert.equal(page.sourceContext.overallStatus, 'COMPLETED');
  assert.deepEqual(JSON.parse(page.content), study);
});

test('registry rejects invalid NCT IDs and mismatched records', async () => {
  await assert.rejects(api(() => assert.fail('No network expected'))('/api/clinicaltrials/fetch', { id: '../secret' }), { code: 'INVALID_RECORD' });
  await assert.rejects(api(async () => json(study))('/api/clinicaltrials/fetch', { id: 'NCT99999999' }), { code: 'INVALID_RESPONSE' });
});
