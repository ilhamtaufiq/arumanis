import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export type MetaTokenSource = 'file' | 'env' | 'none'

export interface MetaStoredCredentials {
  version: 1
  accessToken: string
  /** Optional override for IG user id */
  igUserId?: string | null
  pageId?: string | null
  pageName?: string | null
  tokenType?: 'user' | 'page' | 'unknown'
  /** ISO timestamp when long-lived user token expires (approx) */
  expiresAt?: string | null
  updatedAt: string
  /** Never expose full token to client */
  note?: string
}

function readEnv(name: string): string {
  try {
    if (typeof Bun !== 'undefined' && Bun.env?.[name] != null) {
      return String(Bun.env[name]).trim()
    }
  } catch {
    // vitest / node
  }
  return String(process.env[name] || '').trim()
}

function dataDir(): string {
  const configured = readEnv('INSTAGRAM_DATA_DIR')
  if (configured) return resolve(configured)
  return resolve(process.cwd(), 'data', 'instagram')
}

function credentialsPath(): string {
  return resolve(dataDir(), 'credentials.json')
}

let cache: MetaStoredCredentials | null = null
let loaded = false
let writeChain: Promise<void> = Promise.resolve()

export async function loadMetaCredentials(): Promise<MetaStoredCredentials | null> {
  if (loaded) return cache
  try {
    const raw = await readFile(credentialsPath(), 'utf8')
    const parsed = JSON.parse(raw) as MetaStoredCredentials
    if (parsed?.accessToken && typeof parsed.accessToken === 'string') {
      cache = {
        version: 1,
        accessToken: parsed.accessToken.trim(),
        igUserId: parsed.igUserId ?? null,
        pageId: parsed.pageId ?? null,
        pageName: parsed.pageName ?? null,
        tokenType: parsed.tokenType ?? 'unknown',
        expiresAt: parsed.expiresAt ?? null,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        note: parsed.note,
      }
    } else {
      cache = null
    }
  } catch {
    cache = null
  }
  loaded = true
  return cache
}

export function getCachedMetaCredentials(): MetaStoredCredentials | null {
  return cache
}

export async function saveMetaCredentials(
  input: Omit<MetaStoredCredentials, 'version' | 'updatedAt'> & {
    updatedAt?: string
  },
): Promise<MetaStoredCredentials> {
  const next: MetaStoredCredentials = {
    version: 1,
    accessToken: input.accessToken.trim(),
    igUserId: input.igUserId ?? null,
    pageId: input.pageId ?? null,
    pageName: input.pageName ?? null,
    tokenType: input.tokenType ?? 'unknown',
    expiresAt: input.expiresAt ?? null,
    updatedAt: input.updatedAt || new Date().toISOString(),
    note: input.note,
  }

  const run = writeChain.then(async () => {
    await mkdir(dataDir(), { recursive: true })
    const path = credentialsPath()
    const tmp = `${path}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify(next, null, 2), 'utf8')
    await rename(tmp, path)
    cache = next
    loaded = true
  })
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  await run
  return next
}

export async function clearMetaCredentials(): Promise<void> {
  const run = writeChain.then(async () => {
    try {
      await writeFile(credentialsPath(), JSON.stringify({ version: 1, cleared: true }, null, 2), 'utf8')
    } catch {
      // ignore
    }
    cache = null
    loaded = true
  })
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  await run
}

export function maskToken(token: string): string {
  const t = token.trim()
  if (t.length <= 12) return '••••'
  return `${t.slice(0, 6)}…${t.slice(-4)}`
}

export function tokenPublicStatus(creds: MetaStoredCredentials | null, envTokenSet: boolean) {
  const fileSet = Boolean(creds?.accessToken)
  const source: MetaTokenSource = fileSet ? 'file' : envTokenSet ? 'env' : 'none'
  return {
    source,
    stored: fileSet,
    envFallback: envTokenSet && !fileSet,
    tokenSet: fileSet || envTokenSet,
    masked: fileSet
      ? maskToken(creds!.accessToken)
      : envTokenSet
        ? '(dari META_ACCESS_TOKEN env)'
        : null,
    tokenType: creds?.tokenType ?? null,
    pageId: creds?.pageId ?? null,
    pageName: creds?.pageName ?? null,
    igUserId: creds?.igUserId ?? null,
    expiresAt: creds?.expiresAt ?? null,
    updatedAt: creds?.updatedAt ?? null,
  }
}
