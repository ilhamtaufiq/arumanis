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

const SIPD_PUBLIC_UPSTREAM_PATHS = new Set(['/api/status'])

export function isSipdPublicUpstreamPath(upstreamPath: string): boolean {
  return SIPD_PUBLIC_UPSTREAM_PATHS.has(upstreamPath)
}

export function mapBffSipdPath(bffPath: string): string | null {
  const subPath = bffPath.replace(/^\/bff\/sipd/, '') || '/'
  const normalized = subPath.replace(/\/+$/, '') || '/'

  if (normalized === '/health' || normalized === '/status') {
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

export function buildSipdTarget(
  upstreamPath: string,
  search: string,
  config: SipdServerConfig,
  options?: { serviceTokenInQuery?: boolean },
): URL {
  const target = new URL(upstreamPath.replace(/^\//, ''), `${config.baseUrl}/`)
  target.search = search
  if (options?.serviceTokenInQuery && config.serviceToken) {
    target.searchParams.set('token', config.serviceToken)
  }
  return target
}

/**
 * Setelah BFF memverifikasi sesi user, upstream SIPD memakai SIPD_SERVICE_TOKEN
 * bila dikonfigurasi — menghindari validasi ulang ke APIAMIS dari container SIPD.
 * Tanpa service token, token sesi user diteruskan dan SIPD memvalidasi ke APIAMIS.
 */
export function sipdUpstreamHeaders(
  sessionToken: string | undefined,
  config: SipdServerConfig,
  options?: { requireAuth?: boolean; userSessionVerified?: boolean },
): Headers {
  const headers = new Headers()
  headers.set('Accept', 'application/json')

  let upstreamToken = ''
  if (config.serviceToken && options?.userSessionVerified) {
    upstreamToken = config.serviceToken
  } else {
    upstreamToken = sessionToken?.trim() || config.serviceToken || ''
  }

  if (upstreamToken && options?.requireAuth !== false) {
    headers.set('Authorization', `Bearer ${upstreamToken}`)
  }
  return headers
}

const MAX_SIPD_JSON_BYTES = 10 * 1024 * 1024

export async function relaySipdJsonResponse(c: Context, response: Response): Promise<Response> {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const preview = (await response.text().catch(() => '')).slice(0, 200)
    return c.json({
      message: 'Layanan SIPD mengembalikan respons non-JSON.',
      code: 'SIPD_UPSTREAM_BAD_RESPONSE',
      preview,
    }, 502)
  }

  const text = await response.text()
  if (text.length > MAX_SIPD_JSON_BYTES) {
    return c.json({
      message: 'Respons SIPD terlalu besar.',
      code: 'SIPD_UPSTREAM_PAYLOAD_TOO_LARGE',
    }, 502)
  }

  try {
    const payload = text ? JSON.parse(text) : null
    return c.json(payload, response.status as 200)
  } catch {
    return c.json({
      message: 'Layanan SIPD mengembalikan JSON tidak valid.',
      code: 'SIPD_UPSTREAM_BAD_JSON',
    }, 502)
  }
}

export async function proxySipdRequest(
  c: Context,
  options: {
    verifySession: (token: string) => Promise<{ ok: boolean }>
    getSessionToken: (c: Context) => string | undefined
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

    const upstreamPath = mapBffSipdPath(c.req.path)
    if (!upstreamPath) {
      return c.json({ message: 'Endpoint SIPD tidak dikenali' }, 404)
    }

    const isPublicUpstream = isSipdPublicUpstreamPath(upstreamPath)
    const sessionToken = options.getSessionToken(c)

    if (!isPublicUpstream) {
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

    }

    const userSessionVerified = !isPublicUpstream && Boolean(sessionToken)

    let target: URL
    try {
      target = buildSipdTarget(upstreamPath, new URL(c.req.url).search, config, {
        serviceTokenInQuery: userSessionVerified && Boolean(config.serviceToken),
      })
    } catch (error) {
      console.error('[BFF] SIPD_BASE_URL tidak valid:', config.baseUrl, error)
      return c.json({
        message: 'SIPD_BASE_URL tidak valid di server Arumanis.',
        code: 'SIPD_INVALID_BASE_URL',
      }, 503)
    }
    const headers = sipdUpstreamHeaders(sessionToken, config, {
      requireAuth: !isPublicUpstream || Boolean(config.serviceToken),
      userSessionVerified,
    })
    const timeoutMs = options.timeoutMs ?? Number(Bun.env.SIPD_PROXY_TIMEOUT_MS || 30_000)

    const response = await fetch(target, {
      method: c.req.method,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    })

    // Sesi Arumanis sudah diverifikasi di atas — 401 dari upstream SIPD bukan sesi user.
    if (response.status === 401) {
      if (!config.serviceToken && isProductionRuntime() && userSessionVerified) {
        return c.json({
          message: 'SIPD_SERVICE_TOKEN belum dikonfigurasi di server Arumanis (production).',
          code: 'SIPD_SERVICE_TOKEN_MISSING',
        }, 502)
      }

      return c.json({
        message:
          'Layanan SIPD menolak token upstream. Pastikan SIPD_SERVICE_TOKEN sama di BFF Arumanis dan service SIPD, atau APIAMIS_BASE_URL di SIPD dapat dijangkau.',
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

    return await relaySipdJsonResponse(c, response)
  } catch (error) {
    console.error('[BFF] SIPD proxy failed:', c.req.path, error)
    return c.json({
      message: 'Layanan SIPD tidak dapat dihubungi dari server Arumanis.',
      code: 'SIPD_UPSTREAM_UNAVAILABLE',
    }, 502)
  }
}