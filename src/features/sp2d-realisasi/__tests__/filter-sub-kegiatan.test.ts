import { describe, expect, it } from 'bun:test'
import { filterRowsBySubKegiatanMulti, matchSubKegiatan } from '../lib/filter-sub-kegiatan'
import type { Sp2dKegiatanCatalog, Sp2dRow } from '../types'

const kegiatan: Sp2dKegiatanCatalog[] = [
    {
        id: 1,
        nama_sub_kegiatan: 'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
        nama_kegiatan: 'PSU',
        tahun_anggaran: '2026',
    },
    {
        id: 2,
        nama_sub_kegiatan: 'Pembangunan Sistem Penyediaan Air Minum (SPAM) Jaringan Perpipaan',
        nama_kegiatan: 'SPAM',
        tahun_anggaran: '2026',
    },
]

function baseRow(partial: Partial<Sp2dRow>): Sp2dRow {
    return {
        index: 1,
        fileName: 'j.xlsx',
        no: '1',
        tanggalPembuatan: '',
        tanggalPencairan: '',
        nomorSp2d: 'N1',
        unitSkpd: '',
        namaPenerima: 'CV A/B',
        keterangan: '',
        jenisSp2d: 'LS',
        bruto: 1000,
        potongan: 0,
        neto: 1000,
        penyediaHint: 'CV A',
        direkturHint: 'B',
        paketHint: 'Paket',
        subKegiatanHint: '',
        sumberDana: 'DAU',
        persenPembayaran: 95,
        kategori: 'termin',
        isNonPekerjaan: false,
        ...partial,
    }
}

describe('matchSubKegiatan', () => {
    it('matches abbreviated SP2D text to master', () => {
        const m = matchSubKegiatan(
            'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
            kegiatan,
        )
        expect(m?.id).toBe(1)
        expect(m!.score).toBeGreaterThan(0.8)
    })
})

describe('filterRowsBySubKegiatanMulti', () => {
    it('keeps only rows with matching Sub Keg.', () => {
        const rows = [
            baseRow({
                index: 1,
                nomorSp2d: 'A',
                subKegiatanHint: 'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
            }),
            baseRow({
                index: 2,
                nomorSp2d: 'B',
                subKegiatanHint: 'Sub Keg. yang tidak ada di master sama sekali XYZ',
            }),
            baseRow({
                index: 3,
                nomorSp2d: 'C',
                subKegiatanHint: '',
                isNonPekerjaan: false,
            }),
            baseRow({
                index: 4,
                nomorSp2d: 'D',
                isNonPekerjaan: true,
                subKegiatanHint: 'Perbaikan Prasarana, Sarana, dan Utilitas Umum di Perumahan',
            }),
            baseRow({
                index: 5,
                nomorSp2d: 'E',
                subKegiatanHint: 'Pembangunan Sistem Penyediaan Air Minum (SPAM) Jaringan Perpipaan',
            }),
        ]

        const result = filterRowsBySubKegiatanMulti(rows, kegiatan)
        expect(result.kept.map((r) => r.nomorSp2d).sort()).toEqual(['A', 'E'])
        expect(result.unmatchedSubKegCount).toBe(1)
        expect(result.noSubKegCount).toBe(1)
        expect(result.kegiatanIds.sort()).toEqual([1, 2])
        expect(result.matchedSubKegiatanLabels).toHaveLength(2)
    })
})
