import { Hono, type Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { buildLivenessResponse, getHealth } from '../scripts/health.ts'
import {
  buildOnlyOfficeWebSocketUrl,
  createOnlyOfficeWebSocketHandlers,
  getProxyPublicOrigin,
  isOnlyOfficeRequest,
  proxyOnlyOfficeHttp,
  type OnlyOfficeWsData,
} from './onlyoffice-proxy.ts'
import { buildPublikasiHtml, buildPublikasiListHtml, buildPuspenHtml } from './seo-meta.ts'
import { buildSitemapXml } from './sitemap.ts'
import {
  clearUmamiTokenCache,
  getUmamiBearerToken,
  getUmamiConfigGap,
  getUmamiServerConfig,
} from './umami-auth.ts'
import { proxySipdRequest } from './sipd-proxy.ts'
import {
  META_WEBHOOK_PATH,
  appendOutboundMessage,
  fetchInstagramBusinessProfile,
  fetchInstagramMedia,
  getInstagramStoreSnapshot,
  getMetaConfigStatus,
  getMetaInstagramConfig,
  markThreadRead,
  parseMetaWebhookPayload,
  parseMetaWebhookVerifyQuery,
  probeMetaToken,
  processMetaWebhookPayload,
  sendInstagramTextMessage,
  syncInstagramMediaAndProfile,
  verifyMetaWebhookSignature,
  verifyMetaWebhookSubscription,
} from './instagram/index.ts'

const API_BASE = (
  Bun.env.APIAMIS_BASE_URL ||
  Bun.env.VITE_API_BASE_URL ||
  'http://apiamis.test/api'
).replace(/\/$/, '')
const ONLYOFFICE_BASE = (Bun.env.ONLYOFFICE_DOCUMENT_SERVER_URL || 'https://office.cianjur.space').replace(/\/$/, '')
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
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ user: null })
  }

  return forwardAuthRequest(c, `${API_BASE}/auth/me`, 'GET', {
    treatUnauthorizedAsAnonymous: true,
  })
})

app.get('/bff/swagger-docs', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  if (!userHasRole(verified.user, 'admin')) {
    return c.json({ message: 'Akses ditolak. Dokumentasi API hanya untuk admin.' }, 403)
  }

  const swaggerBase = API_BASE.replace(/\/api\/?$/, '')
  const target = `${swaggerBase}/api/documentation?access_token=${encodeURIComponent(token)}`

  return c.redirect(target)
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

// ─── Meta / Instagram webhooks + admin probes ───────────────────────────────
// Callback URL di App Dashboard: https://<public-host>/bff/webhooks/meta
// (atau path yang sama di balik reverse proxy production)

app.get(META_WEBHOOK_PATH, (c) => {
  const config = getMetaInstagramConfig()
  const query = parseMetaWebhookVerifyQuery(new URL(c.req.url).searchParams)
  const result = verifyMetaWebhookSubscription(query, config)

  if (!result.ok) {
    console.warn('[meta-webhook] verify failed:', result.reason)
    return c.text('Forbidden', 403)
  }

  return c.text(result.challenge, 200)
})

app.post(META_WEBHOOK_PATH, async (c) => {
  const config = getMetaInstagramConfig()
  const rawBody = await c.req.text()
  const signature = c.req.header('x-hub-signature-256')

  if (config.enforceSignature) {
    if (!config.appSecret) {
      console.error('[meta-webhook] enforce signature but META_APP_SECRET missing')
      return c.text('Server misconfigured', 500)
    }
    if (!verifyMetaWebhookSignature(rawBody, signature, config.appSecret)) {
      console.warn('[meta-webhook] invalid signature')
      return c.text('Invalid signature', 401)
    }
  } else if (config.appSecret && signature) {
    if (!verifyMetaWebhookSignature(rawBody, signature, config.appSecret)) {
      console.warn('[meta-webhook] invalid signature (soft mode)')
      return c.text('Invalid signature', 401)
    }
  }

  const payload = parseMetaWebhookPayload(rawBody)
  if (!payload) {
    return c.text('Bad Request', 400)
  }

  try {
    const result = await processMetaWebhookPayload(payload)
    console.info(
      '[meta-webhook]',
      result.summary,
      `messages=${result.messagesIngested}`,
      `comments=${result.commentsIngested}`,
    )
  } catch (err) {
    console.error('[meta-webhook] ingest failed', err)
    // Still ACK so Meta does not disable the subscription for transient store errors.
  }

  return c.text('EVENT_RECEIVED', 200)
})

/** Public readiness of Meta env (no secrets). */
app.get('/bff/instagram/status', async (c) => {
  const status = getMetaConfigStatus()
  const store = await getInstagramStoreSnapshot()
  return c.json({
    ...status,
    mediaCached: store.media.length,
    mediaSyncedAt: store.mediaSyncedAt,
    inboxThreads: store.threads.length,
    commentsCached: store.comments.length,
    eventsCached: store.events.length,
  })
})

const MEDIA_STALE_MS = 30 * 60 * 1000

function isMediaStale(mediaSyncedAt: string | null): boolean {
  if (!mediaSyncedAt) return true
  const t = Date.parse(mediaSyncedAt)
  if (Number.isNaN(t)) return true
  return Date.now() - t > MEDIA_STALE_MS
}

/** Public gallery feed from local cache (auto-refresh when stale + token configured). */
app.get('/bff/instagram/gallery', async (c) => {
  const limit = Math.min(Math.max(Number(c.req.query('limit') || 12) || 12, 1), 24)
  const status = getMetaConfigStatus()
  let store = await getInstagramStoreSnapshot()

  if (status.capabilities.media && isMediaStale(store.mediaSyncedAt)) {
    try {
      await syncInstagramMediaAndProfile({ limit: 24 })
      store = await getInstagramStoreSnapshot()
    } catch (err) {
      console.warn(
        '[instagram/gallery] sync failed, serving cache:',
        err instanceof Error ? err.message : err,
      )
    }
  }

  const media = store.media.slice(0, limit).map((item) => ({
    id: item.id,
    caption: item.caption,
    media_type: item.media_type,
    media_url: item.media_url,
    thumbnail_url: item.thumbnail_url,
    permalink: item.permalink,
    timestamp: item.timestamp,
    username: item.username || store.profile?.username,
  }))

  return c.json({
    data: media,
    profile: store.profile
      ? {
          id: store.profile.id,
          username: store.profile.username,
          name: store.profile.name,
          profile_picture_url: store.profile.profile_picture_url,
          media_count: store.profile.media_count,
        }
      : null,
    syncedAt: store.mediaSyncedAt,
    configured: status.capabilities.media,
  })
})

async function requireAdminSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return { ok: false as const, response: c.json({ ok: false, error: 'Unauthenticated' }, 401) }
  }
  const verified = await verifyToken(token)
  if (!verified.ok) {
    return { ok: false as const, response: c.json({ ok: false, error: 'Sesi tidak valid' }, 401) }
  }
  if (!userHasRole(verified.user, 'admin')) {
    return {
      ok: false as const,
      response: c.json({ ok: false, error: 'Akses ditolak. Hanya admin.' }, 403),
    }
  }
  return { ok: true as const, user: verified.user }
}

/** Admin: probe token + optional media/profile sample (session required). */
app.get('/bff/instagram/probe', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response

  const status = getMetaConfigStatus()
  const probe = await probeMetaToken()
  const store = await getInstagramStoreSnapshot()

  let mediaCount: number | null = null
  let profile: Awaited<ReturnType<typeof fetchInstagramBusinessProfile>> | null = null

  if (probe.ok && status.capabilities.media) {
    try {
      const media = await fetchInstagramMedia({ limit: 3 })
      mediaCount = media.length
    } catch (err) {
      return c.json({
        ok: false,
        status,
        probe,
        store: {
          mediaCached: store.media.length,
          mediaSyncedAt: store.mediaSyncedAt,
          inboxThreads: store.threads.length,
          commentsCached: store.comments.length,
        },
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (probe.ok && status.capabilities.businessProfile) {
    try {
      profile = await fetchInstagramBusinessProfile()
    } catch {
      profile = null
    }
  }

  return c.json({
    ok: probe.ok,
    status,
    probe,
    mediaSampleCount: mediaCount,
    store: {
      mediaCached: store.media.length,
      mediaSyncedAt: store.mediaSyncedAt,
      inboxThreads: store.threads.length,
      commentsCached: store.comments.length,
      eventsCached: store.events.length,
    },
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          name: profile.name,
          media_count: profile.media_count,
          followers_count: profile.followers_count,
        }
      : store.profile
        ? {
            id: store.profile.id,
            username: store.profile.username,
            name: store.profile.name,
            media_count: store.profile.media_count,
            followers_count: store.profile.followers_count,
          }
        : null,
  })
})

/** Admin: pull media + profile from Graph into cache. */
app.post('/bff/instagram/sync', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response

  const status = getMetaConfigStatus()
  if (!status.capabilities.media) {
    return c.json(
      {
        ok: false,
        error: 'Token / IG user id belum dikonfigurasi',
        missing: status.missing,
      },
      400,
    )
  }

  try {
    const result = await syncInstagramMediaAndProfile({ limit: 24 })
    return c.json({ ok: true, ...result })
  } catch (err) {
    return c.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      502,
    )
  }
})

/** Admin: cached media list. */
app.get('/bff/instagram/media', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response
  const store = await getInstagramStoreSnapshot()
  return c.json({
    data: store.media,
    syncedAt: store.mediaSyncedAt,
    profile: store.profile,
  })
})

/** Admin: inbox threads (without full message bodies in list). */
app.get('/bff/instagram/inbox', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response
  const store = await getInstagramStoreSnapshot()
  const threads = store.threads.map((t) => ({
    id: t.id,
    participantId: t.participantId,
    lastMessageAt: t.lastMessageAt,
    lastText: t.lastText,
    unread: t.unread,
    messageCount: t.messages.length,
  }))
  return c.json({ data: threads })
})

app.get('/bff/instagram/inbox/:threadId', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response
  const threadId = c.req.param('threadId')
  const store = await getInstagramStoreSnapshot()
  const thread = store.threads.find((t) => t.id === threadId)
  if (!thread) {
    return c.json({ error: 'Thread tidak ditemukan' }, 404)
  }
  await markThreadRead(threadId)
  return c.json({ data: { ...thread, unread: 0 } })
})

/** Admin: reply with optional Human Agent tag. */
app.post('/bff/instagram/inbox/:threadId/reply', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response

  const threadId = c.req.param('threadId')
  const body = await safeJsonBody(c)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const humanAgent = body?.humanAgent === true || body?.tag === 'HUMAN_AGENT'

  if (!text) {
    return c.json({ ok: false, error: 'Pesan tidak boleh kosong' }, 400)
  }

  const store = await getInstagramStoreSnapshot()
  const thread = store.threads.find((t) => t.id === threadId)
  const recipientId = thread?.participantId || threadId
  const config = getMetaInstagramConfig()

  if (!config.accessToken || !config.igUserId) {
    return c.json({ ok: false, error: 'META_ACCESS_TOKEN / META_IG_USER_ID belum dikonfigurasi' }, 400)
  }

  try {
    const result = await sendInstagramTextMessage({
      recipientId,
      text,
      tag: humanAgent ? 'HUMAN_AGENT' : undefined,
    })

    await appendOutboundMessage({
      participantId: recipientId,
      senderId: config.igUserId,
      recipientId,
      text,
      humanAgent,
      mid: result.message_id,
    })

    return c.json({
      ok: true,
      message_id: result.message_id,
      humanAgent,
    })
  } catch (err) {
    return c.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      502,
    )
  }
})

/** Admin: comments cache. */
app.get('/bff/instagram/comments', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response
  const store = await getInstagramStoreSnapshot()
  return c.json({ data: store.comments })
})

/** Admin: recent webhook events. */
app.get('/bff/instagram/events', async (c) => {
  const auth = await requireAdminSession(c)
  if (!auth.ok) return auth.response
  const store = await getInstagramStoreSnapshot()
  const limit = Math.min(Math.max(Number(c.req.query('limit') || 30) || 30, 1), 100)
  return c.json({
    data: store.events.slice(0, limit).map((e) => ({
      id: e.id,
      receivedAt: e.receivedAt,
      object: e.object,
      summary: e.summary,
    })),
  })
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

app.get('/bff/analytics/realtime', async (c) => {
  const umamiConfig = getUmamiServerConfig()
  if (!umamiConfig) {
    return c.json({
      enabled: false as const,
      reason: getUmamiConfigGap(),
    })
  }

  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  try {
    const bearerToken = await getUmamiBearerToken(umamiConfig)
    if (!bearerToken) {
      return c.json({
        enabled: false as const,
        reason: 'missing_credentials' as const,
      })
    }

    const target = new URL(
      `api/realtime/${encodeURIComponent(umamiConfig.websiteId)}`,
      `${umamiConfig.apiUrl}/`,
    )

    const response = await fetchRealtimeWithAuth(target, bearerToken)

    if (response.status === 401 && !umamiConfig.apiToken) {
      clearUmamiTokenCache()
      const refreshedToken = await getUmamiBearerToken(umamiConfig)
      if (refreshedToken) {
        const retryResponse = await fetchRealtimeWithAuth(target, refreshedToken)
        return await buildUmamiRealtimeResponse(c, umamiConfig, retryResponse)
      }
    }

    return await buildUmamiRealtimeResponse(c, umamiConfig, response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[BFF] Umami realtime fetch failed', { error: msg })
    return c.json({ message: 'Layanan analytics tidak tersedia' }, 502)
  }
})

async function fetchRealtimeWithAuth(target: URL, bearerToken: string) {
  return fetch(target, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    signal: AbortSignal.timeout(10_000),
  })
}

async function buildUmamiRealtimeResponse(
  c: Context,
  umamiConfig: ReturnType<typeof getUmamiServerConfig>,
  response: Response,
) {
    const payload = await safeParseResponse(response)
    if (!response.ok) {
      console.error('[BFF] Umami realtime upstream error', {
        status: response.status,
        websiteId: umamiConfig?.websiteId,
      })
      return c.json(
        { message: 'Gagal mengambil data pengunjung aktif dari Umami' },
        response.status >= 500 ? 502 : response.status as any,
      )
    }

    return c.json({
      enabled: true as const,
      data: normalizeUmamiRealtime(payload),
    })
}

const BFF_UPSTREAM_TIMEOUT_MS = 60_000
const BFF_LONG_RUNNING_TIMEOUT_MS = 180_000
/** Restore upload / job APIs — not full multi-GB zip GET streams. */
const BFF_FILE_TRANSFER_TIMEOUT_MS = 900_000

/**
 * Upstream abort timeout for BFF proxy.
 * Returns null = no AbortSignal (needed for multi-GB backup zip downloads;
 * a 15m cap still aborts mid-stream on slow links).
 */
function bffUpstreamTimeoutMs(targetPath: string, method = 'GET'): number | null {
  if (/^procurement\/spse\/(kontrak\/push|sync|packages\/)/.test(targetPath)) {
    return BFF_LONG_RUNNING_TIMEOUT_MS
  }

  // Stream backup archives without time cap — 3GB+ files can take >15 minutes.
  if (
    (method === 'GET' || method === 'HEAD') &&
    /^app-settings\/backups\/.+\.zip$/i.test(targetPath)
  ) {
    return null
  }

  // Server-side restore of multi-GB zips (extract + SQL + media) can run for hours.
  if (method === 'POST' && /^app-settings\/backups\/restore$/i.test(targetPath)) {
    return null
  }

  // create (returns 202 quickly) / list / jobs still need a bound
  if (/^app-settings\/backups(?:\/|$)/.test(targetPath)) {
    return BFF_FILE_TRANSFER_TIMEOUT_MS
  }

  return BFF_UPSTREAM_TIMEOUT_MS
}

function shouldStreamUpstreamResponse(response: Response): boolean {
  if (!response.body) return false

  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('text/event-stream')) return true
  if (contentType.includes('application/zip')) return true
  if (contentType.includes('application/octet-stream')) return true
  if (contentType.includes('application/pdf')) return true
  if (contentType.startsWith('image/')) return true
  if (contentType.startsWith('video/')) return true
  if (contentType.startsWith('audio/')) return true

  const disposition = response.headers.get('content-disposition') || ''
  if (/attachment/i.test(disposition)) return true

  return false
}

app.post('/bff/broadcasting/auth', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  const incomingContentType = c.req.header('content-type')
  if (incomingContentType) {
    headers.set('Content-Type', incomingContentType)
  }

  try {
    const response = await fetch(`${API_BASE}/broadcasting/auth`, {
      method: 'POST',
      headers,
      body: await c.req.arrayBuffer(),
      signal: AbortSignal.timeout(BFF_UPSTREAM_TIMEOUT_MS),
    })
    return await relayResponse(response)
  } catch (error) {
    console.error('[BFF] Broadcasting auth failed:', error)
    return c.json({ message: 'Upstream API tidak tersedia' }, 502)
  }
})

app.all('/bff/sipd/*', async (c) => {
  try {
    return await proxySipdRequest(c, {
      verifySession: verifyToken,
      getSessionToken: (ctx) => getCookie(ctx, SESSION_COOKIE),
    })
  } catch (error) {
    console.error('[BFF] Unhandled SIPD route error:', error)
    return c.json({
      message: 'Proxy SIPD gagal di server Arumanis.',
      code: 'SIPD_PROXY_FAILED',
    }, 502)
  }
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
    const timeoutMs = bffUpstreamTimeoutMs(targetPath, c.req.method)
    const response = await fetch(target, {
      ...init,
      ...(timeoutMs != null ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
    })
    return await relayResponse(response)
  } catch (error) {
    console.error('[BFF] Upstream fetch failed:', target.toString(), error)
    return c.json({ message: 'Upstream API tidak tersedia' }, 502)
  }
})

app.get('/sitemap.xml', async (c) => {
  if (!isProd) {
    return c.text('Not Found', 404)
  }

  const xml = await buildSitemapXml()
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  })
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
      const spaHeaders = {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
        pragma: 'no-cache',
      } as const

      const indexHtml = await Bun.file(indexPath).text()
      const normalizedPath = requestPath.replace(/\/+$/, '') || '/'

      if (normalizedPath === '/publikasi') {
        const html = buildPublikasiListHtml(indexHtml)
        return new Response(html, { headers: spaHeaders })
      }

      const publikasiMatch = normalizedPath.match(/^\/publikasi\/([^/]+)$/)
      if (publikasiMatch) {
        const html = await buildPublikasiHtml(publikasiMatch[1], normalizedPath, indexHtml)
        return new Response(html, { headers: spaHeaders })
      }

      if (normalizedPath.startsWith('/puspen')) {
        const html = buildPuspenHtml(normalizedPath, indexHtml)
        return new Response(html, { headers: spaHeaders })
      }

      return new Response(indexHtml, { headers: spaHeaders })
    }
  }

  return c.text('BFF server running. Use Vite dev server for local UI.', 404)
})

const HOST = Bun.env.HOST || '0.0.0.0'
const onlyOfficeWsHandlers = createOnlyOfficeWebSocketHandlers()

Bun.serve({
  hostname: HOST,
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url)

    if (isOnlyOfficeRequest(url.pathname)) {
      const upgrade = req.headers.get('upgrade')
      if (upgrade?.toLowerCase() === 'websocket') {
        const upstreamUrl = buildOnlyOfficeWebSocketUrl(url, ONLYOFFICE_BASE)
        const upgraded = server.upgrade(req, {
          data: {
            upstreamUrl,
            proxyOrigin: getProxyPublicOrigin(req, isProd),
            upstreamBase: ONLYOFFICE_BASE,
          } satisfies OnlyOfficeWsData,
        })

        if (upgraded) {
          return undefined as unknown as Response
        }

        return new Response('ONLYOFFICE WebSocket upgrade failed', { status: 500 })
      }

      return proxyOnlyOfficeHttp(req, ONLYOFFICE_BASE, isProd)
    }

    return app.fetch(req)
  },
  websocket: {
    open(ws) {
      onlyOfficeWsHandlers.open(ws)
    },
    message(ws, message) {
      onlyOfficeWsHandlers.message(ws, message)
    },
    close(ws) {
      onlyOfficeWsHandlers.close(ws)
    },
  },
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
      signal: AbortSignal.timeout(10_000),
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

async function forwardAuthRequest(
  c: Context,
  target: string,
  method: string,
  options?: { treatUnauthorizedAsAnonymous?: boolean },
) {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ user: null })
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
      if (
        options?.treatUnauthorizedAsAnonymous &&
        (response.status === 401 || response.status === 403)
      ) {
        deleteCookie(c, SESSION_COOKIE, sessionCookieOptions())
        deleteCookie(c, IMPERSONATOR_COOKIE, sessionCookieOptions())
        return c.json({ user: null })
      }
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

function userHasRole(user: unknown, roleName: string) {
  return extractUserRoles(user).includes(roleName)
}

function extractUserRoles(user: unknown) {
  if (!user || typeof user !== 'object') return [] as string[]
  const roles = (user as Record<string, unknown>).roles
  if (!Array.isArray(roles)) return [] as string[]

  return roles
    .map((role) => {
      if (typeof role === 'string') return role
      if (role && typeof role === 'object' && typeof (role as Record<string, unknown>).name === 'string') {
        return (role as Record<string, unknown>).name as string
      }
      return null
    })
    .filter((role): role is string => Boolean(role))
}

function relayResponse(response: Response) {
  // Stream binary / attachment / SSE bodies. Buffering via arrayBuffer() OOMs or
  // times out on large backups (e.g. arumanis_*.zip with media) and surfaces as 502.
  if (shouldStreamUpstreamResponse(response) && response.body) {
    // Keep Content-Length only when body is not content-encoded (zip downloads).
    const hasContentEncoding = Boolean(response.headers.get('content-encoding'))
    const headers = filterResponseHeaders(response.headers, {
      keepContentLength: !hasContentEncoding,
    })
    // Discourage reverse proxies (nginx/Coolify) from buffering multi-GB bodies.
    if (!headers.has('X-Accel-Buffering')) {
      headers.set('X-Accel-Buffering', 'no')
    }
    return new Response(response.body, {
      status: response.status,
      headers,
    })
  }

  return response.arrayBuffer().then((body) => new Response(body, {
    status: response.status,
    headers: filterResponseHeaders(response.headers),
  }))
}

function filterResponseHeaders(headers: Headers, options?: { keepContentLength?: boolean }) {
  const next = new Headers()
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase()
    const hopByHop = [
      'content-encoding',
      'transfer-encoding',
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'upgrade',
    ]
    if (!options?.keepContentLength) {
      hopByHop.push('content-length')
    }
    if (hopByHop.includes(lower)) {
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
  if (ext === '.xml') return 'application/xml; charset=utf-8'
  if (ext === '.txt') return 'text/plain; charset=utf-8'
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
    '.xml',
    '.txt',
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

function normalizeUmamiRealtime(payload: unknown) {
  const record = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : {}

  const totals = record.totals && typeof record.totals === 'object'
    ? record.totals as Record<string, unknown>
    : {}

  const urls = record.urls && typeof record.urls === 'object'
    ? record.urls as Record<string, number>
    : {}

  const topPages = Object.entries(urls)
    .map(([path, views]) => ({
      path,
      views: Number(views) || 0,
    }))
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  return {
    visitorCount: Number(totals.visitors) || 0,
    viewCount: Number(totals.views) || 0,
    eventCount: Number(totals.events) || 0,
    topPages,
    timestamp: typeof record.timestamp === 'number' ? record.timestamp : Date.now(),
  }
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

  if (/\.(svg|png|jpe?g|gif|ico|webp|woff2?|ttf|eot)$/i.test(requestPath)) {
    return {
      'cache-control': 'public, max-age=31536000, immutable',
    }
  }

  return {}
}