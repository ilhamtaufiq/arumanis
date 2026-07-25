import { describe, expect, it } from 'bun:test'
import {
    classifyPembayaranKategori,
    extractPaketHint,
    extractPersenPembayaran,
    extractSubKegiatanHint,
    extractSumberDana,
    fuzzyScore,
    isNonPekerjaanRow,
    normalizeText,
    parseIdrAmount,
    splitPenerima,
} from '../lib/normalize'

describe('sp2d normalize', () => {
    it('splits penerima company/director', () => {
        expect(splitPenerima('CV PUTRA KENCANA/ISAK SUPARDI')).toEqual({
            perusahaan: 'CV PUTRA KENCANA',
            direktur: 'ISAK SUPARDI',
        })
    })

    it('extracts paket hint from keterangan', () => {
        const ket =
            '(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan RW.08&09 Ds.Rancagoong Kec.Cilaku Kab.Cianjur Pada Sub Keg. Perbaikan Prasarana'
        expect(extractPaketHint(ket)).toContain('Pembangunan Jalan')
        expect(extractPaketHint(ket)).toContain('Rancagoong')
        expect(extractPaketHint(ket)).not.toContain('Pada Sub')
    })

    it('extracts Sub Keg. hint', () => {
        const ket =
            '(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan X Pada Sub Keg. Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan'
        expect(extractSubKegiatanHint(ket)).toBe(
            'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
        )
    })

    it('extracts sumber dana and percent', () => {
        const ket = '(SILPA) Biaya Pembayaran Pemeliharaan seb.5% Pek.Pemb.Jl.Lingkungan Foo'
        expect(extractSumberDana(ket)).toBe('SILPA')
        expect(extractPersenPembayaran(ket)).toBe(5)
        expect(
            extractPersenPembayaran(
                '(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan X',
            ),
        ).toBe(95)
    })

    it('parses IDR with thousand dots', () => {
        expect(parseIdrAmount('189.041.145')).toBe(189041145)
        expect(parseIdrAmount(1000)).toBe(1000)
    })

    it('flags gaji rows as non-pekerjaan', () => {
        expect(
            isNonPekerjaanRow(
                'TERLAMPIR',
                '(DAU) Pembayaran Gaji dan Tunjangan Lainnya PNS ...',
            ),
        ).toBe(true)
        expect(
            isNonPekerjaanRow(
                'CV PUTRA KENCANA/ISAK SUPARDI',
                '(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan RW.08',
            ),
        ).toBe(false)
    })

    it('normalizes abbreviations for fuzzy match', () => {
        const a = normalizeText('Pemb.Jl.Lingkungan Ds.Cibadak Kec.Sukaresmi')
        const b = normalizeText('Pembangunan Jalan Lingkungan Desa Cibadak Kecamatan Sukaresmi')
        expect(fuzzyScore(a, b)).toBeGreaterThan(0.5)
    })

    it('classifies SILPA, uang muka, termin', () => {
        expect(
            classifyPembayaranKategori(
                'SILPA',
                5,
                '(SILPA) Biaya Pembayaran Pemeliharaan seb.5% Pek.Pemb.Jl.Lingkungan X',
            ),
        ).toBe('silpa_pemeliharaan')
        expect(
            classifyPembayaranKategori(
                'DAU',
                30,
                '(DAU) Biaya Pembayaran Uang Muka sebesar 30% Pek.Sumur Bor X',
            ),
        ).toBe('uang_muka')
        expect(
            classifyPembayaranKategori(
                'DAU',
                95,
                '(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan X',
            ),
        ).toBe('termin')
    })
})
