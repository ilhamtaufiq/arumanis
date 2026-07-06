import { describe, expect, it } from 'vitest'
import { buildSipdTarget, mapBffSipdPath } from './sipd-proxy.ts'

describe('sipd-proxy', () => {
  it('maps BFF paths to SIPD upstream endpoints', () => {
    expect(mapBffSipdPath('/bff/sipd/renja')).toBe('/api/cache/renja')
    expect(mapBffSipdPath('/bff/sipd/rincian/316870')).toBe('/api/cache/rincian/316870')
    expect(mapBffSipdPath('/bff/sipd/status')).toBe('/api/status')
    expect(mapBffSipdPath('/bff/sipd/health')).toBe('/health')
    expect(mapBffSipdPath('/bff/sipd/unknown')).toBeNull()
  })

  it('builds upstream URL with query string', () => {
    const target = buildSipdTarget('/api/cache/renja', 'tahun=2026', {
      baseUrl: 'http://127.0.0.1:8000',
      serviceToken: '',
    })
    expect(target.toString()).toBe('http://127.0.0.1:8000/api/cache/renja?tahun=2026')
  })
})