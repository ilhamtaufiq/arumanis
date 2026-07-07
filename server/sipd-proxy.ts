import type { Context } from 'hono'
import { resolveSipdBaseUrl } from './lib/sipd-config.ts'

export type SipdServerConfig = {
  baseUrl: string
  serviceToken: string
}

function isProductionRuntime(): boolean {
  return Bun.env.BUN_ENV === 'production' || Bun.env.NODE_ENV === 'production'
}

export function getSipdServerConfig(): SipdServerConfig {
  const baseUrl = resolveSipdBaseUrl({
    configuredUrl: Bun.env.SIPD_BASE_URL,
    isProduction: isProductionRuntime(),
  })
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

/**
 * Setelah BFF memverifikasi sesi user, upstream SIPD memakai SIPD_SERVICE_TOKEN
 * bila dikonfigurasi (disarankan di production). Fallback: token sesi user.
 */
export function sipdUpstreamHeaders(sessionToken: string, config: SipdServerConfig): Headers {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  const upstreamToken = config.serviceToken || sessionToken
  headers.set('Authorization', `Bearer ${upstreamToken}`)
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
  try {
    const config = getSipdServerConfig()
    if (!config.baseUrl) {
      return c.json({
        message: 'Layanan SIPD tidak dikonfigurasi (SIPD_BASE_URL)',
        code: 'SIPD_NOT_CONFIGURED',
      }, 503)
    }

    const sessionToken = options.getSessionToken(c)
    if (!sessionToken) {
      return c.json({
        message: 'Sesi Arumanis tidak ditemukan. Masuk ulang.',
        code: 'BFF_NO_SESSION',
      }, 401)
    }

    const verified = await options.verifySession(sessionToken)
    if (!verified.ok) {
      return c.json({
        message: 'Sesi Arumanis tidak valid atau kedaluwarsa. Masuk ulang.',
        code: 'BFF_INVALID_SESSION',
      }, 401)
    }

    if (isProductionRuntime() && !config.serviceToken) {
      console.warn(
        '[BFF] SIPD_SERVICE_TOKEN tidak diset — memakai token sesi user ke upstream SIPD. ' +
          'Disarankan set token layanan yang sama di BFF Arumanis dan service SIPD.',
      )
    }

    const upstreamPath = mapBffSipdPath(c.req.path)
    if (!upstreamPath) {
      return c.json({ message: 'Endpoint SIPD tidak dikenali' }, 404)
    }

    let target: URL
    try {
      target = buildSipdTarget(upstreamPath, new URL(c.req.url).search, config)
    } catch (error) {
      console.error('[BFF] SIPD_BASE_URL tidak valid:', config.baseUrl, error)
      return c.json({
        message: 'SIPD_BASE_URL tidak valid di server Arumanis.',
        code: 'SIPD_INVALID_BASE_URL',
      }, 503)
    }

    const headers = sipdUpstreamHeaders(sessionToken, config)
    const timeoutMs = options.timeoutMs ?? Number(Bun.env.SIPD_PROXY_TIMEOUT_MS || 30_000)

    const response = await fetch(target, {
      method: c.req.method,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    })

    // Sesi Arumanis sudah diverifikasi di atas — 401 dari upstream SIPD bukan sesi user.
    if (response.status === 401) {
      return c.json({
        message:
          'Layanan SIPD menolak token upstream. Set SIPD_SERVICE_TOKEN yang sama di BFF Arumanis dan layanan SIPD.',
        code: 'SIPD_UPSTREAM_UNAUTHORIZED',
      }, 502)
    }

    if (response.status >= 500) {
      return c.json({
        message: 'Layanan SIPD mengembalikan error server.',
        code: 'SIPD_UPSTREAM_ERROR',
        upstream_status: response.status,
      }, 502)
    }

    return await options.relayResponse(response)
  } catch (error) {
    console.error('[BFF] SIPD proxy failed:', c.req.path, error)
    return c.json({
      message: 'Layanan SIPD tidak dapat dihubungi dari server Arumanis.',
      code: 'SIPD_UPSTREAM_UNAVAILABLE',
    }, 502)
  }
}