/**
 * Instagram / Meta Graph types used by BFF integration.
 * Scope targets: media, profile, messaging, human_agent, webhooks.
 */

export type InstagramAccountType = 'business' | 'creator' | 'unknown'

export interface MetaInstagramConfig {
  appId: string
  appSecret: string
  verifyToken: string
  /** Long-lived page or user token for server-side Graph calls */
  accessToken: string
  /** Instagram Business / Creator account ID (IGSID or IG user id) */
  igUserId: string
  graphVersion: string
  graphBaseUrl: string
  /** When true, invalid signatures are rejected (production default) */
  enforceSignature: boolean
}

export interface MetaConfigStatus {
  configured: boolean
  appIdSet: boolean
  appSecretSet: boolean
  verifyTokenSet: boolean
  accessTokenSet: boolean
  igUserIdSet: boolean
  graphVersion: string
  webhookPath: string
  capabilities: MetaCapabilityFlags
  missing: string[]
}

export interface MetaCapabilityFlags {
  /** Read own media / gallery */
  media: boolean
  /** Business asset user profile access (profile fields) */
  businessProfile: boolean
  /** Messaging + human_agent tag for out-of-window replies */
  messagingHumanAgent: boolean
  /** Receive Meta webhooks */
  webhooks: boolean
}

/** Meta webhook verification query (GET) */
export interface MetaWebhookVerifyQuery {
  mode: string | undefined
  token: string | undefined
  challenge: string | undefined
}

/** Minimal Meta webhook envelope */
export interface MetaWebhookPayload {
  object?: string
  entry?: MetaWebhookEntry[]
}

export interface MetaWebhookEntry {
  id?: string
  time?: number
  uid?: string
  changes?: MetaWebhookChange[]
  messaging?: MetaWebhookMessagingEvent[]
}

export interface MetaWebhookChange {
  field?: string
  value?: Record<string, unknown>
}

export interface MetaWebhookMessagingEvent {
  sender?: { id?: string }
  recipient?: { id?: string }
  timestamp?: number
  message?: {
    mid?: string
    text?: string
    attachments?: unknown[]
  }
  postback?: {
    title?: string
    payload?: string
  }
}

export type MetaWebhookField =
  | 'comments'
  | 'live_comments'
  | 'mentions'
  | 'message_reactions'
  | 'messages'
  | 'messaging_handover'
  | 'messaging_optins'
  | 'messaging_postbacks'
  | 'messaging_referral'
  | 'messaging_seen'
  | 'story_insights'

export interface InstagramMediaItem {
  id: string
  caption?: string
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp?: string
  username?: string
}

export interface InstagramBusinessProfile {
  id: string
  username?: string
  name?: string
  biography?: string
  website?: string
  profile_picture_url?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
  account_type?: InstagramAccountType
}

export type HumanAgentMessageTag = 'HUMAN_AGENT'

export interface SendInstagramMessageInput {
  /** Instagram-scoped user id (IGSID) of the recipient */
  recipientId: string
  text: string
  /**
   * Use HUMAN_AGENT when replying outside the standard messaging window
   * (requires human_agent permission / feature).
   */
  tag?: HumanAgentMessageTag
}

export interface GraphApiErrorBody {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}
