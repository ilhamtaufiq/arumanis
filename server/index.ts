import { Hono, type Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { buildLivenessResponse, getHealth } from '../scripts/health.ts'

const API_BASE = (Bun.env.APIAMIS_BASE_URL || 'http://apiamis.test/api').replace(/\/$/, '')
const PORT = Number(Bun.env.PORT || '8787')

if (isLikelyMisconfiguredApiBase(API_BASE)) {
  console.error(
    `[BFF] APIAMIS_BASE_URL tampak mengarah ke AI gateway, bukan Laravel API: ${API_BASE}. ` +
      'Set ke https://apiamis.cianjur.space/api (bukan URL 9router /v1).',
  )
}
const isProd = Bun.env.BUN_ENV === 'production' || Bun.env.NODE_ENV === 'production'
const SESSION_COOKIE = Bun.env.SESSION_COOKIE_NAME || 'arumanis_session'
const IMPERSONATOR_COOKIE = Bun.env.IMPERSONATOR_COOKIE_NAME || 'arumanis_impersonator_session'
const COOKIE_SECURE = Bun.env.SESSION_COOKIE_SECURE != null
  ? `${Bun.env.SESSION_COOKIE_SECURE}` === 'true'
  : isProd
const DIST_DIR = resolve(process.cwd(), 'dist')

const app = new Hono()

app.get('/health/live', (c) => c.json(buildLivenessResponse()))

app.get('/health/ready', async (c) => {
  const verbose = c.req.query('verbose') === 'true'
  const { response, statusCode } = await getHealth(API_BASE, verbose)
  return c.json(response, statusCode as any)
})

app.get('/health', async (c) => {
  const verbose = c.req.query('verbose') === 'true'
  const { response, statusCode } = await getHealth(API_BASE, verbose)
  return c.json(response, statusCode as any)
})

app.post('/bff/auth/login', async (c) => handleLogin(c))

app.post('/bff/auth/sync-token', async (c) => {
  const body = await safeJsonBody(c)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''

  if (!token) {
    return c.json({ message: 'Token tidak valid' }, 400)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Token tidak valid atau kedaluwarsa' }, 401)
  }

  setSessionCookie(c, token)
  return c.json({ message: 'Sesi disinkronkan', user: verified.user })
})

app.get('/bff/auth/me', async (c) => {
  return forwardAuthRequest(c, `${API_BASE}/auth/me`, 'GET')
})

app.post('/bff/auth/logout', async (c) => {
  const response = await forwardAuthRequest(c, `${API_BASE}/auth/logout`, 'POST')
  deleteCookie(c, SESSION_COOKIE, sessionCookieOptions())
  deleteCookie(c, IMPERSONATOR_COOKIE, sessionCookieOptions())
  return response
})

app.post('/bff/auth/impersonate/:userId', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const userId = c.req.param('userId')
  const response = await fetch(`${API_BASE}/auth/impersonate/${userId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await safeParseResponse(response)
  if (!response.ok) {
    return c.json(payload ?? { message: 'Impersonation failed' }, response.status as any)
  }

  const targetToken = extractToken(payload)
  if (!targetToken) {
    return c.json({ message: 'Token impersonasi tidak ditemukan' }, 500)
  }

  const impersonator = await verifyToken(token)
  if (impersonator.ok) {
    setCookie(c, IMPERSONATOR_COOKIE, JSON.stringify({
      user: impersonator.user,
      token,
    }), impersonatorCookieOptions())
  }

  setSessionCookie(c, targetToken)

  return c.json({
    user: extractEntity((payload as any)?.user ?? payload),
    isImpersonating: true,
    message: (payload as any)?.message,
  })
})

app.post('/bff/auth/stop-impersonate', async (c) => {
  const impersonatorRaw = getCookie(c, IMPERSONATOR_COOKIE)
  if (!impersonatorRaw) {
    return c.json({ message: 'Tidak sedang impersonate' }, 400)
  }

  let impersonator: { user?: unknown; token?: string } | null = null
  try {
    impersonator = JSON.parse(impersonatorRaw)
  } catch {
    impersonator = null
  }

  const adminToken = impersonator?.token?.trim()
  if (!adminToken) {
    return c.json({ message: 'Data impersonator tidak valid' }, 400)
  }

  const verified = await verifyToken(adminToken)
  if (!verified.ok) {
    return c.json({ message: 'Sesi admin tidak valid' }, 401)
  }

  setSessionCookie(c, adminToken)
  deleteCookie(c, IMPERSONATOR_COOKIE, sessionCookieOptions())

  return c.json({
    user: verified.user,
    isImpersonating: false,
  })
})

app.post('/bff/auth/handoff', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const response = await fetch(`${API_BASE}/auth/handoff`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await safeParseResponse(response)
  if (!response.ok) {
    return c.json(payload ?? { message: 'Handoff failed' }, response.status as any)
  }

  return c.json(payload)
})

app.post('/bff/ai/test-connection', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ ok: false, error: 'Unauthenticated' }, 401)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ ok: false, error: 'Sesi tidak valid' }, 401)
  }

  const body = await safeJsonBody(c)
  const baseUrl = typeof body?.baseUrl === 'string' ? body.baseUrl.trim().replace(/\/+$/, '') : ''
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''
  const model = typeof body?.model === 'string' ? body.model.trim() : ''

  if (!baseUrl || !isAllowedAiBaseUrl(baseUrl)) {
    return c.json({ ok: false, error: 'URL tidak valid.' }, 400)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  try {
    const modelsResponse = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10_000),
    })

    if (!modelsResponse.ok) {
      const text = await modelsResponse.text().catch(() => '')
      return c.json({
        ok: false,
        stage: 'models',
        error: `HTTP ${modelsResponse.status}: ${text.slice(0, 120) || modelsResponse.statusText}`,
      })
    }

    if (!model) {
      return c.json({ ok: true, stage: 'models' })
    }

    const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    })

    if (chatResponse.ok) {
      return c.json({ ok: true, stage: 'chat', model })
    }

    const chatError = formatAiGatewayError(await chatResponse.text().catch(() => ''), model)
    return c.json({
      ok: false,
      stage: 'chat',
      model,
      error: chatError,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ ok: false, error: `Gagal terhubung: ${msg}` })
  }
})

app.get('/version.json', (c) => {
  if (!isProd) {
    return c.json({ version: 'dev', buildId: 'dev', builtAt: '' })
  }

  const versionPath = resolve(DIST_DIR, 'version.json')
  if (!existsSync(versionPath)) {
    return c.text('Not Found', 404)
  }

  return new Response(Bun.file(versionPath), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache, no-store, must-revalidate',
      pragma: 'no-cache',
    },
  })
})

app.all('/bff/api/*', async (c) => {
  const path = c.req.path.replace(/^\/bff\/api/, '') || '/'
  const targetPath = path.replace(/^\//, '')
  const target = new URL(targetPath, `${API_BASE}/`)
  target.search = new URL(c.req.url).search

  const headers = new Headers()
  const incomingAccept = c.req.header('accept')
  headers.set('Accept', incomingAccept || 'application/json')
  const incomingContentType = c.req.header('content-type')
  if (incomingContentType) {
    headers.set('Content-Type', incomingContentType)
  }

  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const body = ['GET', 'HEAD'].includes(c.req.method) ? undefined : await c.req.arrayBuffer()
  const init: RequestInit = { method: c.req.method, headers }
  if (body !== undefined) {
    init.body = body
  }

  try {
    const response = await fetch(target, init)
    return relayResponse(response)
  } catch {
    return c.json({ message: 'Upstream API tidak tersedia' }, 502)
  }
})

app.get('*', async (c) => {
  if (isProd) {
    const requestPath = c.req.path
    const filePath = requestPath === '/' ? resolve(DIST_DIR, 'index.html') : resolve(DIST_DIR, `.${requestPath}`)
    const extension = extname(requestPath).toLowerCase()

    if (requestPath !== '/' && extension && existsSync(filePath)) {
      return new Response(Bun.file(filePath), {
        headers: {
          'content-type': contentTypeFor(filePath),
          ...cacheControlFor(requestPath),
        },
      })
    }

    if (isStaticAssetRequest(requestPath)) {
      return c.text('Not Found', 404, {
        'cache-control': 'no-cache, no-store, must-revalidate',
        pragma: 'no-cache',
      })
    }

    const indexPath = resolve(DIST_DIR, 'index.html')
    if (existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-cache, no-store, must-revalidate',
          pragma: 'no-cache',
        },
      })
    }
  }

  return c.text('BFF server running. Use Vite dev server for local UI.', 404)
})

const HOST = Bun.env.HOST || '0.0.0.0'

Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch: app.fetch,
})

console.log(`Arumanis server running on http://${HOST}:${PORT}`)

async function handleLogin(c: Context) {
  try {
    const body = await safeJsonBody(c)
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    })

    const payload = await safeParseResponse(response)
    if (!response.ok) {
      return c.json(payload ?? { message: 'Login gagal' }, response.status as any)
    }

    const token = extractToken(payload)
    if (token) {
      setSessionCookie(c, token)
    }

    return c.json({
      user: extractEntity((payload as any)?.user ?? payload),
    })
  } catch {
    return c.json({ message: 'Login gagal' }, 500)
  }
}

async function verifyToken(token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await safeParseResponse(response)
    if (!response.ok) {
      return { ok: false as const, user: null }
    }

    return {
      ok: true as const,
      user: extractEntity(payload),
    }
  } catch {
    return { ok: false as const, user: null }
  }
}

async function forwardAuthRequest(c: Context, target: string, method: string) {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401 as any)
  }

  try {
    const response = await fetch(target, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await safeParseResponse(response)
    const gatewayError = detectAiGatewayPayload(payload)
    if (gatewayError) {
      console.error('[BFF] auth upstream returned AI gateway payload', { target, model: gatewayError.model })
      return c.json({
        message: 'Konfigurasi server salah: upstream auth mengembalikan respons AI gateway.',
        hint: 'Pastikan APIAMIS_BASE_URL=https://apiamis.cianjur.space/api di Coolify (terpisah dari chat_base_url 9router).',
      }, 502 as any)
    }

    if (!response.ok) {
      return c.json(payload ?? { message: 'Request failed' }, response.status as any)
    }

    const impersonatorCookie = getCookie(c, IMPERSONATOR_COOKIE)
    let isImpersonating = false
    let impersonator = null

    if (impersonatorCookie) {
      try {
        impersonator = JSON.parse(impersonatorCookie)
        isImpersonating = Boolean(impersonator)
      } catch {
        isImpersonating = false
      }
    }

    return c.json({
      user: extractEntity((payload as any)?.data ?? payload),
      isImpersonating,
      impersonator,
      message: (payload as any)?.message,
    })
  } catch {
    return c.json({ message: 'Auth service unavailable' }, 502)
  }
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Strict' as const,
    path: '/',
  }
}

function impersonatorCookieOptions() {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
  }
}

function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    ...sessionCookieOptions(),
    maxAge: 60 * 60 * 12,
  })
}

function isLikelyMisconfiguredApiBase(value: string) {
  try {
    const url = new URL(value)
    const path = url.pathname.replace(/\/$/, '')
    if (/9router/i.test(url.hostname)) return true
    if (path.endsWith('/v1') && !path.endsWith('/api')) return true
    return false
  } catch {
    return false
  }
}

function detectAiGatewayPayload(payload: unknown): { model?: string } | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  if (typeof record.model !== 'string') return null
  if ('user' in record || 'data' in record) return null
  if (record.success === false || typeof record.error === 'string') {
    return { model: record.model }
  }
  return null
}

function formatAiGatewayError(raw: string, model: string): string {
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>
    const message = typeof payload.message === 'string'
      ? payload.message
      : typeof payload.error === 'string'
        ? payload.error
        : null
    const blocked = message?.toLowerCase().includes('blocked')
    const payloadModel = typeof payload.model === 'string' ? payload.model : model

    if (blocked) {
      return `Model "${payloadModel}" diblokir gateway AI. Ganti ke model yang didukung (mis. gc/gemini-2.5-flash).`
    }

    if (message) {
      return `Model "${payloadModel}": ${message}`
    }
  } catch {
    // Fall through to raw text.
  }

  const trimmed = raw.trim()
  if (trimmed) {
    return trimmed.slice(0, 200)
  }

  return `Model "${model}" gagal diuji.`
}

function isAllowedAiBaseUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function safeJsonBody(c: Context) {
  try {
    return await c.req.json()
  } catch {
    return null
  }
}

async function safeParseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  if (response.status === 204) return null
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

function extractToken(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  if (typeof record.token === 'string') return record.token
  if (record.data && typeof record.data === 'object' && typeof (record.data as Record<string, unknown>).token === 'string') {
    return (record.data as Record<string, unknown>).token as string
  }
  return null
}

function extractEntity(payload: unknown) {
  if (!payload || typeof payload !== 'object') return payload
  const record = payload as Record<string, unknown>
  if ('data' in record && record.data !== undefined && !Array.isArray(record.data)) return record.data
  if ('user' in record && record.user !== undefined) return record.user
  return payload
}

function relayResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('text/event-stream') && response.body) {
    return new Response(response.body, {
      status: response.status,
      headers: filterResponseHeaders(response.headers),
    })
  }

  return response.arrayBuffer().then((body) => new Response(body, {
    status: response.status,
    headers: filterResponseHeaders(response.headers),
  }))
}

function filterResponseHeaders(headers: Headers) {
  const next = new Headers()
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase()
    if (['content-length', 'content-encoding', 'transfer-encoding', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'].includes(lower)) {
      continue
    }
    next.set(key, value)
  }
  return next
}

function contentTypeFor(filePath: string) {
  const ext = extname(filePath).toLowerCase()
  if (ext === '.js' || ext === '.mjs') return 'application/javascript; charset=utf-8'
  if (ext === '.css') return 'text/css; charset=utf-8'
  if (ext === '.html') return 'text/html; charset=utf-8'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.json') return 'application/json; charset=utf-8'
  return 'application/octet-stream'
}

function isStaticAssetRequest(requestPath: string) {
  if (requestPath.startsWith('/assets/')) {
    return true
  }

  const extension = extname(requestPath).toLowerCase()
  return [
    '.js',
    '.mjs',
    '.css',
    '.wasm',
    '.map',
    '.json',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
  ].includes(extension)
}

function cacheControlFor(requestPath: string) {
  if (requestPath === '/version.json') {
    return {
      'cache-control': 'no-cache, no-store, must-revalidate',
      pragma: 'no-cache',
    }
  }

  if (requestPath.startsWith('/assets/')) {
    return {
      'cache-control': 'public, max-age=31536000, immutable',
    }
  }

  return {}
}