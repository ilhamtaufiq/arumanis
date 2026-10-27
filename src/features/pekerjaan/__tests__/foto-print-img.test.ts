import { describe, expect, it } from 'vitest'
import type { Foto } from '@/features/foto/types'
import { collectFotoPrintItems, printImgHtml, type FotoPrintOptions } from '../lib/foto-print'
import type { PenerimaFotoGroup } from '../lib/foto-tab'

const opts: FotoPrintOptions = {
    layout: 'grid2',
    scope: 'filtered',
    includeKoordinat: true,
    onlyValidGps: false,
    useFullQuality: false,
}

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

    it('tidak memakai crossorigin, karena gambar dimuat dari origin yang sama', () => {
        const html = printImgHtml('/storage/a_t.jpg', '/storage/a.jpg', 'Foto 0%')

        expect(html).not.toContain('crossorigin')
    })

    it('meng-escape nilai atribut', () => {
        const html = printImgHtml('/storage/a"b.jpg', '/storage/a"b.jpg', 'Foto "x"')

        expect(html).not.toContain('a"b.jpg')
        expect(html).toContain('a&quot;b.jpg')
    })
})

describe('collectFotoPrintItems', () => {
    it('mengubah URL absolut dari API menjadi path relatif agar lewat origin yang sama', () => {
        const foto = {
            id: 1,
            pekerjaan_id: 1,
            komponen_id: 1,
            keterangan: '0%',
            koordinat: '',
            validasi_koordinat: false,
            foto_url: 'https://apiamis.cianjur.space/storage/1/a.jpg',
            foto_thumb_url: 'https://apiamis.cianjur.space/storage/1/conversions/a-thumb.jpg',
            created_at: '',
            updated_at: '',
        } as Foto
        const group = {
            penerima_id: 1,
            penerima_nama: 'Budi',
            penerima_nik: '3201',
            komponen_id: 1,
            komponen_nama: 'SR',
            fotos: { '0%': [foto], '25%': [], '50%': [], '75%': [], '100%': [] },
        } as unknown as PenerimaFotoGroup

        const [item] = collectFotoPrintItems([group], opts)

        expect(item.url).toBe('/storage/1/a.jpg')
        expect(item.thumbUrl).toBe('/storage/1/conversions/a-thumb.jpg')
    })
})
