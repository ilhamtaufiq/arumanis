import { describe, expect, it } from 'vitest'
import {
    buildFotoByLevel,
    buildFotoMapPoints,
    buildPaketOptionSearchText,
    buildProgressEstimasiSummary,
    buildReviewRecommendations,
    buildReviewStats,
    formatFotoStatus,
    buildFotoKomponenFilterOptions,
    buildFotoSlotFilterOptions,
    filterGalleryFotos,
    paginateFotos,
    resolveFotoKomponenLabel,
    sortFotosByLatest,
} from '../lib/pekerjaan-review-utils'
import type { PekerjaanReviewDetail } from '../lib/pekerjaan-review-utils'

describe('pekerjaan-review-utils', () => {
    it('builds gallery filter options and filters by komponen and slot', () => {
        const fotos = [
            { id: 1, komponen_id: 7, keterangan: '0%', created_at: '2026-06-01' } as never,
            { id: 2, komponen_id: 7, keterangan: '50%', created_at: '2026-06-02' } as never,
            { id: 3, komponen_id: 9, keterangan: '100%', created_at: '2026-06-03' } as never,
        ]
        const outputs = [
            { id: 7, komponen: 'Sambungan Rumah', volume: 10, satuan: 'SR', penerima_is_optional: false },
            { id: 9, komponen: 'Reservoir', volume: 1, satuan: 'unit', penerima_is_optional: false },
        ]

        const komponenOptions = buildFotoKomponenFilterOptions(fotos, outputs)
        const slotOptions = buildFotoSlotFilterOptions(fotos)
        const filtered = filterGalleryFotos(fotos, { komponenId: 7, slot: '50%' })

        expect(komponenOptions).toHaveLength(2)
        expect(komponenOptions[0].label).toBe('Reservoir')
        expect(slotOptions.find((item) => item.slot === '50%')?.count).toBe(1)
        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe(2)
    })

    it('resolves foto komponen label from output when relation is missing', () => {
        const label = resolveFotoKomponenLabel(
            { komponen_id: 7 } as never,
            [{ id: 7, komponen: 'Sambungan Rumah', volume: 10, satuan: 'SR', penerima_is_optional: false }],
        )

        expect(label).toBe('Sambungan Rumah')
    })

    it('sorts foto by latest created_at', () => {
        const sorted = sortFotosByLatest([
            { id: 1, created_at: '2026-01-01T00:00:00Z' } as never,
            { id: 2, created_at: '2026-06-15T00:00:00Z' } as never,
            { id: 3, created_at: '2026-03-10T00:00:00Z' } as never,
        ])

        expect(sorted.map((foto) => foto.id)).toEqual([2, 3, 1])
    })

    it('paginates foto list', () => {
        const items = Array.from({ length: 25 }, (_, index) => ({ id: index + 1 }))
        const page1 = paginateFotos(items, 1, 12)
        const page3 = paginateFotos(items, 3, 12)

        expect(page1.items).toHaveLength(12)
        expect(page1.from).toBe(1)
        expect(page1.to).toBe(12)
        expect(page1.totalPages).toBe(3)
        expect(page3.items).toHaveLength(1)
        expect(page3.from).toBe(25)
        expect(page3.to).toBe(25)
    })

    it('groups foto by progress level', () => {
        const result = buildFotoByLevel([
            { keterangan: '0%' } as never,
            { keterangan: '0%' } as never,
            { keterangan: '50%' } as never,
        ])

        expect(result.find((item) => item.level === '0%')?.count).toBe(2)
        expect(result.find((item) => item.level === '50%')?.count).toBe(1)
        expect(result.find((item) => item.level === '100%')?.count).toBe(0)
    })

    it('summarizes progress estimasi from tab progress input', () => {
        const summary = buildProgressEstimasiSummary({
            pekerjaan_id: 1,
            tahun_anggaran: 2026,
            updated_at: '2026-06-01T10:00:00Z',
            fisik: {
                rencana: [{ tanggal: '2026-05-01', persen: 40 }],
                realisasi: [{ tanggal: '2026-05-15', persen: 35 }],
                latest_rencana: 40,
                latest_realisasi: 35,
                deviasi: -5,
            },
            keuangan: {
                rencana: [],
                realisasi: [{ tanggal: '2026-05-15', persen: 20 }],
                latest_rencana: null,
                latest_realisasi: 20,
                deviasi: null,
            },
        })

        expect(summary.hasInput).toBe(true)
        expect(summary.fisik.latestRealisasi).toBe(35)
        expect(summary.fisik.deviasi).toBe(-5)
        expect(summary.keuangan.latestRealisasi).toBe(20)
    })

    it('builds review stats from detail payload', () => {
        const detail: PekerjaanReviewDetail = {
            id: 1,
            nama_paket: 'Paket A',
            pagu: 1000000,
            kecamatan_id: 1,
            desa_id: 1,
            kegiatan_id: 1,
            created_at: '',
            updated_at: '',
            penerima: [
                { id: 1, pekerjaan_id: 1, nama: 'A', jumlah_jiwa: 3, nik: null, alamat: null, is_komunal: false, created_at: '', updated_at: '' },
            ],
            foto: [{ id: 1 } as never],
            foto_count: 1,
            foto_required_count: 5,
            foto_status: 'belum_selesai',
            output: [{ id: 1, komponen: 'SR', volume: 1, satuan: 'unit', penerima_is_optional: false }],
            progress_total: 42.5,
            deviasi: -2.5,
        }

        const stats = buildReviewStats(detail)
        expect(stats.penerimaCount).toBe(1)
        expect(stats.totalJiwa).toBe(3)
        expect(stats.fotoCount).toBe(1)
        expect(stats.progressFisik).toBe(42.5)
        expect(stats.estimasiFisik).toBeNull()
        expect(formatFotoStatus(stats.fotoStatus)).toBe('Belum lengkap')
    })

    it('prioritizes progress estimasi fisik over progress_total', () => {
        const detail: PekerjaanReviewDetail = {
            id: 1,
            nama_paket: 'Paket B',
            pagu: 500000,
            kecamatan_id: 1,
            desa_id: 1,
            kegiatan_id: 1,
            created_at: '',
            updated_at: '',
            progress_total: 10,
        }

        const stats = buildReviewStats(detail, {
            progressEstimasi: {
                pekerjaan_id: 1,
                tahun_anggaran: 2026,
                updated_at: null,
                fisik: {
                    rencana: [{ tanggal: '2026-06-01', persen: 50 }],
                    realisasi: [{ tanggal: '2026-06-15', persen: 45 }],
                    latest_rencana: 50,
                    latest_realisasi: 45,
                    deviasi: -5,
                },
                keuangan: {
                    rencana: [],
                    realisasi: [],
                    latest_rencana: null,
                    latest_realisasi: null,
                    deviasi: null,
                },
            },
        })

        expect(stats.estimasiFisik).toBe(45)
        expect(stats.progressFisik).toBe(45)
        expect(stats.estimasiFisikDeviasi).toBe(-5)
    })

    it('builds searchable paket keywords', () => {
        const text = buildPaketOptionSearchText({
            id: 1,
            nama_paket: 'SPAM Kubang',
            kode_rekening: '1.2.03',
            desa: { id: 1, nama_desa: 'Kubang', kecamatan_id: 1, created_at: '', updated_at: '' },
            kecamatan: { id: 1, nama_kecamatan: 'Pasirkuda', created_at: '', updated_at: '' },
            pagu: 0,
            kecamatan_id: 1,
            desa_id: 1,
            kegiatan_id: 1,
            created_at: '',
            updated_at: '',
        })

        expect(text).toContain('SPAM Kubang')
        expect(text).toContain('Kubang')
        expect(text).toContain('1.2.03')
    })

    it('maps foto coordinates and emits recommendations', () => {
        const detail: PekerjaanReviewDetail = {
            id: 1,
            nama_paket: 'Paket A',
            pagu: 1000000,
            kecamatan_id: 1,
            desa_id: 1,
            kegiatan_id: 1,
            created_at: '',
            updated_at: '',
            foto: [
                {
                    id: 1,
                    pekerjaan_id: 1,
                    komponen_id: 1,
                    keterangan: '0%',
                    koordinat: '-6.676555, 107.052271',
                    validasi_koordinat: true,
                    foto_url: '/f.jpg',
                    created_at: '',
                    updated_at: '',
                } as never,
            ],
            output: [{ id: 1, komponen: 'SR', volume: 2, satuan: 'unit', penerima_is_optional: false }],
            penerima: [],
            foto_count: 1,
            foto_required_count: 10,
            foto_status: 'belum_selesai',
            progress_total: 0,
            deviasi: 0,
        }

        const stats = buildReviewStats(detail)
        const points = buildFotoMapPoints(detail.foto)
        const recommendations = buildReviewRecommendations(detail, stats, points)

        expect(points).toHaveLength(1)
        expect(recommendations.some((item) => item.title.includes('penerima'))).toBe(true)
        expect(recommendations.some((item) => item.title.includes('koordinat'))).toBe(false)
    })
})