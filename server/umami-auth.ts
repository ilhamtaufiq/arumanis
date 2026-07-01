export type UmamiServerConfig = {
  apiUrl: string
  websiteId: string
  apiToken?: string
  username?: string
  password?: string
}

type CachedUmamiToken = {
  token: string
  expiresAt: number
}

const TOKEN_CACHE_TTL_MS = 60 * 60 * 12 * 1000
let cachedLoginToken: CachedUmamiToken | null = null

export function resolveUmamiApiUrl(): string {
  const explicit = (Bun.env.UMAMI_API_URL || '').trim().replace(/\/$/, '')
  if (explicit) {
    return explicit
  }

  const scriptUrl = (Bun.env.VITE_UMAMI_SCRIPT_URL || '').trim()
  if (!scriptUrl) {
    return ''
  }

  try {
    const url = new URL(scriptUrl)
    return `${url.protocol}//${url.host}`
  } catch {
    return ''
  }
}

export function getUmamiConfigGap(): 'missing_credentials' | 'missing_website_id' | 'missing_api_url' {
  const apiUrl = resolveUmamiApiUrl()
  const apiToken = (Bun.env.UMAMI_API_TOKEN || '').trim()
  const username = (Bun.env.UMAMI_USERNAME || '').trim()
  const password = (Bun.env.UMAMI_PASSWORD || '').trim()
  const websiteId = (Bun.env.UMAMI_WEBSITE_ID || Bun.env.VITE_UMAMI_WEBSITE_ID || '').trim()

  if (!apiToken && !(username && password)) {
    return 'missing_credentials'
  }
  if (!websiteId) {
    return 'missing_website_id'
  }
  if (!apiUrl) {
    return 'missing_api_url'
  }
  return 'missing_credentials'
}

export function getUmamiServerConfig(): UmamiServerConfig | null {
  const apiUrl = resolveUmamiApiUrl()
  const apiToken = (Bun.env.UMAMI_API_TOKEN || '').trim()
  const username = (Bun.env.UMAMI_USERNAME || '').trim()
  const password = (Bun.env.UMAMI_PASSWORD || '').trim()
  const websiteId = (Bun.env.UMAMI_WEBSITE_ID || Bun.env.VITE_UMAMI_WEBSITE_ID || '').trim()
  const hasAuth = Boolean(apiToken || (username && password))

  if (!apiUrl || !websiteId || !hasAuth) {
    return null
  }

  return {
    apiUrl,
    websiteId,
    ...(apiToken ? { apiToken } : {}),
    ...(username && password ? { username, password } : {}),
  }
}

export async function getUmamiBearerToken(config: UmamiServerConfig): Promise<string | null> {
  if (config.apiToken) {
    return config.apiToken
  }

  if (!config.username || !config.password) {
    return null
  }

  if (cachedLoginToken && cachedLoginToken.expiresAt > Date.now()) {
    return cachedLoginToken.token
  }

  const response = await fetch(new URL('api/auth/login', `${config.apiUrl}/`), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
    }),
    signal: AbortSignal.timeout(10_000),
  })

  const payload = await safeParseJson(response)
  if (!response.ok) {
    cachedLoginToken = null
    console.error('[BFF] Umami login failed', { status: response.status })
    return null
  }

  const token = extractUmamiToken(payload)
  if (!token) {
    cachedLoginToken = null
    return null
  }

  cachedLoginToken = {
    token,
    expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
  }

  return token
}

export function clearUmamiTokenCache() {
  cachedLoginToken = null
}

function extractUmamiToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const record = payload as Record<string, unknown>
  if (typeof record.token === 'string' && record.token.trim()) {
    return record.token.trim()
  }

  return null
}

async function safeParseJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}