import type {
  InstagramComment,
  InstagramConfigStatus,
  InstagramGalleryResponse,
  InstagramInboxThread,
  InstagramInboxThreadDetail,
  InstagramMediaItem,
  InstagramBusinessProfile,
  InstagramWebhookEventSummary,
} from '../types'

async function bffJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    method: init?.method || 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    body: init?.body,
  })

  const payload = (await response.json().catch(() => null)) as T & {
    message?: string
    error?: string
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object'
        ? payload.error || payload.message
        : null) || `HTTP ${response.status}`
    throw new Error(message)
  }

  return payload
}

export async function getInstagramStatus(): Promise<
  InstagramConfigStatus & {
    mediaCached?: number
    mediaSyncedAt?: string | null
    inboxThreads?: number
    commentsCached?: number
    eventsCached?: number
  }
> {
  return bffJson('/bff/instagram/status')
}

export async function getInstagramGallery(limit = 12): Promise<InstagramGalleryResponse> {
  return bffJson(`/bff/instagram/gallery?limit=${limit}`)
}

export async function probeInstagramIntegration(): Promise<{
  ok: boolean
  status: InstagramConfigStatus
  probe: { ok: boolean; id?: string; name?: string; error?: string }
  mediaSampleCount?: number | null
  store?: {
    mediaCached: number
    mediaSyncedAt: string | null
    inboxThreads: number
    commentsCached: number
    eventsCached?: number
  }
  profile?: {
    id: string
    username?: string
    name?: string
    media_count?: number
    followers_count?: number
  } | null
  error?: string
}> {
  return bffJson('/bff/instagram/probe')
}

export async function syncInstagramMedia(): Promise<{
  ok: boolean
  mediaCount?: number
  mediaSyncedAt?: string | null
  profile?: InstagramBusinessProfile | null
  error?: string
}> {
  return bffJson('/bff/instagram/sync', { method: 'POST' })
}

export async function getInstagramMedia(): Promise<{
  data: InstagramMediaItem[]
  syncedAt: string | null
  profile: InstagramBusinessProfile | null
}> {
  return bffJson('/bff/instagram/media')
}

export async function getInstagramInbox(): Promise<{ data: InstagramInboxThread[] }> {
  return bffJson('/bff/instagram/inbox')
}

export async function getInstagramThread(
  threadId: string,
): Promise<{ data: InstagramInboxThreadDetail }> {
  return bffJson(`/bff/instagram/inbox/${encodeURIComponent(threadId)}`)
}

export async function replyInstagramThread(
  threadId: string,
  body: { text: string; humanAgent?: boolean },
): Promise<{ ok: boolean; message_id?: string; humanAgent?: boolean; error?: string }> {
  return bffJson(`/bff/instagram/inbox/${encodeURIComponent(threadId)}/reply`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getInstagramComments(): Promise<{ data: InstagramComment[] }> {
  return bffJson('/bff/instagram/comments')
}

export async function getInstagramEvents(
  limit = 30,
): Promise<{ data: InstagramWebhookEventSummary[] }> {
  return bffJson(`/bff/instagram/events?limit=${limit}`)
}

export type InstagramTokenPublicStatus = {
  source: 'file' | 'env' | 'none'
  stored: boolean
  envFallback: boolean
  tokenSet: boolean
  masked: string | null
  tokenType: string | null
  pageId: string | null
  pageName: string | null
  igUserId: string | null
  expiresAt: string | null
  updatedAt: string | null
}

export async function getInstagramTokenStatus(): Promise<{
  ok: boolean
  appIdSet: boolean
  appSecretSet: boolean
  token: InstagramTokenPublicStatus
  missing: string[]
}> {
  return bffJson('/bff/instagram/token')
}

export async function exchangeInstagramToken(body: {
  shortLivedToken: string
  pageId?: string
  preferPageToken?: boolean
}): Promise<{
  ok: boolean
  usedPageToken?: boolean
  pages?: Array<{ id: string; name: string; hasIg: boolean }>
  token?: InstagramTokenPublicStatus
  message?: string
  error?: string
}> {
  return bffJson('/bff/instagram/token/exchange', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function refreshInstagramToken(): Promise<{
  ok: boolean
  usedPageToken?: boolean
  pages?: Array<{ id: string; name: string; hasIg: boolean }>
  token?: InstagramTokenPublicStatus
  message?: string
  error?: string
}> {
  return bffJson('/bff/instagram/token/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function clearInstagramToken(): Promise<{
  ok: boolean
  token?: InstagramTokenPublicStatus
  message?: string
  error?: string
}> {
  return bffJson('/bff/instagram/token/clear', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
