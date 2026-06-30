import { join, normalize } from 'node:path';
import { getHealth, buildLivenessResponse } from './health.ts';
import {
  buildPublikasiHtml,
  buildPublikasiListHtml,
  buildPuspenHtml,
} from '../server/seo-meta.ts';
import { buildSitemapXml } from '../server/sitemap.ts';

const distDir = join(import.meta.dir, '..', 'dist');
const port = Number(Bun.env.PORT || 80);
const host = Bun.env.HOST || '0.0.0.0';
const apiBaseUrl = (Bun.env.VITE_API_BASE_URL || 'https://apiamis.cianjur.space/api').replace(/\/$/, '');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

async function getIndexHtml() {
  return await Bun.file(join(distDir, 'index.html')).text();
}

async function serveStatic(pathname: string) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const relativePath = normalizedPath === '/' ? '/index.html' : normalizedPath;
  const filePath = join(distDir, relativePath);

  if (!filePath.startsWith(distDir)) {
    return new Response('Forbidden', { status: 403 });
  }

  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return null;
  }

  const extension = relativePath.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '.html';
  const headers = new Headers({
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
  });

  if (extension === '.html' || relativePath.endsWith('/index.html')) {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else if (relativePath.endsWith('version.json')) {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(file, { headers });
}

const spaHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

Bun.serve({
  port,
  hostname: host,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/health/live') {
      return new Response(JSON.stringify(buildLivenessResponse()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/health/ready' || url.pathname === '/health') {
      const verbose = url.searchParams.get('verbose') === 'true';
      const { response, statusCode } = await getHealth(apiBaseUrl, verbose);
      return new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/sitemap.xml') {
      const xml = await buildSitemapXml();
      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) return staticResponse;

    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    const indexHtml = await getIndexHtml();

    if (normalizedPath === '/publikasi') {
      return new Response(buildPublikasiListHtml(indexHtml), { headers: spaHeaders });
    }

    const publikasiMatch = normalizedPath.match(/^\/publikasi\/([^/]+)$/);
    if (publikasiMatch) {
      const html = await buildPublikasiHtml(publikasiMatch[1], normalizedPath, indexHtml);
      return new Response(html, { headers: spaHeaders });
    }

    if (normalizedPath.startsWith('/puspen')) {
      const html = buildPuspenHtml(normalizedPath, indexHtml);
      return new Response(html, { headers: spaHeaders });
    }

    return new Response(indexHtml, { headers: spaHeaders });
  },
});

console.log(`Arumanis server listening on ${host}:${port}`);