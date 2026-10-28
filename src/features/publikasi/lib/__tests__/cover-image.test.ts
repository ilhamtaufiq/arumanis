import { describe, expect, it } from 'vitest'
import { DEFAULT_COVER_IMAGE, getCoverImage } from '../format'

describe('getCoverImage', () => {
    it('memakai cover post bila ada', () => {
        expect(getCoverImage('/storage/cover.jpg', 'judul-post')).toBe('/storage/cover.jpg')
    })

    it('membuat gambar dari judul di server bila post tanpa cover', () => {
        expect(getCoverImage(null, 'judul-post')).toBe('/og/publikasi/judul-post.jpg')
    })

    it('meng-encode slug agar aman di URL', () => {
        expect(getCoverImage('', 'judul post/ke-2')).toBe('/og/publikasi/judul%20post%2Fke-2.jpg')
    })

    it('kembali ke gambar default bila tanpa cover dan tanpa slug', () => {
        expect(getCoverImage(undefined)).toBe(DEFAULT_COVER_IMAGE)
    })
})
