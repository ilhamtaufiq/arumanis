import type { Context } from 'hono'

export type SipdServerConfig = {
  baseUrl: string
  serviceToken: string
}

export function getSipdServerConfig(): SipdServerConfig {
  const baseUrl = (Bun.env.SIPD_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
  const serviceToken = (Bun.env.SIPD_SERVICE_TOKEN || '').trim()
  return { baseUrl, serviceToken }
}

export function mapBffSipdPath(bffPath: string): string | null {
  const subPath = bffPath.replace(/^\/bff\/sipd/, '') || '/'
  const normalized = subPath.replace(/\/+$/, '') || '/'

  if (normalized === '/health') {
    return '/health'
  }

  if (normalized === '/status') {
    return '/api/status'
  }

  if (normalized === '/renja') {
    return '/api/cache/renja'
  }

  const rincianMatch = normalized.match(/^\/rincian\/(\d+)$/)
  if (rincianMatch) {
    return `/api/cache/rincian/${rincianMatch[1]}`
  }

  return null
}

export function buildSipdTarget(upstreamPath: string, search: string, config: SipdServerConfig): URL {
  const target = new URL(upstreamPath.replace(/^\//, ''), `${config.baseUrl}/`)
  target.search = search
  return target
}

/** BFF meneruskan token sesi Arumanis — SIPD memvalidasi ke APIAMIS. */
export function sipdUpstreamHeaders(sessionToken: string): Headers {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${sessionToken}`)
  return headers
}

export async function proxySipdRequest(
  c: Context,
  options: {
    verifySession: (token: string) => Promise<{ ok: boolean }>
    getSessionToken: (c: Context) => string | undefined
    relayResponse: (response: Response) => Promise<Response>
    timeoutMs?: number
  },
): Promise<Response> {
  const config = getSipdServerConfig()
  if (!config.baseUrl) {
    return c.json({ message: 'Layanan SIPD tidak dikonfigurasi (SIPD_BASE_URL)' }, 503)
  }

  const sessionToken = options.getSessionToken(c)
  if (!sessionToken) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const verified = await options.verifySession(sessionToken)
  if (!verified.ok) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const upstreamPath = mapBffSipdPath(c.req.path)
  if (!upstreamPath) {
    return c.json({ message: 'Endpoint SIPD tidak dikenali' }, 404)
  }

  const target = buildSipdTarget(upstreamPath, new URL(c.req.url).search, config)
  const headers = sipdUpstreamHeaders(sessionToken)

  try {
    const response = await fetch(target, {
      method: c.req.method,
      headers,
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
    })
    return await options.relayResponse(response)
  } catch (error) {
    console.error('[BFF] SIPD upstream fetch failed:', target.toString(), error)
    return c.json({ message: 'Layanan SIPD tidak tersedia' }, 502)
  }
}