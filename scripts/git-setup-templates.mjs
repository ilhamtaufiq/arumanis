#!/usr/bin/env node
/**
 * Wire local git to use repo commit template + show PR template paths.
 * Run once per clone: bun run git:setup
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const commitTpl = resolve(root, '.github/COMMIT_TEMPLATE.md')

function run(cmd) {
  console.log(`> ${cmd}`)
  execSync(cmd, { cwd: root, stdio: 'inherit' })
}

if (!existsSync(commitTpl)) {
  console.error('Missing .github/COMMIT_TEMPLATE.md')
  process.exit(1)
}

// Relative path works better when template is committed
run('git config --local commit.template .github/COMMIT_TEMPLATE.md')
run('git config --local core.commentChar "#"')

// Helpful defaults for this monorepo
try {
  run('git config --local pull.rebase false')
} catch {
  /* ignore */
}

console.log(`
[git-setup] Local commit template aktif.

Commit interaktif (template + conventional):
  bun run git:commit

Push branch saat ini:
  bun run git:push

Buka PR ke dev (pakai template GitHub):
  bun run git:pr
  bun run git:pr -- --template fix
  bun run git:pr -- --template feature --draft

PR templates ada di:
  .github/PULL_REQUEST_TEMPLATE.md          (default)
  .github/PULL_REQUEST_TEMPLATE/fix.md
  .github/PULL_REQUEST_TEMPLATE/feature.md
  .github/PULL_REQUEST_TEMPLATE/chore.md
`)
