/**
 * Client-side types for Instagram feature (gallery, inbox, profile).
 * Server Graph client lives in server/instagram/.
 */

export interface InstagramConfigStatus {
  configured: boolean
  appIdSet: boolean
  appSecretSet: boolean
  verifyTokenSet: boolean
  accessTokenSet: boolean
  igUserIdSet: boolean
  graphVersion: string
  webhookPath: string
  capabilities: {
    media: boolean
    businessProfile: boolean
    messagingHumanAgent: boolean
    webhooks: boolean
  }
  missing: string[]
  mediaCached?: number
  mediaSyncedAt?: string | null
  inboxThreads?: number
  commentsCached?: number
  eventsCached?: number
}

export interface InstagramMediaItem {
  id: string
  caption?: string
  media_type?: string
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
  media_count?: number
}

export interface InstagramGalleryResponse {
  data: InstagramMediaItem[]
  profile: Pick<
    InstagramBusinessProfile,
    'id' | 'username' | 'name' | 'profile_picture_url' | 'media_count'
  > | null
  syncedAt: string | null
  configured: boolean
}

export interface InstagramInboxThread {
  id: string
  participantId: string
  lastMessageAt: number
  lastText: string
  unread: number
  messageCount: number
}

export interface InstagramMessage {
  id: string
  threadId: string
  direction: 'inbound' | 'outbound'
  senderId: string
  recipientId: string
  text: string
  timestamp: number
  mid?: string
  humanAgent?: boolean
}

export interface InstagramInboxThreadDetail extends InstagramInboxThread {
  messages: InstagramMessage[]
}

export interface InstagramComment {
  id: string
  mediaId?: string
  text: string
  username?: string
  fromId?: string
  timestamp: number
  parentId?: string
}

export interface InstagramWebhookEventSummary {
  id: string
  receivedAt: string
  object: string
  summary: string
}

/** Meta permissions planned for Arumanis Instagram integration */
export type InstagramPermissionKey =
  | 'instagram_business_basic'
  | 'instagram_business_manage_messages'
  | 'instagram_business_manage_comments'
  | 'instagram_business_content_publish'
  | 'pages_show_list'
  | 'pages_read_engagement'
  | 'pages_manage_metadata'
  | 'business_management'
  | 'human_agent'

export const INSTAGRAM_PERMISSION_CATALOG: {
  key: InstagramPermissionKey
  label: string
  purpose: string
}[] = [
  {
    key: 'instagram_business_basic',
    label: 'Business basic / profile & media read',
    purpose: 'Business Asset User Profile Access + media gallery',
  },
  {
    key: 'instagram_business_manage_messages',
    label: 'Manage messages',
    purpose: 'Inbox DM + human agent replies',
  },
  {
    key: 'instagram_business_manage_comments',
    label: 'Manage comments',
    purpose: 'Comment webhooks and moderation',
  },
  {
    key: 'instagram_business_content_publish',
    label: 'Content publish',
    purpose: 'Optional publish from Arumanis (phase 2)',
  },
  {
    key: 'pages_show_list',
    label: 'Pages show list',
    purpose: 'Facebook Login path: list linked pages',
  },
  {
    key: 'pages_read_engagement',
    label: 'Pages read engagement',
    purpose: 'Page ↔ IG linkage metadata',
  },
  {
    key: 'pages_manage_metadata',
    label: 'Pages manage metadata',
    purpose: 'Page webhook subscriptions',
  },
  {
    key: 'business_management',
    label: 'Business management',
    purpose: 'Business Manager assets',
  },
  {
    key: 'human_agent',
    label: 'Human Agent',
    purpose: 'MESSAGE_TAG HUMAN_AGENT outside standard messaging window',
  },
]
