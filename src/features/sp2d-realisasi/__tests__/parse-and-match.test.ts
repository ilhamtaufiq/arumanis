import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { parseSp2dExcel } from '../lib/parse-sp2d-excel'
import { matchSp2dRows, summarizeMatches } from '../lib/match-sp2d'
import type { Sp2dPekerjaanCatalog, Sp2dPenyediaCatalog, Sp2dRow } from '../types'

const juniPath = 'C:/Users/asusg/Downloads/Juni Laporan Register SP2D.xlsx'

describe('parseSp2dExcel (sample file)', () => {
    it('parses Juni register including Sub Keg. hints', () => {
        let buffer: Buffer
        try {
            buffer = readFileSync(juniPath)
        } catch {
            return
        }

        const { rows, meta } = parseSp2dExcel(
            buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
            'juni.xlsx',
        )
        expect(rows.length).toBeGreaterThan(50)
        expect(meta.periodeLabel).toMatch(/Juni/i)

        const work = rows.filter((r) => !r.isNonPekerjaan)
        expect(work.length).toBeGreaterThan(40)
        expect(work[0]?.penyediaHint.length).toBeGreaterThan(2)
        expect(work.some((r) => r.subKegiatanHint.length > 5)).toBe(true)
        expect(work.some((r) => r.bruto > 0)).toBe(true)
    })
})

describe('matchSp2dRows', () => {
    it('matches penyedia and paket scoped by sub kegiatan', () => {
        const penyedia: Sp2dPenyediaCatalog[] = [
            { id: 1, nama: 'CV PUTRA KENCANA', direktur: 'ISAK SUPARDI' },
            { id: 2, nama: 'CV GAMANA CITRA', direktur: 'SONI SUHERLY' },
        ]
        const pekerjaan: Sp2dPekerjaanCatalog[] = [
            {
                id: 10,
                nama_paket: 'Pembangunan Jalan RW.08 & 09 Desa Rancagoong Kecamatan Cilaku',
                pagu: 200_000_000,
                kegiatan_id: 5,
                penyediaIds: [1],
                kontrak: [
                    {
                        id: 100,
                        nilai_kontrak: 200_000_000,
                        penyedia_id: 1,
                        penyedia_nama: 'CV PUTRA KENCANA',
                    },
                ],
            },
            {
                id: 11,
                nama_paket: 'Pembangunan TPT RW.06 Desa Rancagoong',
                pagu: 100_000_000,
                kegiatan_id: 5,
                penyediaIds: [2],
                kontrak: [
                    {
                        id: 101,
                        nilai_kontrak: 100_000_000,
                        penyedia_id: 2,
                        penyedia_nama: 'CV GAMANA CITRA',
                    },
                ],
            },
        ]

        const rows: Sp2dRow[] = [
            {
                index: 1,
                fileName: 't.xlsx',
                no: '1',
                tanggalPembuatan: '',
                tanggalPencairan: '',
                nomorSp2d: 'SP2D-1',
                unitSkpd: '',
                namaPenerima: 'CV PUTRA KENCANA/ISAK SUPARDI',
                keterangan:
                    '(DAU) Biaya Pembayaran sebesar 95% Pek.Pembangunan Jalan RW.08&09 Ds.Rancagoong Kec.Cilaku Kab.Cianjur Pada Sub Keg. Perbaikan Prasarana',
                jenisSp2d: 'LS',
                bruto: 189_041_145,
                potongan: 0,
                neto: 189_041_145,
                penyediaHint: 'CV PUTRA KENCANA',
                direkturHint: 'ISAK SUPARDI',
                paketHint: 'Pembangunan Jalan RW.08&09 Ds.Rancagoong Kec.Cilaku Kab.Cianjur',
                subKegiatanHint: 'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
                sumberDana: 'DAU',
                persenPembayaran: 95,
                kategori: 'termin',
                isNonPekerjaan: false,
            },
        ]

        const subKey = new Map([
            [
                't.xlsx::1::SP2D-1',
                {
                    id: 5,
                    label: 'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
                    score: 1,
                },
            ],
        ])
        const matched = matchSp2dRows(rows, penyedia, pekerjaan, { subKegiatanByKey: subKey })
        expect(matched[0]?.status).toBe('matched')
        expect(matched[0]?.matchedSubKegiatan?.id).toBe(5)
        expect(matched[0]?.matchedPenyedia?.id).toBe(1)
        expect(matched[0]?.matchedPekerjaan?.id).toBe(10)
        expect(matched[0]?.matchedKontrakId).toBe(100)
        expect(matched[0]?.realisasiTerhadapKontrak).toBeGreaterThan(90)

        const summary = summarizeMatches(matched)
        expect(summary.matched).toBe(1)
    })

    it('does not full-match when pekerjaan+penyedia not on same kontrak', () => {
        const penyedia: Sp2dPenyediaCatalog[] = [
            { id: 1, nama: 'CV PUTRA KENCANA', direktur: 'ISAK SUPARDI' },
            { id: 2, nama: 'CV GAMANA CITRA', direktur: 'SONI SUHERLY' },
        ]
        // Paket nama mirip PUTRA KENCANA row, tapi kontraknya milik GAMANA
        const pekerjaan: Sp2dPekerjaanCatalog[] = [
            {
                id: 10,
                nama_paket: 'Pembangunan Jalan RW.08 & 09 Desa Rancagoong Kecamatan Cilaku',
                pagu: 200_000_000,
                kegiatan_id: 5,
                penyediaIds: [2],
                kontrak: [
                    {
                        id: 101,
                        nilai_kontrak: 200_000_000,
                        penyedia_id: 2,
                        penyedia_nama: 'CV GAMANA CITRA',
                    },
                ],
            },
        ]

        const rows: Sp2dRow[] = [
            {
                index: 1,
                fileName: 't.xlsx',
                no: '1',
                tanggalPembuatan: '',
                tanggalPencairan: '',
                nomorSp2d: 'SP2D-X',
                unitSkpd: '',
                namaPenerima: 'CV PUTRA KENCANA/ISAK SUPARDI',
                keterangan: 'Pek.Pembangunan Jalan RW.08&09 Ds.Rancagoong Pada Sub Keg. Perbaikan',
                jenisSp2d: 'LS',
                bruto: 100_000_000,
                potongan: 0,
                neto: 100_000_000,
                penyediaHint: 'CV PUTRA KENCANA',
                direkturHint: 'ISAK SUPARDI',
                paketHint: 'Pembangunan Jalan RW.08&09 Ds.Rancagoong',
                subKegiatanHint: 'Perbaikan',
                sumberDana: 'DAU',
                persenPembayaran: 95,
                kategori: 'termin',
                isNonPekerjaan: false,
            },
        ]

        const matched = matchSp2dRows(rows, penyedia, pekerjaan)
        // Pair kontrak is GAMANA+paket; SP2D says PUTRA → should not be full match with wrong pair
        if (matched[0]?.status === 'matched') {
            // If matched, must be kontrak-consistent (GAMANA with this paket)
            expect(matched[0].matchedPenyedia?.id).toBe(2)
            expect(matched[0].matchedKontrakId).toBe(101)
        } else {
            expect(matched[0]?.matchedKontrakId).toBeNull()
            expect(matched[0]?.status).not.toBe('matched')
        }
    })
})
