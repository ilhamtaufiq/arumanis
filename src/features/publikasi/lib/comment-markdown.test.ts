import { describe, expect, it } from 'vitest'
import { isAllowedCommentImageUrl, isAllowedCommentLinkUrl } from './comment-markdown'

describe('comment-markdown', () => {
    it('allows giphy image hosts', () => {
        expect(isAllowedCommentImageUrl('https://media.giphy.com/media/abc/giphy.gif')).toBe(true)
        expect(isAllowedCommentImageUrl('https://i.giphy.com/abc.gif')).toBe(true)
    })

    it('rejects non-giphy or insecure image urls', () => {
        expect(isAllowedCommentImageUrl('http://media.giphy.com/x.gif')).toBe(false)
        expect(isAllowedCommentImageUrl('https://evil.example/x.gif')).toBe(false)
    })

    it('allows http/https links', () => {
        expect(isAllowedCommentLinkUrl('https://example.com')).toBe(true)
        expect(isAllowedCommentLinkUrl('javascript:alert(1)')).toBe(false)
    })
})