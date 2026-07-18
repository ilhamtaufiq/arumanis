#!/usr/bin/env node
/**
 * Open a pull request into dev using GitHub PR templates + gh CLI.
 *
 * Usage:
 *   bun run git:pr
 *   bun run git:pr -- --template fix
 *   bun run git:pr -- --template feature --draft
 *   bun run git:pr -- --base main --title "fix: hotfix cookie"
 *
 * Requires: gh auth login
 */
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function sh(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()
}

function parseArgs(argv) {
  const out = {
    template: null,
    base: 'dev',
    draft: false,
    title: null,
    fill: true,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if ((a === '-t' || a === '--template') && argv[i + 1]) out.template = argv[++i]
    else if ((a === '-b' || a === '--base') && argv[i + 1]) out.base = argv[++i]
    else if (a === '--draft') out.draft = true
    else if ((a === '--title') && argv[i + 1]) out.title = argv[++i]
    else if (a === '--web') out.fill = false
  }
  return out
}

function templatePath(name) {
  if (!name) return resolve(root, '.github/PULL_REQUEST_TEMPLATE.md')
  const map = {
    fix: 'fix.md',
    feature: 'feature.md',
    feat: 'feature.md',
    chore: 'chore.md',
    default: null,
  }
  const file = map[name]
  if (file === undefined) {
    console.error(`Unknown template "${name}". Use: default | fix | feature | chore`)
    process.exit(1)
  }
  if (!file) return resolve(root, '.github/PULL_REQUEST_TEMPLATE.md')
  return resolve(root, '.github/PULL_REQUEST_TEMPLATE', file)
}

function lastCommitSubject() {
  try {
    return sh('git log -1 --pretty=%s')
  } catch {
    return null
  }
}

const flags = parseArgs(process.argv.slice(2))

// gh available?
try {
  sh('gh --version')
} catch {
  console.error('GitHub CLI (gh) tidak ditemukan. Install: https://cli.github.com/ lalu: gh auth login')
  process.exit(1)
}

const branch = sh('git rev-parse --abbrev-ref HEAD')
if (branch === flags.base) {
  console.error(`Sudah di branch target "${flags.base}". Checkout feature branch dulu.`)
  process.exit(1)
}

// Ensure remote has branch
const push = spawnSync('git', ['push', '-u', 'origin', 'HEAD'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if ((push.status ?? 1) !== 0) process.exit(push.status ?? 1)

const tplFile = templatePath(flags.template)
if (!existsSync(tplFile)) {
  console.error(`Template missing: ${tplFile}`)
  process.exit(1)
}

const body = readFileSync(tplFile, 'utf8')
const bodyFile = join(tmpdir(), `arumanis-pr-body-${Date.now()}.md`)
writeFileSync(bodyFile, body, 'utf8')

const title = flags.title || lastCommitSubject() || `Update from ${branch}`
const args = [
  'pr',
  'create',
  '--base',
  flags.base,
  '--head',
  branch,
  '--title',
  title,
  '--body-file',
  bodyFile,
]
if (flags.draft) args.push('--draft')

console.log(`→ gh ${args.join(' ')}`)
console.log(`   template: ${tplFile}`)
const r = spawnSync('gh', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(r.status ?? 1)
