import { describe, expect, it } from 'vitest'
import type { Foto } from '@/features/foto/types'
import { buildFotoPrintHtml, type FotoPrintMeta, type FotoPrintOptions } from '../lib/foto-print'
import type { PenerimaFotoGroup } from '../lib/foto-tab'

const meta: FotoPrintMeta = {
    paketName: 'Paket Uji',
    lokasi: 'Desa Uji, Kec Uji',
    tahun: '2026',
    komponenLabel: 'Pipa',
    printedAt: '27 Oktober 2026',
    totalLabel: '3 foto',
    watermark: 'Arumanis · Kabupaten Cianjur',
}

const opts: FotoPrintOptions = {
    layout: 'grid2',
    scope: 'filtered',
    includeKoordinat: true,
    onlyValidGps: false,
    useFullQuality: false,
}

function foto(id: number): Foto {
    return {
        id,
        pekerjaan_id: 1,
        komponen_id: 1,
        keterangan: '0%',
        koordinat: '',
        validasi_koordinat: false,
        foto_url: `/storage/${id}.jpg`,
        foto_thumb_url: `/storage/${id}_t.jpg`,
        created_at: '',
        updated_at: '',
    } as Foto
}

// grid2 memuat 2 foto per halaman, jadi 3 foto menghasilkan 2 halaman.
const groups = [
    {
        penerima_id: 1,
        penerima_nama: 'Budi',
        penerima_nik: '3201',
        komponen_id: 1,
        komponen_nama: 'Pipa',
        fotos: { '0%': [foto(1), foto(2), foto(3)], '25%': [], '50%': [], '75%': [], '100%': [] },
    },
] as unknown as PenerimaFotoGroup[]

describe('buildFotoPrintHtml (template grid)', () => {
    it('menampilkan baris ringkas di halaman berikutnya', () => {
        const { html } = buildFotoPrintHtml(groups, meta, opts, [])

        expect(html.match(/class="running-head"/g)).toHaveLength(1)
        expect(html).toContain('Paket Uji · Pipa · Desa Uji, Kec Uji')
    })

    it('menampilkan foto utuh dengan object-fit contain', () => {
        const { html } = buildFotoPrintHtml(groups, meta, opts, [])

        expect(html).toContain('object-fit: contain')
        expect(html).not.toContain('object-fit: cover')
    })

    it('menampilkan nomor halaman dengan total halaman', () => {
        const { html } = buildFotoPrintHtml(groups, meta, opts, [])

        expect(html).toContain('counter(pages)')
    })
})
