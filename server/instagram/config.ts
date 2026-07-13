import { getCachedMetaCredentials, loadMetaCredentials } from './credentials.ts'
import type { MetaCapabilityFlags, MetaConfigStatus, MetaInstagramConfig } from './types.ts'

export const META_WEBHOOK_PATH = '/bff/webhooks/meta'
export const DEFAULT_GRAPH_VERSION = 'v22.0'
export const DEFAULT_GRAPH_BASE = 'https://graph.facebook.com'

function env(name: string): string {
  return (Bun.env[name] || '').trim()
}

/** Prefer token/IG id from admin UI file store; fall back to Coolify env. */
export function getMetaInstagramConfig(): MetaInstagramConfig {
  const isProd = Bun.env.BUN_ENV === 'production' || Bun.env.NODE_ENV === 'production'
  const enforceRaw = env('META_WEBHOOK_ENFORCE_SIGNATURE')
  const enforceSignature =
    enforceRaw === 'true' || enforceRaw === '1' || (enforceRaw === '' && isProd)

  const stored = getCachedMetaCredentials()
  const envToken = env('META_ACCESS_TOKEN') || env('INSTAGRAM_ACCESS_TOKEN')
  const envIg = env('META_IG_USER_ID') || env('INSTAGRAM_BUSINESS_ACCOUNT_ID')

  return {
    appId: env('META_APP_ID'),
    appSecret: env('META_APP_SECRET'),
    verifyToken: env('META_WEBHOOK_VERIFY_TOKEN'),
    accessToken: stored?.accessToken || envToken,
    igUserId: stored?.igUserId || envIg,
    graphVersion: env('META_GRAPH_VERSION') || DEFAULT_GRAPH_VERSION,
    graphBaseUrl: (env('META_GRAPH_BASE_URL') || DEFAULT_GRAPH_BASE).replace(/\/$/, ''),
    enforceSignature,
  }
}

/** Load credentials.json into memory (call at boot and after save). */
export async function refreshMetaConfigFromDisk(): Promise<void> {
  await loadMetaCredentials()
}

export function graphUrl(path: string, config: MetaInstagramConfig = getMetaInstagramConfig()): string {
  const cleaned = path.startsWith('/') ? path : `/${path}`
  return `${config.graphBaseUrl}/${config.graphVersion}${cleaned}`
}

export function getMetaCapabilityFlags(config: MetaInstagramConfig = getMetaInstagramConfig()): MetaCapabilityFlags {
  const hasToken = Boolean(config.accessToken)
  const hasIg = Boolean(config.igUserId)
  const hasApp = Boolean(config.appId && config.appSecret)
  const hasVerify = Boolean(config.verifyToken)

  return {
    media: hasToken && hasIg,
    businessProfile: hasToken && hasIg,
    messagingHumanAgent: hasToken && hasIg && hasApp,
    webhooks: hasApp && hasVerify,
  }
}

export function getMetaConfigStatus(
  config: MetaInstagramConfig = getMetaInstagramConfig(),
): MetaConfigStatus {
  const missing: string[] = []
  if (!config.appId) missing.push('META_APP_ID')
  if (!config.appSecret) missing.push('META_APP_SECRET')
  // Verify token only required for webhooks, not gallery
  if (!config.accessToken) {
    missing.push('Token akses (UI Instagram → Token, atau META_ACCESS_TOKEN env)')
  }
  if (!config.igUserId) missing.push('META_IG_USER_ID (atau pilih Page ber-IG di UI Token)')

  const capabilities = getMetaCapabilityFlags(config)
  const configured = Boolean(config.appId) && Boolean(config.appSecret) && Boolean(config.accessToken)

  return {
    configured,
    appIdSet: Boolean(config.appId),
    appSecretSet: Boolean(config.appSecret),
    verifyTokenSet: Boolean(config.verifyToken),
    accessTokenSet: Boolean(config.accessToken),
    igUserIdSet: Boolean(config.igUserId),
    graphVersion: config.graphVersion,
    webhookPath: META_WEBHOOK_PATH,
    capabilities,
    missing,
  }
}
