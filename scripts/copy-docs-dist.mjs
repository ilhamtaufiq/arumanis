/**
 * Deploy Fumadocs client build under Arumanis `dist/docs`.
 *
 * Prerender layout (no vite base):
 *   build/client/docs/**     → HTML pages for /docs/*
 *   build/client/assets/**   → JS/CSS (referenced as /assets/*)
 *   build/client/api/**      → static search
 *
 * After copy we rewrite `/assets/` → `/docs/assets/` and `/api/` → `/docs/api/`
 * so the main SPA's /assets is not shadowed and everything lives under /docs.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from 'node:fs'
import { join, resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const client = resolve(root, 'docs-site/build/client')
const dest = resolve(root, 'dist/docs')

if (!existsSync(client)) {
  console.error('[copy-docs-dist] Missing docs-site/build/client — run docs-site build first')
  process.exit(1)
}

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })

function copyDir(src, to) {
  if (!existsSync(src)) return
  mkdirSync(to, { recursive: true })
  cpSync(src, to, { recursive: true })
}

// Pages: client/docs/* → dist/docs/*
const pagesDir = join(client, 'docs')
if (existsSync(pagesDir)) {
  for (const name of readdirSync(pagesDir)) {
    cpSync(join(pagesDir, name), join(dest, name), { recursive: true })
  }
} else {
  console.warn('[copy-docs-dist] client/docs missing')
}

// Assets / API / LLM / SPA shell
for (const name of [
  'assets',
  'api',
  'llms.mdx',
  'llms.txt',
  'llms-full.txt',
  'llms.txt.data',
  'llms-full.txt.data',
  '__spa-fallback.html',
  'favicon.ico',
]) {
  const from = join(client, name)
  if (!existsSync(from)) continue
  const to = join(dest, name)
  if (statSync(from).isDirectory()) copyDir(from, to)
  else cpSync(from, to)
}

// Ensure public screenshots (may already be under client/assets via Vite public/)
const publicScreens = resolve(root, 'docs-site/public/assets/screenshots')
if (existsSync(publicScreens)) {
  copyDir(publicScreens, join(dest, 'assets/screenshots'))
}

// Brand assets (logo / favicon) — same as main app public/arumanis.svg
for (const name of ['arumanis.svg', 'favicon.svg', 'favicon.ico']) {
  const fromPublic = resolve(root, 'docs-site/public', name)
  const fromClient = join(client, name)
  const src = existsSync(fromClient) ? fromClient : fromPublic
  if (existsSync(src)) {
    cpSync(src, join(dest, name))
  }
}
// Also keep logo under assets for rewrite-safe absolute /docs/arumanis.svg
const logoSrc = resolve(root, 'docs-site/public/arumanis.svg')
if (existsSync(logoSrc)) {
  cpSync(logoSrc, join(dest, 'arumanis.svg'))
}

// Landing at /docs/ from SPA root index if page index missing
const destIndex = join(dest, 'index.html')
const clientDocsIndex = join(client, 'docs', 'index.html')
const clientRootIndex = join(client, 'index.html')
if (!existsSync(destIndex)) {
  if (existsSync(clientDocsIndex)) cpSync(clientDocsIndex, destIndex)
  else if (existsSync(clientRootIndex)) cpSync(clientRootIndex, destIndex)
}

/** Rewrite absolute asset/api paths so they stay under /docs. */
function rewriteFile(filePath) {
  const ext = extname(filePath).toLowerCase()
  if (!['.html', '.js', '.css', '.json', '.txt', '.data', '.map'].includes(ext)) return

  let text = readFileSync(filePath, 'utf8')
  const before = text
  // Order matters: avoid double-prefixing
  text = text.replaceAll('/docs/assets/', '/__DOCS_ASSETS__/')
  text = text.replaceAll('/docs/api/', '/__DOCS_API__/')
  text = text.replaceAll('"/assets/', '"/docs/assets/')
  text = text.replaceAll("'/assets/", "'/docs/assets/")
  text = text.replaceAll('(/assets/', '(/docs/assets/')
  text = text.replaceAll('"/api/', '"/docs/api/')
  text = text.replaceAll("'/api/", "'/docs/api/")
  text = text.replaceAll('(/api/', '(/docs/api/')
  text = text.replaceAll('/__DOCS_ASSETS__/', '/docs/assets/')
  text = text.replaceAll('/__DOCS_API__/', '/docs/api/')
  // Public screenshots already use /docs/assets — leave as-is

  if (text !== before) writeFileSync(filePath, text)
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else rewriteFile(p)
  }
}

walk(dest)

writeFileSync(
  join(dest, '.fumadocs-build'),
  JSON.stringify({ builtAt: new Date().toISOString(), engine: 'fumadocs' }, null, 2),
)

console.log(`[copy-docs-dist] Deployed docs → ${dest}`)
