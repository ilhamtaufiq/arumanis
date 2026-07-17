/**
 * Build Fumadocs (docs-site) then copy into dist/docs.
 * Cross-platform (Windows/Linux) without relying on shell `cd`.
 */
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsSite = resolve(root, 'docs-site')

function run(cmd, args, cwd) {
  console.log(`[build-docs] ${cmd} ${args.join(' ')} (cwd=${cwd})`)
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

run('bun', ['run', 'build'], docsSite)
run('node', [resolve(root, 'scripts/copy-docs-dist.mjs')], root)
