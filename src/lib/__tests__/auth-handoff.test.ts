import { describe, expect, it } from 'vitest'
import { buildPengawasHandoffUrl } from '../auth-handoff'

describe('buildPengawasHandoffUrl', () => {
    it('builds login url with one-time code', () => {
        expect(buildPengawasHandoffUrl('abc|code')).toBe('/pengawasan/login?code=abc%7Ccode')
    })

    it('preserves deep link target through redirect param', () => {
        expect(buildPengawasHandoffUrl('abc', '/pengawasan/pekerjaan/5')).toBe(
            '/pengawasan/login?code=abc&redirect=%2Fpengawasan%2Fpekerjaan%2F5',
        )
    })

    it('omits redirect param when no target given', () => {
        expect(buildPengawasHandoffUrl('abc')).not.toContain('redirect=')
    })
})
