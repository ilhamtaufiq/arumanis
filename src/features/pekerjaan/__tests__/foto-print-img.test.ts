import { describe, expect, it } from 'vitest'
import { printImgHtml } from '../lib/foto-print'

describe('printImgHtml', () => {
    it('menyimpan URL penuh sebagai cadangan bila thumbnail gagal dimuat', () => {
        const html = printImgHtml('/storage/a_t.jpg', '/storage/a.jpg', 'Foto 0%')

        expect(html).toContain('src="/storage/a_t.jpg"')
        expect(html).toContain('data-full="/storage/a.jpg"')
        expect(html).toContain('onerror="')
        expect(html).toContain('this.src=this.dataset.full')
    })

    it('membatasi percobaan ulang sekali agar tidak berulang saat URL penuh juga gagal', () => {
        const html = printImgHtml('/storage/a_t.jpg', '/storage/a.jpg', 'Foto 0%')

        expect(html).toContain('this.dataset.retry')
    })

    it('meng-escape nilai atribut', () => {
        const html = printImgHtml('/storage/a"b.jpg', '/storage/a"b.jpg', 'Foto "x"')

        expect(html).not.toContain('a"b.jpg')
        expect(html).toContain('a&quot;b.jpg')
    })
})
