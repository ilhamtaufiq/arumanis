import { describe, expect, it } from 'vitest'
import type { MasaPemeliharaanRow } from '../../api/masa-pemeliharaan'
import { filterMasa, ringkasanMasa, sisaHari } from '../masa-pemeliharaan'

const HARI_INI = new Date(2026, 6, 1) // 1 Juli 2026

function baris(p: Partial<MasaPemeliharaanRow> & Pick<MasaPemeliharaanRow, 'tanggal_akhir' | 'status'>): MasaPemeliharaanRow {
    return { pekerjaan_id: 1, nama_paket: 'Pipa Desa A', nomor_bastp: 'BASTP/1', tanggal_bastp: '2026-01-01', ...p }
}

describe('sisaHari', () => {
    it('menghitung selisih hari dari tanggal lokal', () => {
        expect(sisaHari('2026-07-31', HARI_INI)).toBe(30)
        expect(sisaHari('2026-07-01', HARI_INI)).toBe(0)
        expect(sisaHari('2026-06-30', HARI_INI)).toBe(-1)
    })
})

describe('ringkasanMasa', () => {
    it('memisahkan berjalan, berakhir, dan yang segera berakhir', () => {
        const rows = [
            baris({ tanggal_akhir: '2026-07-10', status: 'berjalan' }),
            baris({ tanggal_akhir: '2026-12-31', status: 'berjalan' }),
            baris({ tanggal_akhir: '2026-06-01', status: 'berakhir' }),
        ]
        expect(ringkasanMasa(rows, HARI_INI)).toEqual({ total: 3, berjalan: 2, berakhir: 1, segera: 1 })
    })
})

describe('filterMasa', () => {
    const rows = [
        baris({ tanggal_akhir: '2026-12-31', status: 'berjalan', nama_paket: 'Sumur Bor' }),
        baris({ tanggal_akhir: '2026-07-10', status: 'berjalan', nama_paket: 'Pipa Utama', nomor_bastp: 'BASTP/77' }),
        baris({ tanggal_akhir: '2026-06-01', status: 'berakhir', nama_paket: 'Reservoir' }),
    ]

    it('mengurutkan dari akhir masa paling dekat', () => {
        const hasil = filterMasa(rows, { status: 'semua', cari: '', hariIni: HARI_INI })
        expect(hasil.map((r) => r.tanggal_akhir)).toEqual(['2026-06-01', '2026-07-10', '2026-12-31'])
    })

    it('menyaring status segera berakhir', () => {
        const hasil = filterMasa(rows, { status: 'segera', cari: '', hariIni: HARI_INI })
        expect(hasil.map((r) => r.nama_paket)).toEqual(['Pipa Utama'])
    })

    it('mencari nama paket atau nomor BASTP tanpa memperhatikan huruf besar', () => {
        expect(filterMasa(rows, { status: 'semua', cari: 'bastp/77', hariIni: HARI_INI })).toHaveLength(1)
        expect(filterMasa(rows, { status: 'semua', cari: 'SUMUR', hariIni: HARI_INI })).toHaveLength(1)
    })
})
