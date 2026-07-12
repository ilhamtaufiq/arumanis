import { getMetaInstagramConfig, graphUrl } from './config.ts'
import type {
  GraphApiErrorBody,
  InstagramBusinessProfile,
  InstagramMediaItem,
  MetaInstagramConfig,
  SendInstagramMessageInput,
} from './types.ts'

export class MetaGraphError extends Error {
  readonly status: number
  readonly code?: number
  readonly type?: string
  readonly fbtraceId?: string
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'MetaGraphError'
    this.status = status
    this.body = body
    const err = (body as GraphApiErrorBody)?.error
    this.code = err?.code
    this.type = err?.type
    this.fbtraceId = err?.fbtrace_id
  }
}

async function graphFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE'
    query?: Record<string, string | undefined>
    body?: Record<string, unknown>
    config?: MetaInstagramConfig
  } = {},
): Promise<T> {
  const config = options.config ?? getMetaInstagramConfig()
  if (!config.accessToken) {
    throw new MetaGraphError('META_ACCESS_TOKEN is not configured', 500, null)
  }

  const url = new URL(graphUrl(path, config))
  url.searchParams.set('access_token', config.accessToken)
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value != null && value !== '') url.searchParams.set(key, value)
  }

  const init: RequestInit = {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
  }

  if (options.body) {
    init.headers = {
      ...init.headers,
      'Content-Type': 'application/json',
    }
    init.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, init)
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (payload as GraphApiErrorBody)?.error?.message ||
      `Meta Graph HTTP ${response.status}`
    throw new MetaGraphError(message, response.status, payload)
  }

  return payload as T
}

const MEDIA_FIELDS =
  'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username'

const PROFILE_FIELDS =
  'id,username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count'

/**
 * List recent media for the configured Instagram professional account.
 * Requires: instagram_basic / instagram_business_basic (or equivalent media read).
 */
export async function fetchInstagramMedia(
  options: { limit?: number; config?: MetaInstagramConfig } = {},
): Promise<InstagramMediaItem[]> {
  const config = options.config ?? getMetaInstagramConfig()
  if (!config.igUserId) {
    throw new MetaGraphError('META_IG_USER_ID is not configured', 500, null)
  }

  const limit = Math.min(Math.max(options.limit ?? 12, 1), 50)
  const data = await graphFetch<{ data?: InstagramMediaItem[] }>(
    `/${config.igUserId}/media`,
    {
      query: { fields: MEDIA_FIELDS, limit: String(limit) },
      config,
    },
  )

  return Array.isArray(data.data) ? data.data : []
}

/**
 * Business Asset / professional profile fields.
 * Requires Business Asset User Profile Access related permissions
 * (e.g. instagram_business_basic / pages_read_engagement depending on login path).
 */
export async function fetchInstagramBusinessProfile(
  options: { config?: MetaInstagramConfig } = {},
): Promise<InstagramBusinessProfile> {
  const config = options.config ?? getMetaInstagramConfig()
  if (!config.igUserId) {
    throw new MetaGraphError('META_IG_USER_ID is not configured', 500, null)
  }

  return graphFetch<InstagramBusinessProfile>(`/${config.igUserId}`, {
    query: { fields: PROFILE_FIELDS },
    config,
  })
}

/**
 * Send a text message to an Instagram user (IGSID).
 * Pass tag: 'HUMAN_AGENT' for human-agent window (requires human_agent permission).
 */
export async function sendInstagramTextMessage(
  input: SendInstagramMessageInput,
  options: { config?: MetaInstagramConfig } = {},
): Promise<{ message_id?: string; recipient_id?: string }> {
  const config = options.config ?? getMetaInstagramConfig()
  if (!config.igUserId) {
    throw new MetaGraphError('META_IG_USER_ID is not configured', 500, null)
  }

  const body: Record<string, unknown> = {
    recipient: { id: input.recipientId },
    message: { text: input.text },
  }

  if (input.tag === 'HUMAN_AGENT') {
    body.tag = 'HUMAN_AGENT'
    body.messaging_type = 'MESSAGE_TAG'
  }

  return graphFetch(`/${config.igUserId}/messages`, {
    method: 'POST',
    body,
    config,
  })
}

/**
 * Lightweight token probe — GET /me or IG user id.
 */
export async function probeMetaToken(
  options: { config?: MetaInstagramConfig } = {},
): Promise<{ ok: true; id?: string; name?: string } | { ok: false; error: string }> {
  try {
    const config = options.config ?? getMetaInstagramConfig()
    if (config.igUserId) {
      const profile = await fetchInstagramBusinessProfile({ config })
      return { ok: true, id: profile.id, name: profile.username || profile.name }
    }
    const me = await graphFetch<{ id?: string; name?: string }>('/me', {
      query: { fields: 'id,name' },
      config,
    })
    return { ok: true, id: me.id, name: me.name }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}
