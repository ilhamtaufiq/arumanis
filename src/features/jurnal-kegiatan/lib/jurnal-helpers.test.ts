import { describe, expect, it } from 'vitest'
import type { JurnalEntry } from '../types'
import {
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
