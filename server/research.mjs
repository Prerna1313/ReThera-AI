// The HTTP boundary is injectable so failure paths run without credentials or provider calls.
export const allowedDomains = ['pubmed.ncbi.nlm.nih.gov', 'pmc.ncbi.nlm.nih.gov', 'europepmc.org', 'clinicaltrials.gov', 'fda.gov', 'pubchem.ncbi.nlm.nih.gov', 'platform.opentargets.org'];
const fail = (status, code, message) => Object.assign(new Error(message), { status, code });
export function isAllowedSource(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') && allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch { return false; }
}

export function createResearchApi({ fetchImpl = fetch, apiKey = () => process.env.TINYFISH_API_KEY, timeout = ms => AbortSignal.timeout(ms), now = () => new Date().toISOString() } = {}) {
  async function upstream(url, init = {}, provider = 'TinyFish', ms = 30_000) {
    try {
      const response = await fetchImpl(url, { ...init, signal: timeout(ms) });
      if (!response.ok) {
        if ([401, 403].includes(response.status)) throw fail(502, 'INVALID_KEY', `${provider} rejected the API key. Check TINYFISH_API_KEY and restart the app.`);
        if (response.status === 429) throw fail(429, 'RATE_LIMITED', `${provider} rate limit reached. Wait before retrying; no evidence was saved.`);
        if ([408, 504].includes(response.status)) throw fail(504, 'TIMEOUT', `${provider} timed out. Retry this step or choose another source; no evidence was saved.`);
        throw fail(502, 'UPSTREAM_ERROR', `${provider} could not complete the request (${response.status}). Retry this step.`);
      }
      try { return await response.json(); }
      catch (error) {
        if (['TimeoutError', 'AbortError'].includes(error.name)) throw error;
        throw fail(502, 'INVALID_RESPONSE', `${provider} returned an unreadable response. Try again.`);
      }
    } catch (error) {
      if (error.code && error.status) throw error;
      if (['TimeoutError', 'AbortError'].includes(error.name)) throw fail(504, 'TIMEOUT', `${provider} took too long to respond. Retry this step or choose another source; no evidence was saved.`);
      throw fail(502, 'NETWORK_ERROR', `${provider} could not be reached. Check the connection and retry.`);
    }
  }
  function headers() {
    const key = apiKey()?.trim();
    if (!key || key === 'replace-with-your-tinyfish-api-key') throw fail(503, 'NOT_CONFIGURED', 'TinyFish is not configured. Add TINYFISH_API_KEY to .env and restart the app. ClinicalTrials.gov is available without a key.');
    return { 'X-API-Key': key, 'content-type': 'application/json' };
  }
  return async function research(path, body) {
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (path.endsWith('/search') && (query.length < 3 || query.length > 280)) throw fail(400, 'INVALID_QUERY', 'Enter a search query between 3 and 280 characters.');
    if (path === '/api/tinyfish/search') {
      const data = await upstream(`https://api.search.tinyfish.ai?${new URLSearchParams({ query })}`, { headers: headers() });
      if (!Array.isArray(data.results)) throw fail(502, 'INVALID_RESPONSE', 'TinyFish returned an unreadable search response. Try again.');
      const approved = data.results.filter(item => item && isAllowedSource(item.url));
      return { results: approved.slice(0, 10).map(item => ({ title: String(item.title || 'Untitled source').slice(0, 300), url: item.url, snippet: String(item.snippet || '').slice(0, 1200), publishedDate: item.published_date || null })), filteredCount: data.results.length - approved.length, retrievedAt: now() };
    }
    if (path === '/api/tinyfish/fetch') {
      if (!isAllowedSource(body.url)) throw fail(400, 'INVALID_SOURCE', 'Choose an HTTPS result from an approved biomedical or regulatory source.');
      const data = await upstream('https://api.fetch.tinyfish.ai', { method: 'POST', headers: headers(), body: JSON.stringify({ urls: [body.url], ttl: 0 }) }, 'TinyFish', 150_000);
      const page = data.results?.find(item => item.url === body.url);
      if (!page || typeof page.text !== 'string' || !page.text.trim()) {
        const detail = data.errors?.find(item => item.url === body.url);
        const timedOut = /timeout|timed.out/i.test(JSON.stringify(detail || {}));
        throw fail(timedOut ? 504 : 502, timedOut ? 'TIMEOUT' : 'NO_CONTENT', timedOut ? 'TinyFish timed out fetching this source. Retry or select another source.' : 'TinyFish returned no readable material for this source. Select another source; no evidence was saved.');
      }
      const finalUrl = page.final_url || body.url;
      if (!isAllowedSource(finalUrl)) throw fail(502, 'UNAPPROVED_REDIRECT', 'The source redirected outside approved biomedical domains. Choose another source.');
      return { url: finalUrl, title: String(page.title || body.title || 'Fetched source').slice(0, 300), publishedDate: page.published_date || null, content: page.text.slice(0, 30_000), truncated: page.text.length > 30_000, retrievedAt: now(), sourceContext: { requestedUrl: body.url, finalUrl, format: page.format || 'markdown', freshness: 'Live fetch requested (ttl=0)' } };
    }
    if (path === '/api/clinicaltrials/search') {
      const params = new URLSearchParams({ 'query.term': query, pageSize: '10', format: 'json' });
      const data = await upstream(`https://clinicaltrials.gov/api/v2/studies?${params}`, {}, 'ClinicalTrials.gov');
      if (!Array.isArray(data.studies)) throw fail(502, 'INVALID_RESPONSE', 'ClinicalTrials.gov returned an unreadable search response.');
      return { results: data.studies.flatMap(study => {
        const p = study.protocolSection;
        const id = p?.identificationModule?.nctId;
        return /^NCT\d{8}$/.test(id || '') ? [{ id, title: p.identificationModule.briefTitle || id, url: `https://clinicaltrials.gov/study/${id}`, snippet: p.descriptionModule?.briefSummary || '', publishedDate: p.statusModule?.studyFirstSubmitDate || null }] : [];
      }), retrievedAt: now() };
    }
    if (path === '/api/clinicaltrials/fetch') {
      if (!/^NCT\d{8}$/.test(body.id || '')) throw fail(400, 'INVALID_RECORD', 'Select a valid ClinicalTrials.gov NCT record.');
      const data = await upstream(`https://clinicaltrials.gov/api/v2/studies/${body.id}`, {}, 'ClinicalTrials.gov');
      const p = data.protocolSection;
      if (p?.identificationModule?.nctId !== body.id) throw fail(502, 'INVALID_RESPONSE', 'ClinicalTrials.gov returned a different or unreadable study record.');
      const context = {
        nctId: body.id,
        firstSubmitted: p.statusModule?.studyFirstSubmitDate || null,
        firstPosted: p.statusModule?.studyFirstPostDateStruct || null,
        lastUpdatePosted: p.statusModule?.lastUpdatePostDateStruct || null,
        overallStatus: p.statusModule?.overallStatus || null,
        studyType: p.designModule?.studyType || null,
        phases: p.designModule?.phases || [],
        sponsor: p.sponsorCollaboratorsModule?.leadSponsor || null,
        conditions: p.conditionsModule?.conditions || [],
        interventions: p.armsInterventionsModule?.interventions || [],
        hasResults: data.hasResults ?? Boolean(data.resultsSection),
        apiUrl: `https://clinicaltrials.gov/api/v2/studies/${body.id}`,
        materialScope: 'Complete registry API JSON; registration does not establish efficacy or safety.',
      };
      return { title: p.identificationModule.officialTitle || p.identificationModule.briefTitle || body.id, url: `https://clinicaltrials.gov/study/${body.id}`, publishedDate: context.firstSubmitted, content: JSON.stringify(data, null, 2), sourceContext: context, retrievedAt: now(), truncated: false };
    }
    throw fail(404, 'NOT_FOUND', 'API route not found.');
  };
}
