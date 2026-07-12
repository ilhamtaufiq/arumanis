import {
  appendWebhookEvent,
  saveMediaAndProfile,
  upsertComment,
  upsertInboundMessage,
} from './store.ts'
import { fetchInstagramBusinessProfile, fetchInstagramMedia } from './client.ts'
import { getMetaInstagramConfig } from './config.ts'
import { normalizeMetaWebhookEvents, summarizeMetaWebhook } from './webhook.ts'
import type { MetaWebhookPayload } from './types.ts'

/**
 * Sync media + business profile from Graph into local cache.
 */
export async function syncInstagramMediaAndProfile(options?: { limit?: number }) {
  const media = await fetchInstagramMedia({ limit: options?.limit ?? 24 })
  let profile = null
  try {
    profile = await fetchInstagramBusinessProfile()
  } catch {
    profile = null
  }
  const store = await saveMediaAndProfile(media, profile)
  return {
    mediaCount: store.media.length,
    mediaSyncedAt: store.mediaSyncedAt,
    profile: store.profile,
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function num(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  return undefined
}

/**
 * Persist webhook payload side-effects (inbox + comments + event log).
 * Safe to call without awaiting from HTTP handler after ACK — but we await
 * in-handler for reliability on single-instance BFF.
 */
export async function processMetaWebhookPayload(payload: MetaWebhookPayload): Promise<{
  summary: string
  messagesIngested: number
  commentsIngested: number
}> {
  const summary = summarizeMetaWebhook(payload)
  await appendWebhookEvent({
    object: payload.object || 'unknown',
    summary,
    payload,
  })

  let messagesIngested = 0
  let commentsIngested = 0
  const config = getMetaInstagramConfig()
  const events = normalizeMetaWebhookEvents(payload)

  for (const event of events) {
    const messaging = event.raw.messaging || []
    for (const item of messaging) {
      const senderId = str(item.sender?.id)
      const recipientId = str(item.recipient?.id)
      const text = str(item.message?.text)
      const mid = str(item.message?.mid)
      const timestamp = num(item.timestamp) || Date.now()
      if (!senderId || !text) continue

      // Outbound echoes from our own IG account — still store as outbound if sender is us
      const isFromPage = Boolean(config.igUserId && senderId === config.igUserId)
      if (isFromPage) continue

      await upsertInboundMessage({
        participantId: senderId,
        senderId,
        recipientId: recipientId || config.igUserId || 'self',
        text,
        timestamp,
        mid,
        raw: item,
      })
      messagesIngested += 1
    }

    for (const change of event.raw.changes || []) {
      const field = change.field
      const value = asRecord(change.value)
      if (!value) continue

      if (field === 'comments' || field === 'live_comments') {
        const id =
          str(value.id) ||
          str(value.comment_id) ||
          `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const text = str(value.text) || str(value.message) || ''
        const from = asRecord(value.from)
        await upsertComment({
          id,
          mediaId: str(value.media_id) || str(asRecord(value.media)?.id),
          text,
          username: str(from?.username) || str(value.username),
          fromId: str(from?.id) || str(value.from_id),
          timestamp: num(value.timestamp) ? Number(value.timestamp) * (String(value.timestamp).length < 12 ? 1000 : 1) : Date.now(),
          parentId: str(value.parent_id),
          raw: value,
        })
        commentsIngested += 1
      }

      // Some payloads nest message under changes for Instagram messaging
      if (field === 'messages' || field === 'message') {
        const senderId = str(asRecord(value.sender)?.id) || str(value.sender_id)
        const text = str(asRecord(value.message)?.text) || str(value.text)
        const mid = str(asRecord(value.message)?.mid) || str(value.mid)
        if (senderId && text) {
          await upsertInboundMessage({
            participantId: senderId,
            senderId,
            recipientId: config.igUserId || 'self',
            text,
            timestamp: num(value.timestamp) || Date.now(),
            mid,
            raw: value,
          })
          messagesIngested += 1
        }
      }
    }
  }

  return { summary, messagesIngested, commentsIngested }
}
