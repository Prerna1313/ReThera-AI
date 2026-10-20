import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { createResearchApi } from './research.mjs';
const researchApi = createResearchApi();

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3001);
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

async function handleApi(request, response, url) {
  if (url.pathname === '/api/health' && request.method === 'GET') {
    const key = process.env.TINYFISH_API_KEY?.trim();
    return sendJson(response, 200, { tinyfishConfigured: Boolean(key && key !== 'replace-with-your-tinyfish-api-key'), clinicalTrialsAvailable: true });
  }

  const pubchemMatch = url.pathname.match(/^\/api\/pubchem\/(\d+)\/conformer$/);
  if (pubchemMatch && request.method === 'GET') {
    const cid = pubchemMatch[1];
    const upstream = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`, {
      headers: { accept: 'chemical/x-mdl-sdfile, text/plain' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!upstream.ok) return sendJson(response, upstream.status === 404 ? 404 : 502, { error: upstream.status === 404 ? 'PubChem has no 3D conformer for this compound.' : 'PubChem could not return a 3D conformer right now.' });
    const sdf = (await upstream.text()).slice(0, 1_000_000);
    if (!sdf.includes('M  END')) return sendJson(response, 502, { error: 'PubChem returned an unreadable 3D conformer.' });
    return sendJson(response, 200, { cid, sdf, source: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` });
  }

  if (/^\/api\/(tinyfish|clinicaltrials)\/(search|fetch)$/.test(url.pathname) && request.method === 'POST') {
    return sendJson(response, 200, await researchApi(url.pathname, await readJson(request)));
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
          code: error?.code || 'REQUEST_FAILED',
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
