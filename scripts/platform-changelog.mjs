#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  BUN_ROOT,
  REPOS,
  formatCommitLine,
  getCommits,
  getLatestTag,
  groupCommits,
  readPlatformManifest,
  readVersion,
  repoExists,
} from './platform-lib.mjs'

function parseArgs(argv) {
  const since = {}
  let outFile = path.join(BUN_ROOT, 'CHANGELOG.md')
  let version = null

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--out') {
      outFile = path.resolve(argv[i + 1])
      i += 1
      continue
    }
    if (arg === '--version') {
      version = argv[i + 1]
      i += 1
      continue
    }
    if (arg.startsWith('--version=')) {
      version = arg.slice('--version='.length)
      continue
    }
    if (arg.startsWith('--since=')) {
      const [, repoId, ref] = arg.match(/^--since=([^:]+):(.+)$/) ?? []
      if (repoId && ref) since[repoId] = ref
    }
  }

  return { since, outFile, version }
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

function renderRepoSection(repo, commits) {
  if (!commits.length) {
    return `### ${repo.label}\n\n_Tidak ada commit baru._\n`
  }

  const grouped = groupCommits(commits)
  const lines = [`### ${repo.label}`, '', `_${commits.length} commit sejak ref terakhir._`, '']

  for (const group of grouped) {
    lines.push(`#### ${group.label}`, '')
    for (const commit of group.commits) {
      lines.push(formatCommitLine(commit))
    }
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  const { since, outFile, version } = parseArgs(process.argv.slice(2))
  const manifest = readPlatformManifest()
  const platformVersion = version ?? manifest?.version ?? readVersion(REPOS[0])
  const today = new Date().toISOString().slice(0, 10)

  const sections = []
  const summary = []

  for (const repo of REPOS) {
    if (!repoExists(repo)) {
      summary.push(`- ${repo.label}: repo tidak ditemukan (${repo.dir})`)
      continue
    }

    const sinceRef = resolveSince(repo, since)
    const sinceDate = resolveSinceDate(repo, sinceRef)
    const commits = getCommits(repo, sinceRef, sinceDate)
    const sinceLabel = sinceRef
      ? `sejak \`${sinceRef}\``
      : sinceDate
        ? `sejak ${sinceDate}`
        : 'semua commit'
    summary.push(
      `- ${repo.label}: ${commits.length} commit ${sinceLabel} (v${readVersion(repo)})`,
    )
    sections.push(renderRepoSection(repo, commits))
  }

  const header = [
    '# Changelog Arumanis Platform',
    '',
    `Platform version **${platformVersion}** — ${today}`,
    '',
    'Repositori:',
    ...summary,
    '',
    '---',
    '',
  ].join('\n')

  const body = sections.join('\n')
  const content = `${header}${body}\n`

  writeFileSync(outFile, content, 'utf8')
  console.log(`Changelog ditulis ke ${outFile}`)
  console.log(summary.join('\n'))
}

main()