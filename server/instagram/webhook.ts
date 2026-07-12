import { createHmac, timingSafeEqual } from 'node:crypto'
import type { MetaInstagramConfig, MetaWebhookPayload, MetaWebhookVerifyQuery } from './types.ts'

export function parseMetaWebhookVerifyQuery(searchParams: URLSearchParams): MetaWebhookVerifyQuery {
  return {
    mode: searchParams.get('hub.mode') ?? undefined,
    token: searchParams.get('hub.verify_token') ?? undefined,
    challenge: searchParams.get('hub.challenge') ?? undefined,
  }
}

/**
 * Handle Meta webhook subscription verification (GET).
 * On success returns the challenge string to echo as plain text.
 */
export function verifyMetaWebhookSubscription(
  query: MetaWebhookVerifyQuery,
  config: Pick<MetaInstagramConfig, 'verifyToken'>,
): { ok: true; challenge: string } | { ok: false; reason: string } {
  if (!config.verifyToken) {
    return { ok: false, reason: 'META_WEBHOOK_VERIFY_TOKEN is not configured' }
  }
  if (query.mode !== 'subscribe') {
    return { ok: false, reason: 'hub.mode must be subscribe' }
  }
  if (!query.token || query.token !== config.verifyToken) {
    return { ok: false, reason: 'hub.verify_token mismatch' }
  }
  if (!query.challenge) {
    return { ok: false, reason: 'hub.challenge is missing' }
  }
  return { ok: true, challenge: query.challenge }
}

/**
 * Validate X-Hub-Signature-256 (sha256=hex) against raw body + App Secret.
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string,
): boolean {
  if (!appSecret) return false
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false

  const received = signatureHeader.slice('sha256='.length).trim()
  if (!/^[a-f0-9]{64}$/i.test(received)) return false

  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')

  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(received, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function parseMetaWebhookPayload(rawBody: string): MetaWebhookPayload | null {
  try {
    const data = JSON.parse(rawBody) as MetaWebhookPayload
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

export interface NormalizedMetaWebhookEvent {
  object: string
  entryId?: string
  time?: number
  fields: string[]
  messagingCount: number
  raw: MetaWebhookEntryLike
}

type MetaWebhookEntryLike = NonNullable<MetaWebhookPayload['entry']>[number]

/**
 * Flatten webhook entries for logging / downstream queue.
 * Does not call Graph API — caller decides how to hydrate media/profile.
 */
export function normalizeMetaWebhookEvents(payload: MetaWebhookPayload): NormalizedMetaWebhookEvent[] {
  const object = payload.object || 'unknown'
  const entries = Array.isArray(payload.entry) ? payload.entry : []

  return entries.map((entry) => {
    const fields = (entry.changes || [])
      .map((c) => c.field)
      .filter((f): f is string => typeof f === 'string' && f.length > 0)

    return {
      object,
      entryId: entry.id,
      time: entry.time,
      fields,
      messagingCount: Array.isArray(entry.messaging) ? entry.messaging.length : 0,
      raw: entry,
    }
  })
}

export function summarizeMetaWebhook(payload: MetaWebhookPayload): string {
  const events = normalizeMetaWebhookEvents(payload)
  if (events.length === 0) return `object=${payload.object || 'unknown'} entries=0`
  const fields = [...new Set(events.flatMap((e) => e.fields))]
  const msg = events.reduce((n, e) => n + e.messagingCount, 0)
  return `object=${payload.object || 'unknown'} entries=${events.length} fields=[${fields.join(',')}] messaging=${msg}`
}
