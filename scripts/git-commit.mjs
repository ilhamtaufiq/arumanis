#!/usr/bin/env node
/**
 * Interactive conventional commit helper.
 * Usage:
 *   bun run git:commit
 *   bun run git:commit -- -t fix -s docker -m "naikkan heap Node"
 *   bun run git:commit -- --all -t chore -m "sync lockfile"
 */
import { execSync, spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
]

function parseArgs(argv) {
  const out = { type: null, scope: null, message: null, all: false, body: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--all' || a === '-a') out.all = true
    else if ((a === '-t' || a === '--type') && argv[i + 1]) out.type = argv[++i]
    else if ((a === '-s' || a === '--scope') && argv[i + 1]) out.scope = argv[++i]
    else if ((a === '-m' || a === '--message') && argv[i + 1]) out.message = argv[++i]
    else if ((a === '-b' || a === '--body') && argv[i + 1]) out.body = argv[++i]
  }
  return out
}

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: 'utf8', ...opts }).trim()
}

function ask(rl, q) {
  return new Promise((resolveAsk) => rl.question(q, resolveAsk))
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))
  let status
  try {
    status = sh('git status --porcelain')
  } catch {
    console.error('Not a git repo?')
    process.exit(1)
  }

  if (!status && !flags.all) {
    console.log('Working tree clean. Stage changes first (git add) or use --all.')
    process.exit(0)
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })

  let type = flags.type
  if (!type) {
    console.log('Types:', TYPES.join(' | '))
    type = (await ask(rl, 'type [feat]: ')).trim() || 'feat'
  }
  if (!TYPES.includes(type)) {
    console.error(`Unknown type "${type}". Use one of: ${TYPES.join(', ')}`)
    process.exit(1)
  }

  let scope = flags.scope
  if (scope === null || scope === undefined) {
    scope = (await ask(rl, 'scope (opsional, mis. docker/pekerjaan): ')).trim()
  }

  let message = flags.message
  if (!message) {
    message = (await ask(rl, 'pesan singkat: ')).trim()
  }
  if (!message) {
    console.error('Pesan commit wajib diisi.')
    process.exit(1)
  }

  let body = flags.body
  if (body === null || body === undefined) {
    const b = (await ask(rl, 'body opsional (Enter = skip): ')).trim()
    body = b || null
  }

  rl.close()

  const subject = scope ? `${type}(${scope}): ${message}` : `${type}: ${message}`
  if (subject.length > 100) {
    console.warn(`[warn] subject ${subject.length} chars — idealnya ≤72`)
  }

  if (flags.all) {
    spawnSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })
  }

  const staged = sh('git diff --cached --name-only')
  if (!staged) {
    console.error('Tidak ada file staged. git add dulu, atau: bun run git:commit -- --all …')
    process.exit(1)
  }

  const args = ['commit', '-m', subject]
  if (body) args.push('-m', body)

  console.log(`\n→ git commit ${args.slice(1).map((a) => JSON.stringify(a)).join(' ')}\n`)
  const r = spawnSync('git', args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  process.exit(r.status ?? 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
