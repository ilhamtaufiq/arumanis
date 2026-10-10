import { describe, expect, it } from 'vitest'
import type { JurnalEntry } from '../types'
import {
    fotoErrorMessage,
    fotoThumbSrc,
    FOTO_MAX_COUNT,
    splitFotoForThumbs,
    validateFotoSelection,
    firstErrorPerField,
    formatTanggal,
    periodKey,
    shiftMonth,
    sortJurnalNewestFirst,
    toJurnalPayload,
} from './jurnal-helpers'

const entry = (id: number, tanggal: string): JurnalEntry => ({
    id,
    tanggal,
    rhk: null,
    kegiatan: 'x',
    output: null,
    satuan: null,
    keterangan: null,
    foto: [],
    created_at: '',
    updated_at: '',
})

describe('shiftMonth', () => {
    it('pindah bulan dan melewati batas tahun', () => {
        expect(shiftMonth(2026, 1, -1)).toEqual({ tahun: 2025, bulan: 12 })
        expect(shiftMonth(2025, 12, 1)).toEqual({ tahun: 2026, bulan: 1 })
        expect(shiftMonth(2026, 10, 3)).toEqual({ tahun: 2027, bulan: 1 })
    })
})

describe('periodKey and formatTanggal', () => {
    it('membentuk kunci periode dengan nol di depan', () => {
        expect(periodKey(2026, 3)).toBe('2026-03')
    })

    it('mengubah YYYY-MM-DD menjadi dd/mm/yyyy tanpa pergeseran zona waktu', () => {
        expect(formatTanggal('2026-10-01')).toBe('01/10/2026')
    })
})

describe('sortJurnalNewestFirst', () => {
    it('mengurutkan tanggal terbaru dulu lalu id terbaru', () => {
        const sorted = sortJurnalNewestFirst([
            entry(1, '2026-10-02'),
            entry(3, '2026-10-05'),
            entry(2, '2026-10-05'),
        ])
        expect(sorted.map((e) => e.id)).toEqual([3, 2, 1])
    })
})

describe('toJurnalPayload', () => {
    it('mengubah string kosong menjadi null dan angka string menjadi number', () => {
        expect(
            toJurnalPayload({
                tanggal: '2026-10-10',
                rhk: ' 12 ',
                kegiatan: '  Rapat koordinasi  ',
                output: '',
                satuan: '  ',
                keterangan: 'catatan',
            }),
        ).toEqual({
            tanggal: '2026-10-10',
            rhk: 12,
            kegiatan: 'Rapat koordinasi',
            output: null,
            satuan: null,
            keterangan: 'catatan',
        })
    })
})

describe('firstErrorPerField', () => {
    it('mengambil pesan pertama per field dan mengabaikan field asing', () => {
        expect(
            firstErrorPerField({
                kegiatan: ['Kegiatan wajib diisi.', 'Lainnya'],
                rhk: ['RHK tidak valid.'],
                message: ['abaikan'],
            }),
        ).toEqual({ kegiatan: 'Kegiatan wajib diisi.', rhk: 'RHK tidak valid.' })
    })
})

const berkas = (name: string, type: string, size = 1024) =>
    new File([new Uint8Array(size)], name, { type })

describe('validateFotoSelection', () => {
    it('menerima JPG dan PNG, menolak format lain dan berkas di atas 10 MB', () => {
        const result = validateFotoSelection(
            [
                berkas('a.jpg', 'image/jpeg'),
                berkas('b.png', 'image/png'),
                berkas('c.gif', 'image/gif'),
                berkas('d.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1),
            ],
            0,
        )
        expect(result.accepted.map((f) => f.name)).toEqual(['a.jpg', 'b.png'])
        expect(result.messages).toHaveLength(2)
        expect(result.messages[0]).toContain('JPG atau PNG')
        expect(result.messages[1]).toContain('10 MB')
    })

    it('membatasi jumlah foto per kegiatan termasuk foto yang sudah ada', () => {
        const files = [berkas('1.jpg', 'image/jpeg'), berkas('2.jpg', 'image/jpeg')]
        const result = validateFotoSelection(files, FOTO_MAX_COUNT - 1)
        expect(result.accepted).toHaveLength(1)
        expect(result.messages).toHaveLength(1)
    })
})

describe('fotoThumbSrc and splitFotoForThumbs', () => {
    it('memakai url bila thumbnail kosong', () => {
        expect(fotoThumbSrc({ url: 'u.jpg', thumb: '' })).toBe('u.jpg')
        expect(fotoThumbSrc({ url: 'u.jpg', thumb: 't.jpg' })).toBe('t.jpg')
    })

    it('menampilkan maksimal 5 dan menghitung sisanya', () => {
        const items = [1, 2, 3, 4, 5, 6, 7]
        expect(splitFotoForThumbs(items)).toEqual({ visible: [1, 2, 3, 4, 5], remaining: 2 })
        expect(splitFotoForThumbs([1, 2])).toEqual({ visible: [1, 2], remaining: 0 })
    })
})

describe('fotoErrorMessage', () => {
    it('menerima errors.foto berupa daftar atau string', () => {
        expect(fotoErrorMessage({ foto: ['Ukuran foto maksimal 10 MB.'] })).toBe('Ukuran foto maksimal 10 MB.')
        expect(fotoErrorMessage({ foto: 'Format tidak didukung.' })).toBe('Format tidak didukung.')
        expect(fotoErrorMessage({ kegiatan: ['x'] })).toBeNull()
    })
})
