/**
 * Build Fumadocs (docs-site) then copy into dist/docs.
 * Cross-platform (Windows/Linux) without relying on shell `cd`.
 *
 * Prefer Node for `react-router build`: Bun on Alpine often returns 500 from
 * entry.server during prerender (react-dom/server.edge + serializePageTree).
 * Needs Node ≥ 22.22 (see Dockerfile node:22 stage).
 * If full prerender OOMs, retry once with DOCS_PRERENDER=minimal.
 */
import { spawnSync, execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsSite = resolve(root, 'docs-site')
const rrBin = resolve(docsSite, 'node_modules/@react-router/dev/bin.cjs')

function run(cmd, args, cwd, env = process.env) {
  console.log(`[build-docs] ${cmd} ${args.join(' ')} (cwd=${cwd})`)
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  })
  return r.status ?? 1
}

function runOrExit(cmd, args, cwd, env = process.env) {
  const status = run(cmd, args, cwd, env)
  if (status !== 0) process.exit(status)
}

function hasCommand(cmd) {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

// Ensure MDX collections exist (postinstall may have run before content was copied in Docker).
if (existsSync(resolve(docsSite, 'node_modules/fumadocs-mdx'))) {
  if (hasCommand('bun')) {
    runOrExit('bun', ['x', 'fumadocs-mdx'], docsSite)
  } else if (hasCommand('npx')) {
    runOrExit('npx', ['fumadocs-mdx'], docsSite)
  }
}

const forceBun = process.env.DOCS_BUILD_WITH === 'bun'
const useNode = !forceBun && hasCommand('node') && existsSync(rrBin)

function buildWith(envExtra = {}) {
  const env = { ...process.env, ...envExtra }
  if (useNode) {
    console.log('[build-docs] Using Node for react-router build')
    return run('node', [rrBin, 'build'], docsSite, env)
  }
  console.log('[build-docs] Using bun run build')
  return run('bun', ['run', 'build'], docsSite, env)
}

let status = buildWith()
// Never use pure SPA without prerender: route `loader`s become invalid.
// "minimal" still prerenders / and /docs so loaders stay legal.
if (status !== 0 && process.env.DOCS_PRERENDER !== 'minimal') {
  console.warn(
    '[build-docs] Full prerender failed — retrying DOCS_PRERENDER=minimal (/, /docs only).',
  )
  status = buildWith({ DOCS_PRERENDER: 'minimal' })
}

if (status !== 0) {
  process.exit(status)
}

runOrExit('node', [resolve(root, 'scripts/copy-docs-dist.mjs')], root)
