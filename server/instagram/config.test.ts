import { describe, expect, it } from 'vitest'
import { DEFAULT_GRAPH_VERSION, getMetaCapabilityFlags, graphUrl } from './config.ts'
import type { MetaInstagramConfig } from './types.ts'

function baseConfig(overrides: Partial<MetaInstagramConfig> = {}): MetaInstagramConfig {
  return {
    appId: 'app',
    appSecret: 'secret',
    verifyToken: 'verify',
    accessToken: 'token',
    igUserId: '178414',
    graphVersion: DEFAULT_GRAPH_VERSION,
    graphBaseUrl: 'https://graph.facebook.com',
    enforceSignature: true,
    ...overrides,
  }
}

describe('meta instagram config helpers', () => {
  it('builds graph URL with version', () => {
    const url = graphUrl('/me/media', baseConfig({ graphVersion: 'v22.0' }))
    expect(url).toBe('https://graph.facebook.com/v22.0/me/media')
  })

  it('flags capabilities from filled config', () => {
    const caps = getMetaCapabilityFlags(baseConfig())
    expect(caps.media).toBe(true)
    expect(caps.businessProfile).toBe(true)
    expect(caps.messagingHumanAgent).toBe(true)
    expect(caps.webhooks).toBe(true)
  })

  it('disables media without ig user id', () => {
    const caps = getMetaCapabilityFlags(baseConfig({ igUserId: '' }))
    expect(caps.media).toBe(false)
    expect(caps.webhooks).toBe(true)
  })
})
