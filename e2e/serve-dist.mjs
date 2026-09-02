// Serves `dist/` with the REAL production headers, read from vercel.json.
//
// `vite preview` would be the obvious thing and is the wrong thing: it does not read vercel.json, so
// it serves the app with no Content-Security-Policy at all. A smoke suite run behind it would pass on
// exactly the deploy that breaks — a CSP that forbids `worker-src` kills every solve, and the whole
// point of testing in a browser is to catch that class of failure.
//
// The headers are READ from vercel.json rather than restated here, so the two cannot drift. That is
// the same reasoning as src/lib/deployConfig.test.ts, which pins the file's schema: the header block
// is load-bearing and has silently failed to ship before (Vercel rejects unknown properties, so a
// "//" comment key once failed the whole build and the headers never applied).

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4173);

const rules = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).headers;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  // og.jpg is the link-preview image; without this it fell through to application/octet-stream, which
  // is not what Vercel serves and not what a crawler wants to see.
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2', '.map': 'application/json; charset=utf-8',
};

/** Vercel's `source` is a path pattern; the three this project uses are plain regexes anchored whole. */
const matches = (source, path) => new RegExp(`^${source}$`).test(path);

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);

  // Vercel Analytics is served by the PLATFORM at /_vercel/insights/*, so a local dist/ has no such
  // file. Stubbed rather than 404'd, and rather than filtered out in the test: a 404 on a <script src>
  // is itself a console error, so the alternative was a smoke suite whose "no console errors" check
  // had to carve out an exception — and an exception list is where a real error eventually hides.
  // Emulating the endpoint keeps that assertion absolute. The stub does nothing, which is exactly what
  // analytics should do in a test run.
  if (path.startsWith('/_vercel/insights/')) {
    if (path.endsWith('.js')) {
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
      res.end('/* analytics stub: the real script is served by Vercel */\n');
    } else {
      res.writeHead(204).end();   // the event beacon
    }
    return;
  }
  // Every rule whose source matches applies, in order — Vercel's semantics, and what makes the
  // catch-all `/(.*)` CSP reach the same responses in this server as in production.
  for (const rule of rules) {
    if (matches(rule.source, path)) for (const h of rule.headers) res.setHeader(h.key, h.value);
  }

  // No directory traversal: normalize, then require the result to still sit under ROOT.
  const rel = normalize(path === '/' ? '/index.html' : path).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, rel);
  const missing = !existsSync(file) || statSync(file).isDirectory();

  // SPA fallback, but ONLY for extensionless paths — i.e. things that could be routes.
  //
  // Falling back for everything is what a naive dev server does, and it made the smoke suite fail for
  // a reason that had nothing to do with the app: Vercel Analytics fetches
  // `/_vercel/insights/script.js`, which the PLATFORM serves and a local dist/ does not have, so the
  // fallback handed the browser index.html and Chromium refused it — "MIME type ('text/html') is not
  // executable" — as a console error, in the test whose entire job is to assert there are none.
  // A real static host 404s a missing .js; so does this. The analytics script simply does not load
  // locally, which is the correct local behaviour and not something to paper over.
  if (missing && extname(rel)) { res.writeHead(404).end('not found'); return; }
  if (missing) file = join(ROOT, 'index.html');
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }

  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  res.writeHead(200);
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => console.log(`serving dist/ with vercel.json headers on http://localhost:${PORT}`));
