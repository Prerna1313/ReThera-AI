import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3001);
const allowedDomains = [
  'pubmed.ncbi.nlm.nih.gov', 'pmc.ncbi.nlm.nih.gov', 'europepmc.org',
  'clinicaltrials.gov', 'fda.gov', 'pubchem.ncbi.nlm.nih.gov',
  'platform.opentargets.org',
];

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  }
  try {
    return JSON.parse(body || '{}');
  } catch {
    throw Object.assign(new Error('Request must contain valid JSON.'), { status: 400 });
  }
}

function isAllowedSource(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'https:' && !url.username && !url.password &&
      allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

async function tinyfishRequest(endpoint, init) {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error('TinyFish is not configured. Add TINYFISH_API_KEY to your local .env file, then restart the app.'),
      { status: 503 },
    );
  }

  const response = await fetch(endpoint, {
    ...init,
    headers: { 'X-API-Key': apiKey, ...init.headers },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403
      ? 'TinyFish rejected the API key. Check TINYFISH_API_KEY and restart the app.'
      : `TinyFish request failed (${response.status}). Try again in a moment.`;
    throw Object.assign(new Error(message), { status: response.status === 429 ? 429 : 502 });
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function findResultArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['results', 'search_results', 'web_results', 'organic_results', 'organic', 'web', 'items', 'sources']) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  for (const key of ['data', 'response', 'result']) {
    const found = findResultArray(payload[key]);
    if (found.length) return found;
  }
  return [];
}

function normalizeSearchResult(item) {
  const url = item?.url || item?.link || item?.href || item?.source_url;
  if (typeof url !== 'string' || !isAllowedSource(url)) return null;
  return {
    title: String(item.title || item.name || 'Untitled source').slice(0, 300),
    url,
    snippet: String(item.snippet || item.description || item.content || item.text || '').slice(0, 1_200),
    publishedDate: item.published_date || item.publishedAt || item.date || null,
  };
}

function extractPageText(payload) {
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) return payload.map(extractPageText).filter(Boolean).join('\n\n');
  if (!payload || typeof payload !== 'object') return '';
  for (const key of ['markdown', 'content', 'text', 'main_content', 'cleaned_content', 'body']) {
    if (typeof payload[key] === 'string' && payload[key].trim()) return payload[key].trim();
  }
  for (const key of ['results', 'data', 'response', 'result', 'pages', 'content', 'page', 'document']) {
    const text = extractPageText(payload[key]);
    if (text) return text;
  }
  return '';
}

async function handleApi(request, response, url) {
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return sendJson(response, 200, { tinyfishConfigured: Boolean(process.env.TINYFISH_API_KEY) });
  }

  if (url.pathname === '/api/tinyfish/search' && request.method === 'POST') {
    const body = await readJson(request);
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (query.length < 3 || query.length > 280) {
      return sendJson(response, 400, { error: 'Enter a search query between 3 and 280 characters.' });
    }
    const params = new URLSearchParams({ query });
    const payload = await tinyfishRequest(`https://api.search.tinyfish.ai?${params}`, { method: 'GET' });
    const candidates = findResultArray(payload);
    const approvedResults = candidates.map(normalizeSearchResult).filter(Boolean);
    const results = approvedResults.slice(0, 10);
    return sendJson(response, 200, {
      results,
      filteredCount: Math.max(0, candidates.length - approvedResults.length),
      retrievedAt: new Date().toISOString(),
    });
  }

  if (url.pathname === '/api/tinyfish/fetch' && request.method === 'POST') {
    const body = await readJson(request);
    if (typeof body.url !== 'string' || !isAllowedSource(body.url)) {
      return sendJson(response, 400, { error: 'Choose an HTTPS result from an approved biomedical or regulatory source.' });
    }
    const payload = await tinyfishRequest('https://api.fetch.tinyfish.ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ urls: [body.url] }),
    });
    const content = extractPageText(payload).slice(0, 30_000);
    if (!content) {
      return sendJson(response, 502, { error: 'TinyFish fetched the page but returned no readable text. Try another source.' });
    }
    return sendJson(response, 200, {
      url: body.url,
      title: typeof body.title === 'string' ? body.title.slice(0, 300) : 'Fetched source',
      content,
      retrievedAt: new Date().toISOString(),
    });
  }

  return sendJson(response, 404, { error: 'API route not found.' });
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (requestUrl.pathname.startsWith('/api/')) {
    try {
      await handleApi(request, response, requestUrl);
    } catch (error) {
      if (!response.headersSent) {
        const status = Number(error?.status) || (error?.name === 'TimeoutError' ? 504 : 502);
        sendJson(response, status, {
          error: error?.name === 'TimeoutError'
            ? 'TinyFish took too long to respond. Try again.'
            : (error?.message || 'The request could not be completed.'),
        });
      }
    }
    return;
  }

  if (!production) {
    if (request.method === 'GET' && requestUrl.pathname === '/') {
      try {
        const template = await readFile(join(projectRoot, 'index.html'), 'utf8');
        const html = await vite.transformIndexHtml('/', template);
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' });
        response.end(html);
      } catch {
        sendJson(response, 500, { error: 'The development server could not render the app shell.' });
      }
      return;
    }
    vite.middlewares(request, response, error => {
      if (error && !response.headersSent) sendJson(response, 500, { error: 'The development server could not render this page.' });
    });
    return;
  }

  try {
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^[/\\]+/, '');
    const filePath = resolve(projectRoot, 'dist', relativePath);
    if (filePath !== resolve(projectRoot, 'dist') && !filePath.startsWith(resolve(projectRoot, 'dist') + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
    const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
    response.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
    response.end(await readFile(filePath));
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

const vite = production ? null : await createViteServer({
  configFile: join(projectRoot, 'vite.config.ts'),
  server: { middlewareMode: true, hmr: { server } },
  appType: 'custom',
});

server.listen(port, production ? '0.0.0.0' : '::', () => {
  console.log(`ReThera AI ${production ? 'server' : 'development server'} listening on http://localhost:${port}`);
});

async function shutdown() {
  await vite?.close();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
