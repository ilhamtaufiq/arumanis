import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { buildSipdTarget, mapBffSipdPath, proxySipdRequest, sipdUpstreamHeaders } from './sipd-proxy.ts'

describe('sipd-proxy', () => {
  it('maps BFF paths to SIPD upstream endpoints', () => {
    expect(mapBffSipdPath('/bff/sipd/renja')).toBe('/api/cache/renja')
    expect(mapBffSipdPath('/bff/sipd/rincian/316870')).toBe('/api/cache/rincian/316870')
    expect(mapBffSipdPath('/bff/sipd/status')).toBe('/api/status')
    expect(mapBffSipdPath('/bff/sipd/health')).toBe('/health')
    expect(mapBffSipdPath('/bff/sipd/unknown')).toBeNull()
  })

  it('builds upstream URL with query string', () => {
    const target = buildSipdTarget('/api/cache/renja', 'tahun=2026', {
      baseUrl: 'http://127.0.0.1:8000',
      serviceToken: '',
    })
    expect(target.toString()).toBe('http://127.0.0.1:8000/api/cache/renja?tahun=2026')
  })

  it('prefers SIPD service token for upstream auth after BFF session check', () => {
    const headers = sipdUpstreamHeaders('user-session-token', {
      baseUrl: 'http://127.0.0.1:8000',
      serviceToken: 'shared-service-token',
    })
    expect(headers.get('Authorization')).toBe('Bearer shared-service-token')
  })

  it('falls back to user session token when service token is unset', () => {
    const headers = sipdUpstreamHeaders('user-session-token', {
      baseUrl: 'http://127.0.0.1:8000',
      serviceToken: '',
    })
    expect(headers.get('Authorization')).toBe('Bearer user-session-token')
  })

  it('requires SIPD_SERVICE_TOKEN in production after session verification', async () => {
    const originalBun = (globalThis as { Bun?: unknown }).Bun
    ;(globalThis as { Bun?: { env: Record<string, string | undefined> } }).Bun = {
      env: {
        BUN_ENV: 'production',
        SIPD_BASE_URL: 'http://127.0.0.1:8000',
        SIPD_SERVICE_TOKEN: '',
      },
    }

    const app = new Hono()
    app.get('/bff/sipd/renja', async (c) => proxySipdRequest(c, {
      verifySession: async () => ({ ok: true }),
      getSessionToken: () => 'valid-user-session',
      relayResponse: async (response) => response,
    }))

    try {
      const response = await app.request('http://localhost/bff/sipd/renja?tahun=2026', {
        headers: { Accept: 'application/json' },
      })
      expect(response.status).toBe(503)
      const payload = await response.json()
      expect(payload.code).toBe('SIPD_SERVICE_TOKEN_MISSING')
    } finally {
      if (originalBun === undefined) {
        delete (globalThis as { Bun?: unknown }).Bun
      } else {
        ;(globalThis as { Bun?: unknown }).Bun = originalBun
      }
    }
  })

  it('maps upstream SIPD 401 to 502 after BFF session verification', async () => {
    const originalFetch = globalThis.fetch
    const originalBun = (globalThis as { Bun?: unknown }).Bun
    ;(globalThis as { Bun?: { env: Record<string, string | undefined> } }).Bun = {
      env: {
        BUN_ENV: 'development',
        SIPD_BASE_URL: 'http://127.0.0.1:8000',
        SIPD_SERVICE_TOKEN: 'shared-service-token',
      },
    }
    globalThis.fetch = vi.fn(async () => new Response(
      JSON.stringify({ detail: 'Token tidak valid atau kedaluwarsa' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )) as typeof fetch

    const app = new Hono()
    app.get('/bff/sipd/renja', async (c) => proxySipdRequest(c, {
      verifySession: async () => ({ ok: true }),
      getSessionToken: () => 'valid-user-session',
      relayResponse: async (response) => response,
    }))

    try {
      const response = await app.request('http://localhost/bff/sipd/renja?tahun=2026', {
        headers: { Accept: 'application/json' },
      })
      expect(response.status).toBe(502)
      const payload = await response.json()
      expect(payload.code).toBe('SIPD_UPSTREAM_UNAUTHORIZED')
    } finally {
      globalThis.fetch = originalFetch
      if (originalBun === undefined) {
        delete (globalThis as { Bun?: unknown }).Bun
      } else {
        ;(globalThis as { Bun?: unknown }).Bun = originalBun
      }
    }
  })
})