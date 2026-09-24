#!/usr/bin/env node
/**
 * Open a pull request into dev using GitHub PR templates + gh CLI.
 *
 * Template placeholders (diisi otomatis dari git, tanpa perlu edit manual):
 *   {{title}}    judul PR (atau subject commit terakhir)
 *   {{branch}}   head branch
 *   {{base}}     base branch
 *   {{commits}}  daftar commit base...head sebagai bullet list
 *   {{files}}    daftar file berubah base...head sebagai bullet list
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

function rangeLines(cmd) {
  try {
    const out = sh(cmd)
    return out ? out.split('\n').map((l) => l.trim()).filter(Boolean) : []
  } catch {
    return []
  }
}

// Bullet list commit base...head, mis. "- feat(auth): login v2 (a1b2c3d)".
// Aman untuk cmd.exe: format string dikutip ganda, prefix "- " ditambah di JS.
function commitList(base, head) {
  const lines = rangeLines(`git log ${base}...${head} --pretty=format:"%h %s"`)
  if (!lines.length) return '-'
  return lines
    .map((line) => {
      const space = line.indexOf(' ')
      if (space === -1) return `- ${line}`
      return `- ${line.slice(space + 1)} (${line.slice(0, space)})`
    })
    .join('\n')
}

function fileList(base, head) {
  const lines = rangeLines(`git diff --name-only ${base}...${head}`)
  if (!lines.length) return '-'
  return lines.map((f) => `- \`${f}\``).join('\n')
}

// Substitusi placeholder via split/join (aman terhadap karakter `$` di pesan commit).
function fillTemplate(tpl, ctx) {
  let out = tpl
  for (const [key, value] of Object.entries(ctx)) {
    out = out.split(`{{${key}}}`).join(value)
  }
  return out
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

const title = flags.title || lastCommitSubject() || `Update from ${branch}`
const body = fillTemplate(readFileSync(tplFile, 'utf8'), {
  title,
  branch,
  base: flags.base,
  commits: commitList(flags.base, branch),
  files: fileList(flags.base, branch),
})
const bodyFile = join(tmpdir(), `arumanis-pr-body-${Date.now()}.md`)
writeFileSync(bodyFile, body, 'utf8')

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
