#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  BUN_ROOT,
  REPOS,
  bumpSemver,
  computeBumpLevel,
  formatCommitLine,
  getCommits,
  getLatestTag,
  groupCommits,
  readPlatformManifest,
  readVersion,
  repoExists,
  runGit,
  writePlatformManifest,
  writeVersion,
} from './platform-lib.mjs'

function parseArgs(argv) {
  const opts = {
    command: 'analyze',
    dryRun: false,
    level: null,
    since: {},
    writeChangelog: true,
  }

  const args = [...argv]
  if (args[0] && !args[0].startsWith('-')) {
    opts.command = args.shift()
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--no-changelog') opts.writeChangelog = false
    else if (arg === '--major' || arg === '--minor' || arg === '--patch') {
      opts.level = arg.slice(2)
    } else if (arg.startsWith('--since=')) {
      const [, repoId, ref] = arg.match(/^--since=([^:]+):(.+)$/) ?? []
      if (repoId && ref) opts.since[repoId] = ref
    }
  }

  return opts
}

function resolveSince(repo, sinceOverrides) {
  if (sinceOverrides[repo.id]) return sinceOverrides[repo.id]
  if (repo.defaultSince) return repo.defaultSince
  return getLatestTag(repo)
}

function resolveSinceDate(repo, sinceRef) {
  if (sinceRef) return null
  return repo.defaultSinceDate ?? null
}

function collectAllCommits(sinceOverrides) {
  const perRepo = []

  for (const repo of REPOS) {
    if (!repoExists(repo)) continue
    const sinceRef = resolveSince(repo, sinceOverrides)
    const sinceDate = resolveSinceDate(repo, sinceRef)
    const commits = getCommits(repo, sinceRef, sinceDate)
    perRepo.push({ repo, sinceRef, sinceDate, commits })
  }

  return perRepo
}

function analyze(opts) {
  const perRepo = collectAllCommits(opts.since)
  const allCommits = perRepo.flatMap((entry) => entry.commits)
  const current = readPlatformManifest()?.version ?? readVersion(REPOS[0])
  const suggested = opts.level ?? computeBumpLevel(allCommits)
  const next = bumpSemver(current, suggested)

  console.log('=== Analisis Versi Platform Arumanis ===\n')
  console.log(`Versi saat ini : ${current}`)
  console.log(`Rekomendasi bump: ${suggested} → ${next}`)
  console.log(`Total commit    : ${allCommits.length}\n`)

  for (const entry of perRepo) {
    const grouped = groupCommits(entry.commits)
    const feat = entry.commits.filter((c) => c.type === 'feat').length
    const fix = entry.commits.filter((c) => c.type === 'fix').length
    const breaking = entry.commits.filter((c) => c.breaking).length

    console.log(`## ${entry.repo.label}`)
    console.log(`Path   : ${entry.repo.dir}`)
    console.log(`Versi  : v${readVersion(entry.repo)}`)
    console.log(
      `Since  : ${entry.sinceRef ?? (entry.sinceDate ? entry.sinceDate : '(semua commit)')}`,
    )
    console.log(`Commit : ${entry.commits.length} (feat ${feat}, fix ${fix}, breaking ${breaking})`)

    for (const group of grouped.slice(0, 3)) {
      console.log(`  - ${group.label}: ${group.commits.length}`)
    }
    console.log('')
  }

  return { current, next, suggested, perRepo, allCommits }
}

function renderChangelogSection(version, perRepo) {
  const today = new Date().toISOString().slice(0, 10)
  const lines = [
    `## [${version}] - ${today}`,
    '',
    '### Ringkasan Platform',
    '',
  ]

  for (const entry of perRepo) {
    lines.push(
      `- **${entry.repo.label}**: ${entry.commits.length} commit${
        entry.sinceRef
          ? ` sejak \`${entry.sinceRef}\``
          : entry.sinceDate
            ? ` sejak ${entry.sinceDate}`
            : ''
      }`,
    )
  }

  lines.push('')

  for (const entry of perRepo) {
    if (!entry.commits.length) continue
    lines.push(`### ${entry.repo.label}`, '')
    for (const group of groupCommits(entry.commits)) {
      lines.push(`#### ${group.label}`, '')
      for (const commit of group.commits) {
        lines.push(formatCommitLine(commit))
      }
      lines.push('')
    }
  }

  return `${lines.join('\n')}\n`
}

function prependChangelog(version, perRepo) {
  const changelogPath = path.join(BUN_ROOT, 'CHANGELOG.md')
  const section = renderChangelogSection(version, perRepo)
  let existing = ''

  try {
    existing = readFileSync(changelogPath, 'utf8')
  } catch {
    existing = '# Changelog Arumanis Platform\n\n'
  }

  const header = '# Changelog Arumanis Platform\n\n'
  const body = existing.startsWith(header)
    ? existing.slice(header.length).trimStart()
    : existing

  writeFileSync(changelogPath, `${header}${section}${body}`, 'utf8')
}

function release(opts) {
  const analysis = analyze(opts)
  const { current, next, perRepo } = analysis

  if (opts.dryRun) {
    console.log('DRY RUN — tidak ada file atau tag yang diubah.')
    return
  }

  const manifest = {
    version: next,
    releasedAt: new Date().toISOString(),
    previousVersion: current,
    repos: {},
  }

  for (const repo of REPOS) {
    if (!repoExists(repo)) continue
    writeVersion(repo, next)
    manifest.repos[repo.id] = {
      path: path.relative(BUN_ROOT, repo.dir).replace(/\\/g, '/') || '.',
      version: next,
      tag: `${repo.tagPrefix}${next}`,
      branch: repo.branch,
    }
    console.log(`✓ ${repo.label} → v${next}`)
  }

  writePlatformManifest(manifest)

  if (opts.writeChangelog) {
    prependChangelog(next, perRepo)
    console.log(`✓ CHANGELOG.md diperbarui`)
  }

  const tag = `v${next}`
  for (const repo of REPOS) {
    if (!repoExists(repo)) continue
    try {
      runGit(repo.dir, ['tag', '-a', tag, '-m', `Release platform ${next}`])
      console.log(`✓ Tag ${tag} dibuat di ${repo.id}`)
    } catch (error) {
      console.warn(`! Tag ${tag} gagal di ${repo.id}: ${error.message}`)
    }
  }

  console.log('\nLangkah manual:')
  for (const repo of REPOS) {
    if (!repoExists(repo)) continue
    console.log(`  cd ${repo.dir}`)
    console.log(`  git add -A && git commit -m "chore: release v${next}"`)
    console.log(`  git push origin ${repo.branch} --follow-tags`)
    console.log('')
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2))

  if (opts.command === 'release') {
    release(opts)
    return
  }

  analyze(opts)
}

main()