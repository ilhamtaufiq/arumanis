import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const BUN_ROOT = path.resolve(__dirname, '..')

export const REPOS = [
  {
    id: 'arumanis',
    label: 'Arumanis (frontend)',
    dir: BUN_ROOT,
    versionFile: 'package.json',
    versionField: 'version',
    tagPrefix: 'v',
    defaultSince: null,
    defaultSinceDate: null,
    branch: 'dev',
  },
  {
    id: 'pengawas',
    label: 'Pengawas (frontend)',
    dir: path.resolve(BUN_ROOT, '..', 'pengawas'),
    versionFile: 'package.json',
    versionField: 'version',
    tagPrefix: 'v',
    defaultSince: null,
    defaultSinceDate: null,
    branch: 'main',
  },
  {
    id: 'apiamis',
    label: 'APIAMIS (backend)',
    dir: path.resolve(BUN_ROOT, '..', 'apiamis'),
    versionFile: 'VERSION',
    versionField: null,
    tagPrefix: 'v',
    defaultSince: null,
    defaultSinceDate: null,
    branch: 'main',
  },
]

const CONVENTIONAL =
  /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<subject>.+)$/i

const TYPE_LABELS = {
  feat: 'Features',
  fix: 'Bug Fixes',
  perf: 'Performance',
  refactor: 'Refactors',
  docs: 'Documentation',
  chore: 'Chores',
  test: 'Tests',
  build: 'Build',
  ci: 'CI',
  security: 'Security',
  copy: 'Copy',
}

const SKIP_FOR_BUMP = new Set(['chore', 'docs', 'test', 'ci', 'build'])

export function runGit(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim()
}

export function repoExists(repo) {
  return existsSync(repo.dir) && existsSync(path.join(repo.dir, '.git'))
}

export function readVersion(repo) {
  const filePath = path.join(repo.dir, repo.versionFile)
  if (!existsSync(filePath)) return '0.0.0'

  if (repo.versionFile === 'package.json') {
    const pkg = JSON.parse(readFileSync(filePath, 'utf8'))
    return pkg.version ?? '0.0.0'
  }

  return readFileSync(filePath, 'utf8').trim() || '0.0.0'
}

export function writeVersion(repo, version) {
  const filePath = path.join(repo.dir, repo.versionFile)

  if (repo.versionFile === 'package.json') {
    const pkg = JSON.parse(readFileSync(filePath, 'utf8'))
    pkg.version = version
    writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
    return
  }

  writeFileSync(filePath, `${version}\n`, 'utf8')
}

export function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(version)
  if (!match) throw new Error(`Invalid semver: ${version}`)
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

export function bumpSemver(version, level) {
  const current = parseSemver(version)
  if (level === 'major') {
    return `${current.major + 1}.0.0`
  }
  if (level === 'minor') {
    return `${current.major}.${current.minor + 1}.0`
  }
  return `${current.major}.${current.minor}.${current.patch + 1}`
}

export function parseCommit(subject, body = '') {
  const match = CONVENTIONAL.exec(subject.trim())
  if (!match?.groups) {
    return {
      type: 'other',
      scope: null,
      breaking: /\bBREAKING\b/i.test(subject) || /\bBREAKING\b/i.test(body),
      subject: subject.trim(),
      raw: subject.trim(),
    }
  }

  return {
    type: match.groups.type.toLowerCase(),
    scope: match.groups.scope ?? null,
    breaking: Boolean(match.groups.breaking) || /\bBREAKING\b/i.test(body),
    subject: match.groups.subject.trim(),
    raw: subject.trim(),
  }
}

export function getLatestTag(repo) {
  try {
    return runGit(repo.dir, ['describe', '--tags', '--abbrev=0'])
  } catch {
    return null
  }
}

export function getCommits(repo, sinceRef, sinceDate = null) {
  const format = '%H|%h|%ad|%s'
  const args = ['log', `--pretty=format:${format}`, '--date=short']
  if (sinceRef) args.push(`${sinceRef}..HEAD`)
  else if (sinceDate) args.push(`--since=${sinceDate}`)
  let output = ''

  try {
    output = runGit(repo.dir, args)
  } catch {
    return []
  }

  if (!output) return []

  return output.split('\n').map((line) => {
    const [hash, shortHash, date, ...rest] = line.split('|')
    const subject = rest.join('|')
    const parsed = parseCommit(subject)
    return { hash, shortHash, date, subject, ...parsed }
  })
}

export function computeBumpLevel(commits) {
  let level = null

  for (const commit of commits) {
    if (commit.breaking) return 'major'
    if (SKIP_FOR_BUMP.has(commit.type)) continue
    if (commit.type === 'feat') level = level === 'patch' ? 'minor' : (level ?? 'minor')
    if (commit.type === 'fix' || commit.type === 'perf' || commit.type === 'security') {
      level ??= 'patch'
    }
  }

  return level ?? 'patch'
}

export function groupCommits(commits) {
  const groups = new Map()

  for (const commit of commits) {
    const key = commit.type in TYPE_LABELS ? commit.type : 'other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(commit)
  }

  const order = [
    'feat',
    'fix',
    'perf',
    'security',
    'refactor',
    'docs',
    'chore',
    'test',
    'build',
    'ci',
    'copy',
    'other',
  ]

  return order
    .filter((key) => groups.has(key))
    .map((key) => ({ key, label: TYPE_LABELS[key] ?? 'Other', commits: groups.get(key) }))
}

export function formatCommitLine(commit) {
  const scope = commit.scope ? `**${commit.scope}**: ` : ''
  return `- ${scope}${commit.subject} (\`${commit.shortHash}\`, ${commit.date})`
}

export function readPlatformManifest() {
  const manifestPath = path.join(BUN_ROOT, 'platform.version.json')
  if (!existsSync(manifestPath)) return null
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

export function writePlatformManifest(manifest) {
  const manifestPath = path.join(BUN_ROOT, 'platform.version.json')
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}