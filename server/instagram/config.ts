import type { MetaCapabilityFlags, MetaConfigStatus, MetaInstagramConfig } from './types.ts'

export const META_WEBHOOK_PATH = '/bff/webhooks/meta'
export const DEFAULT_GRAPH_VERSION = 'v22.0'
export const DEFAULT_GRAPH_BASE = 'https://graph.facebook.com'

function env(name: string): string {
  return (Bun.env[name] || '').trim()
}

export function getMetaInstagramConfig(): MetaInstagramConfig {
  const isProd = Bun.env.BUN_ENV === 'production' || Bun.env.NODE_ENV === 'production'
  const enforceRaw = env('META_WEBHOOK_ENFORCE_SIGNATURE')
  const enforceSignature =
    enforceRaw === 'true' || enforceRaw === '1' || (enforceRaw === '' && isProd)

  return {
    appId: env('META_APP_ID'),
    appSecret: env('META_APP_SECRET'),
    verifyToken: env('META_WEBHOOK_VERIFY_TOKEN'),
    accessToken: env('META_ACCESS_TOKEN') || env('INSTAGRAM_ACCESS_TOKEN'),
    igUserId: env('META_IG_USER_ID') || env('INSTAGRAM_BUSINESS_ACCOUNT_ID'),
    graphVersion: env('META_GRAPH_VERSION') || DEFAULT_GRAPH_VERSION,
    graphBaseUrl: (env('META_GRAPH_BASE_URL') || DEFAULT_GRAPH_BASE).replace(/\/$/, ''),
    enforceSignature,
  }
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
  if (!config.verifyToken) missing.push('META_WEBHOOK_VERIFY_TOKEN')
  if (!config.accessToken) missing.push('META_ACCESS_TOKEN (or INSTAGRAM_ACCESS_TOKEN)')
  if (!config.igUserId) missing.push('META_IG_USER_ID (or INSTAGRAM_BUSINESS_ACCOUNT_ID)')

  const capabilities = getMetaCapabilityFlags(config)
  const configured =
    Boolean(config.appId) &&
    Boolean(config.appSecret) &&
    Boolean(config.verifyToken)

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
