#!/usr/bin/env node
/**
 * Push current branch; set upstream on first push.
 * Usage: bun run git:push
 *        bun run git:push -- --force-with-lease
 */
import { execSync, spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const extra = process.argv.slice(2)

function sh(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()
}

const branch = sh('git rev-parse --abbrev-ref HEAD')
if (branch === 'HEAD') {
  console.error('Detached HEAD — checkout branch dulu.')
  process.exit(1)
}

if (['main', 'master'].includes(branch) && !extra.includes('--force-with-lease')) {
  console.warn(`[warn] You are on "${branch}". Prefer PR from feature branch → dev.`)
}

let hasUpstream = true
try {
  sh(`git rev-parse --abbrev-ref ${branch}@{upstream}`)
} catch {
  hasUpstream = false
}

const args = hasUpstream
  ? ['push', ...extra]
  : ['push', '-u', 'origin', branch, ...extra]

console.log(`→ git ${args.join(' ')}  (branch: ${branch})`)
const r = spawnSync('git', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(r.status ?? 1)
