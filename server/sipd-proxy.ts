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
  const config = getSipdServerConfig()
  if (!config.baseUrl) {
    return c.json({ message: 'Layanan SIPD tidak dikonfigurasi (SIPD_BASE_URL)' }, 503)
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
    console.error('[BFF] SIPD_SERVICE_TOKEN tidak diset — proxy SIPD ditolak di production')
    return c.json({
      message:
        'SIPD_SERVICE_TOKEN belum dikonfigurasi di BFF Arumanis. Set nilai yang sama di service SIPD lalu redeploy.',
      code: 'SIPD_SERVICE_TOKEN_MISSING',
    }, 503)
  }

  const upstreamPath = mapBffSipdPath(c.req.path)
  if (!upstreamPath) {
    return c.json({ message: 'Endpoint SIPD tidak dikenali' }, 404)
  }

  const target = buildSipdTarget(upstreamPath, new URL(c.req.url).search, config)
  const headers = sipdUpstreamHeaders(sessionToken, config)

  try {
    const response = await fetch(target, {
      method: c.req.method,
      headers,
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
    })

    // Sesi Arumanis sudah diverifikasi di atas — 401 dari upstream SIPD bukan sesi user.
    if (response.status === 401) {
      return c.json({
        message:
          'Layanan SIPD menolak token upstream. Pastikan SIPD_SERVICE_TOKEN sama di BFF Arumanis dan layanan SIPD, atau SIPD dapat memvalidasi token ke APIAMIS.',
        code: 'SIPD_UPSTREAM_UNAUTHORIZED',
      }, 502)
    }

    return await options.relayResponse(response)
  } catch (error) {
    console.error('[BFF] SIPD upstream fetch failed:', target.toString(), error)
    return c.json({ message: 'Layanan SIPD tidak tersedia' }, 502)
  }
}