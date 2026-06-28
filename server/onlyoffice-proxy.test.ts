import { describe, expect, it } from 'vitest'
import {
  buildOnlyOfficeHttpUrl,
  buildOnlyOfficeWebSocketUrl,
  isOnlyOfficeRequest,
} from './onlyoffice-proxy.ts'

describe('onlyoffice-proxy', () => {
  it('detects office proxy paths', () => {
    expect(isOnlyOfficeRequest('/office')).toBe(true)
    expect(isOnlyOfficeRequest('/office/healthcheck')).toBe(true)
    expect(isOnlyOfficeRequest('/bff/api/onlyoffice/media/1/config')).toBe(false)
  })

  it('maps office paths to the upstream document server', () => {
    const requestUrl = new URL('https://arumanis.example.test/office/doc/media_1/c/?EIO=4&transport=websocket')
    const baseUrl = 'https://office.example.test'

    expect(buildOnlyOfficeHttpUrl(requestUrl, baseUrl).toString()).toBe(
      'https://office.example.test/doc/media_1/c/?EIO=4&transport=websocket',
    )
    expect(buildOnlyOfficeWebSocketUrl(requestUrl, baseUrl)).toBe(
      'wss://office.example.test/doc/media_1/c/?EIO=4&transport=websocket',
    )
  })
})