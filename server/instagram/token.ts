import { getMetaInstagramConfig, graphUrl } from './config.ts'
import {
  loadMetaCredentials,
  saveMetaCredentials,
  type MetaStoredCredentials,
} from './credentials.ts'

export type PageWithIg = {
  id: string
  name: string
  access_token: string
  instagram_business_account?: { id: string } | null
}

/**
 * Exchange short-lived (or refreshable) user token → long-lived user token.
 * https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 */
export async function exchangeForLongLivedUserToken(shortLivedToken: string): Promise<{
  accessToken: string
  expiresIn: number | null
  expiresAt: string | null
}> {
  const config = getMetaInstagramConfig()
  if (!config.appId || !config.appSecret) {
    throw new Error('META_APP_ID dan META_APP_SECRET wajib diisi di env')
  }

  const url = new URL(graphUrl('/oauth/access_token', config))
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', config.appId)
  url.searchParams.set('client_secret', config.appSecret)
  url.searchParams.set('fb_exchange_token', shortLivedToken.trim())

  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  const payload = (await response.json().catch(() => null)) as {
    access_token?: string
    expires_in?: number
    error?: { message?: string }
  } | null

  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error?.message || `Gagal exchange token (HTTP ${response.status})`)
  }

  const expiresIn =
    typeof payload.expires_in === 'number' && Number.isFinite(payload.expires_in)
      ? payload.expires_in
      : null
  const expiresAt =
    expiresIn != null ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

  return {
    accessToken: payload.access_token,
    expiresIn,
    expiresAt,
  }
}

export async function fetchPagesWithTokens(userAccessToken: string): Promise<PageWithIg[]> {
  const config = getMetaInstagramConfig()
  const url = new URL(graphUrl('/me/accounts', config))
  url.searchParams.set(
    'fields',
    'id,name,access_token,instagram_business_account{id}',
  )
  url.searchParams.set('access_token', userAccessToken)
  url.searchParams.set('limit', '50')

  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  const payload = (await response.json().catch(() => null)) as {
    data?: PageWithIg[]
    error?: { message?: string }
  } | null

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gagal mengambil pages (HTTP ${response.status})`)
  }

  return Array.isArray(payload?.data) ? payload!.data! : []
}

/**
 * Full flow for admin UI:
 * 1) short → long-lived user token
 * 2) prefer Page token with Instagram business account
 * 3) persist to data/instagram/credentials.json
 */
export async function activateMetaAccessToken(options: {
  shortLivedToken: string
  pageId?: string | null
  preferPageToken?: boolean
}): Promise<{
  credentials: MetaStoredCredentials
  pages: Array<{ id: string; name: string; hasIg: boolean }>
  usedPageToken: boolean
}> {
  const longLived = await exchangeForLongLivedUserToken(options.shortLivedToken)
  const preferPage = options.preferPageToken !== false

  let accessToken = longLived.accessToken
  let tokenType: MetaStoredCredentials['tokenType'] = 'user'
  let pageId: string | null = null
  let pageName: string | null = null
  let igUserId: string | null = null
  let expiresAt = longLived.expiresAt
  let usedPageToken = false

  const config = getMetaInstagramConfig()
  const envIg = config.igUserId || null

  let pages: PageWithIg[] = []
  try {
    pages = await fetchPagesWithTokens(longLived.accessToken)
  } catch {
    pages = []
  }

  if (preferPage && pages.length > 0) {
    const preferred =
      (options.pageId
        ? pages.find((p) => p.id === options.pageId)
        : null) ||
      pages.find((p) => p.instagram_business_account?.id === envIg) ||
      pages.find((p) => p.instagram_business_account?.id) ||
      pages[0]

    if (preferred?.access_token) {
      accessToken = preferred.access_token
      tokenType = 'page'
      pageId = preferred.id
      pageName = preferred.name
      igUserId = preferred.instagram_business_account?.id || envIg
      // Page tokens from long-lived users often do not expire
      expiresAt = null
      usedPageToken = true
    }
  }

  if (!igUserId) {
    igUserId = envIg
  }

  const credentials = await saveMetaCredentials({
    accessToken,
    igUserId,
    pageId,
    pageName,
    tokenType,
    expiresAt,
    note: usedPageToken
      ? 'Page access token (disarankan production)'
      : 'Long-lived user token',
  })

  return {
    credentials,
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name,
      hasIg: Boolean(p.instagram_business_account?.id),
    })),
    usedPageToken,
  }
}

/** Refresh before expiry: re-exchange current stored/env token */
export async function refreshStoredMetaToken(): Promise<{
  credentials: MetaStoredCredentials
  usedPageToken: boolean
  pages: Array<{ id: string; name: string; hasIg: boolean }>
}> {
  await loadMetaCredentials()
  const config = getMetaInstagramConfig()
  if (!config.accessToken) {
    throw new Error('Tidak ada token tersimpan atau di env untuk di-refresh')
  }
  return activateMetaAccessToken({
    shortLivedToken: config.accessToken,
    preferPageToken: true,
  })
}
