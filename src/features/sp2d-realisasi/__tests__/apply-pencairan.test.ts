import { describe, expect, it } from 'bun:test'
import {
    buildPencairanPlans,
    mergeKeuanganRealisasi,
    mergeKeuanganRealisasiWithSp2d,
    replaceKeuanganRealisasiFromSp2d,
} from '../lib/apply-pencairan'
import { parseSp2dDate } from '../lib/parse-sp2d-date'
import type { Sp2dMatchedRow } from '../types'

function row(partial: Partial<Sp2dMatchedRow> & Pick<Sp2dMatchedRow, 'bruto' | 'tanggalPencairan'>): Sp2dMatchedRow {
    return {
        index: 1,
        fileName: 't.xlsx',
        no: '1',
        tanggalPembuatan: partial.tanggalPencairan,
        tanggalPencairan: partial.tanggalPencairan,
        nomorSp2d: 'X',
        unitSkpd: '',
        namaPenerima: 'CV TEST/A',
        keterangan: 'Pek.Test',
        jenisSp2d: 'LS',
        potongan: 0,
        neto: partial.bruto,
        penyediaHint: 'CV TEST',
        direkturHint: 'A',
        paketHint: 'Test',
        subKegiatanHint: 'Perbaikan Prasarana',
        sumberDana: 'DAU',
        persenPembayaran: 95,
        kategori: 'termin',
        isNonPekerjaan: false,
        status: 'matched',
        matchedSubKegiatan: { id: 5, label: 'Perbaikan Prasarana', score: 1 },
        matchedPenyedia: { id: 1, label: 'CV TEST', score: 1 },
        matchedPekerjaan: { id: 10, label: 'Paket Test', score: 1 },
        matchedKontrakId: 100,
        nilaiKontrak: 200_000_000,
        realisasiTerhadapKontrak: null,
        candidatesPenyedia: [],
        candidatesPekerjaan: [],
        bruto: partial.bruto,
        ...partial,
    }
}

describe('parseSp2dDate', () => {
    it('parses Indonesian long date', () => {
        expect(parseSp2dDate('1 Juni 2026')).toBe('2026-06-01')
        expect(parseSp2dDate('30 Juli 2026')).toBe('2026-07-30')
    })

    it('parses ISO and slash', () => {
        expect(parseSp2dDate('2026-06-15')).toBe('2026-06-15')
        expect(parseSp2dDate('15/06/2026')).toBe('2026-06-15')
    })
})

describe('buildPencairanPlans', () => {
    it('builds cumulative percent by pencairan date', () => {
        const plans = buildPencairanPlans([
            row({ bruto: 100_000_000, tanggalPencairan: '1 Juni 2026' }),
            row({ bruto: 90_000_000, tanggalPencairan: '15 Juni 2026' }),
        ])
        expect(plans).toHaveLength(1)
        const p = plans[0]!
        expect(p.entries).toHaveLength(2)
        expect(p.entries[0]?.persen).toBe(50)
        expect(p.entries[1]?.persen).toBe(95)
        expect(p.finalPersen).toBe(95)
        expect(p.capped).toBe(false)
    })

    it('caps at 100%', () => {
        const plans = buildPencairanPlans([
            row({ bruto: 150_000_000, tanggalPencairan: '1 Juni 2026', nilaiKontrak: 100_000_000 }),
        ])
        expect(plans[0]?.finalPersen).toBe(100)
        expect(plans[0]?.capped).toBe(true)
    })

    it('skips without kontrak value', () => {
        const plans = buildPencairanPlans([
            row({ bruto: 10, tanggalPencairan: '1 Juni 2026', nilaiKontrak: null }),
        ])
        expect(plans[0]?.reason).toMatch(/kontrak/i)
        expect(plans[0]?.entries).toHaveLength(0)
    })
})

describe('mergeKeuanganRealisasi', () => {
    it('overwrites same date and keeps others (legacy merge)', () => {
        const merged = mergeKeuanganRealisasi(
            [
                { tanggal: '2026-05-01', persen: 10 },
                { tanggal: '2026-06-01', persen: 20 },
            ],
            [{ tanggal: '2026-06-01', persen: 50, brutoOnDate: 1, cumulativeBruto: 1 }],
        )
        expect(merged).toEqual([
            { tanggal: '2026-05-01', persen: 10 },
            { tanggal: '2026-06-01', persen: 50 },
        ])
    })
})

describe('replaceKeuanganRealisasiFromSp2d', () => {
    it('fully replaces realisasi with SP2D entries (SP2D only, no existing)', () => {
        const replaced = replaceKeuanganRealisasiFromSp2d([
            { tanggal: '2026-06-01', persen: 30, brutoOnDate: 1, cumulativeBruto: 1, nomorSp2dList: ['001/SP2D/2026'], tanggalPembuatan: '2026-05-30' },
            { tanggal: '2026-07-01', persen: 95, brutoOnDate: 2, cumulativeBruto: 3, nomorSp2dList: [], tanggalPembuatan: null },
        ])
        expect(replaced).toEqual([
            { tanggal: '2026-06-01', persen: 30, nomor_sp2d: '001/SP2D/2026', tanggal_pembuatan: '2026-05-30', tanggal_pencairan: '2026-06-01' },
            { tanggal: '2026-07-01', persen: 95, nomor_sp2d: null, tanggal_pembuatan: null, tanggal_pencairan: '2026-07-01' },
        ])
    })
})

describe('mergeKeuanganRealisasiWithSp2d', () => {
    it('overwrites same tanggal and appends new tanggal', () => {
        const existing = [
            { tanggal: '2026-05-01', persen: 10, nomor_sp2d: null, tanggal_pembuatan: null, tanggal_pencairan: '2026-05-01' },
            { tanggal: '2026-06-01', persen: 30, nomor_sp2d: '001/SP2D/2026', tanggal_pembuatan: '2026-05-30', tanggal_pencairan: '2026-06-01' },
        ]
        const sp2d = [
            { tanggal: '2026-07-01', persen: 95, brutoOnDate: 2, cumulativeBruto: 3, nomorSp2dList: ['002/SP2D/2026'], tanggalPembuatan: '2026-06-28' },
        ]
        const merged = mergeKeuanganRealisasiWithSp2d(existing, sp2d)
        expect(merged).toEqual([
            { tanggal: '2026-05-01', persen: 10, nomor_sp2d: null, tanggal_pembuatan: null, tanggal_pencairan: '2026-05-01' },
            { tanggal: '2026-06-01', persen: 30, nomor_sp2d: '001/SP2D/2026', tanggal_pembuatan: '2026-05-30', tanggal_pencairan: '2026-06-01' },
            { tanggal: '2026-07-01', persen: 95, nomor_sp2d: '002/SP2D/2026', tanggal_pembuatan: '2026-06-28', tanggal_pencairan: '2026-07-01' },
        ])
    })

    it('overwrites same tanggal with new persen', () => {
        const existing = [
            { tanggal: '2026-06-01', persen: 30, nomor_sp2d: null, tanggal_pembuatan: null, tanggal_pencairan: '2026-06-01' },
        ]
        const sp2d = [
            { tanggal: '2026-06-01', persen: 45, brutoOnDate: 1, cumulativeBruto: 1, nomorSp2dList: ['003/SP2D/2026'], tanggalPembuatan: '2026-05-28' },
        ]
        const merged = mergeKeuanganRealisasiWithSp2d(existing, sp2d)
        expect(merged).toEqual([
            { tanggal: '2026-06-01', persen: 45, nomor_sp2d: '003/SP2D/2026', tanggal_pembuatan: '2026-05-28', tanggal_pencairan: '2026-06-01' },
        ])
    })
})
