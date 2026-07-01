import { describe, expect, it } from 'vitest'
import {
  buildOnlyOfficeHttpUrl,
  buildOnlyOfficeWebSocketUrl,
  getProxyPublicOrigin,
  isOnlyOfficeRequest,
  rewriteOnlyOfficeUrls,
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

  it('rewrites upstream http cache urls to same-origin https office proxy', () => {
    const payload =
      '{"url":"http://office.cianjur.space/cache/files/data/media_7648/Editor.bin/Editor.bin?md5=abc"}'

    expect(
      rewriteOnlyOfficeUrls(
        payload,
        'https://arumanis.cianjur.space',
        'https://office.cianjur.space',
      ),
    ).toBe(
      '{"url":"https://arumanis.cianjur.space/office/cache/files/data/media_7648/Editor.bin/Editor.bin?md5=abc"}',
    )
  })

  it('derives public origin from forwarded headers', () => {
    const req = new Request('http://127.0.0.1/office/healthcheck', {
      headers: {
        host: 'arumanis.cianjur.space',
        'x-forwarded-proto': 'https',
      },
    })

    expect(getProxyPublicOrigin(req, false)).toBe('https://arumanis.cianjur.space')
    expect(getProxyPublicOrigin(req, true)).toBe('https://arumanis.cianjur.space')
  })
})