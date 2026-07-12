import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  normalizeMetaWebhookEvents,
  parseMetaWebhookPayload,
  parseMetaWebhookVerifyQuery,
  summarizeMetaWebhook,
  verifyMetaWebhookSignature,
  verifyMetaWebhookSubscription,
} from './webhook.ts'

describe('meta webhook verification', () => {
  it('parses hub.* query params', () => {
    const params = new URLSearchParams(
      'hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=secret-token',
    )
    expect(parseMetaWebhookVerifyQuery(params)).toEqual({
      mode: 'subscribe',
      token: 'secret-token',
      challenge: '1158201444',
    })
  })

  it('accepts matching verify token and returns challenge', () => {
    const result = verifyMetaWebhookSubscription(
      { mode: 'subscribe', token: 'abc', challenge: '99' },
      { verifyToken: 'abc' },
    )
    expect(result).toEqual({ ok: true, challenge: '99' })
  })

  it('rejects wrong verify token', () => {
    const result = verifyMetaWebhookSubscription(
      { mode: 'subscribe', token: 'wrong', challenge: '99' },
      { verifyToken: 'abc' },
    )
    expect(result.ok).toBe(false)
  })

  it('rejects when verify token env missing', () => {
    const result = verifyMetaWebhookSubscription(
      { mode: 'subscribe', token: 'abc', challenge: '99' },
      { verifyToken: '' },
    )
    expect(result.ok).toBe(false)
  })
})

describe('meta webhook signature', () => {
  const secret = 'app-secret-test'
  const body = JSON.stringify({ object: 'instagram', entry: [] })

  it('validates sha256 signature', () => {
    const digest = createHmac('sha256', secret).update(body, 'utf8').digest('hex')
    expect(verifyMetaWebhookSignature(body, `sha256=${digest}`, secret)).toBe(true)
  })

  it('rejects tampered body', () => {
    const digest = createHmac('sha256', secret).update(body, 'utf8').digest('hex')
    expect(verifyMetaWebhookSignature(body + 'x', `sha256=${digest}`, secret)).toBe(false)
  })

  it('rejects missing header', () => {
    expect(verifyMetaWebhookSignature(body, null, secret)).toBe(false)
  })
})

describe('meta webhook payload helpers', () => {
  it('parses and normalizes messaging + change fields', () => {
    const raw = JSON.stringify({
      object: 'instagram',
      entry: [
        {
          id: '17841400000000000',
          time: 1710000000,
          changes: [{ field: 'comments', value: { id: '1' } }],
          messaging: [{ sender: { id: 'user1' }, message: { text: 'halo' } }],
        },
      ],
    })

    const payload = parseMetaWebhookPayload(raw)
    expect(payload?.object).toBe('instagram')

    const events = normalizeMetaWebhookEvents(payload!)
    expect(events).toHaveLength(1)
    expect(events[0].fields).toEqual(['comments'])
    expect(events[0].messagingCount).toBe(1)

    expect(summarizeMetaWebhook(payload!)).toContain('fields=[comments]')
    expect(summarizeMetaWebhook(payload!)).toContain('messaging=1')
  })

  it('returns null for invalid JSON', () => {
    expect(parseMetaWebhookPayload('{nope')).toBeNull()
  })
})
