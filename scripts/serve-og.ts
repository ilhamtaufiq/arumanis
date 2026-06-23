import { join, normalize } from 'node:path';
import { getHealth, buildLivenessResponse } from './health.ts';

const distDir = join(import.meta.dir, '..', 'dist');
const port = Number(Bun.env.PORT || 80);
const host = Bun.env.HOST || '0.0.0.0';
const apiBaseUrl = (Bun.env.VITE_API_BASE_URL || 'https://apiamis.cianjur.space/api').replace(/\/$/, '');
const siteUrl = (Bun.env.PUBLIC_SITE_URL || 'https://arumanis.cianjur.space').replace(/\/$/, '');
const defaultTitle = 'Arumanis';
const defaultDescription = 'Bidang Air Minum dan Sanitasi';
const defaultImage = `${siteUrl}/arumanis.svg`;
const puspenTitle = 'Puspen Arumanis';
const puspenDescription = 'Ruang kerja publikasi, media sharing, PDF, dan progress fisik Puspen Arumanis.';
const puspenImage = `${siteUrl}/arumanis.svg`;

type BlogPost = {
  title?: string | null;
  content?: string | null;
  category?: string | null;
  cover_image?: string | null;
};

type BlogResponse = {
  data?: BlogPost;
};

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
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(value: string | null | undefined) {
  if (!value || value.startsWith('data:')) return defaultImage;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${siteUrl}${value}`;

  try {
    return new URL(value, `${apiBaseUrl}/`).toString();
  } catch {
    return defaultImage;
  }
}

function buildMetaTags(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);

  const type = escapeHtml(meta.type || 'article');

  return `
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${url}" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${image}" />`;
}

async function buildPuspenHtml(request: Request) {
  const indexHtml = await getIndexHtml();
  const url = new URL(request.url);
  const canonicalUrl = `${siteUrl}${url.pathname}`;

  return replaceMetaTags(indexHtml, buildMetaTags({
    title: puspenTitle,
    description: puspenDescription,
    image: puspenImage,
    url: canonicalUrl,
    type: 'website',
  }));
}

function replaceMetaTags(html: string, metaTags: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+(?:name|property)=["'](?:title|description|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, '\n')
    .replace('</head>', `${metaTags}\n</head>`);
}

async function getIndexHtml() {
  return await Bun.file(join(distDir, 'index.html')).text();
}

async function buildPublikasiHtml(slug: string, request: Request) {
  const indexHtml = await getIndexHtml();
  const url = new URL(request.url);
  const canonicalUrl = `${siteUrl}${url.pathname}`;

  try {
    const response = await fetch(`${apiBaseUrl}/blog/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Blog API returned ${response.status}`);
    }

    const payload = await response.json() as BlogResponse;
    const post = payload.data;
    const title = post?.title?.trim() || defaultTitle;
    const description = stripHtml(post?.content || '').slice(0, 180) || defaultDescription;
    const image = absoluteUrl(post?.cover_image);

    return replaceMetaTags(indexHtml, buildMetaTags({
      title,
      description,
      image,
      url: canonicalUrl,
    }));
  } catch (error) {
    console.error('Failed to inject publikasi OG meta:', error);
    return replaceMetaTags(indexHtml, buildMetaTags({
      title: defaultTitle,
      description: defaultDescription,
      image: defaultImage,
      url: canonicalUrl,
    }));
  }
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
    // SPA shell must never be cached long-term so new builds are picked up automatically
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else if (relativePath.endsWith('version.json')) {
    // Version manifest must always be fresh for the update checker
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(file, { headers });
}

Bun.serve({
  port,
  hostname: host,
  async fetch(request) {
    const url = new URL(request.url);

    // Health endpoints — no auth, before static serving
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

    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) return staticResponse;

    const publikasiMatch = url.pathname.match(/^\/publikasi\/([^/]+)\/?$/);
    if (publikasiMatch) {
      const html = await buildPublikasiHtml(publikasiMatch[1], request);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          // Dynamic meta pages should also avoid long caching of the shell
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    if (url.pathname.startsWith('/puspen')) {
      const html = await buildPuspenHtml(request);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          // Dynamic meta pages should also avoid long caching of the shell
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Main SPA entry — must never be cached so users always get the latest build
    return new Response(await getIndexHtml(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  },
});

console.log(`Arumanis server listening on ${host}:${port}`);
