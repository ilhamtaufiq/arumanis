import { describe, expect, it } from 'vitest'
import {
    formatPekerjaanStatus,
    pekerjaanHasKontrak,
    pekerjaanIsCanceled,
    sumNilaiKontrak,
    buildPdfTable,
    getExportColumnsByIds,
    mergeKonsolidasiPekerjaan,
} from '../lib/export-pekerjaan-columns'
import type { Pekerjaan } from '../types'

const base: Pekerjaan = {
    id: 1,
    kode_rekening: null,
    nama_paket: 'Paket A',
    pagu: 0,
    kecamatan_id: null,
    desa_id: null,
    kegiatan_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
}

describe('export-pekerjaan-columns helpers', () => {
    it('formatPekerjaanStatus maps canceled/active', () => {
        expect(formatPekerjaanStatus('canceled')).toBe('Dibatalkan')
        expect(formatPekerjaanStatus('active')).toBe('Aktif')
        expect(formatPekerjaanStatus(null)).toBe('Aktif')
    })

    it('pekerjaanHasKontrak uses flag, count, or array', () => {
        expect(pekerjaanHasKontrak({ ...base, has_kontrak: true })).toBe(true)
        expect(pekerjaanHasKontrak({ ...base, has_kontrak: false })).toBe(false)
        expect(pekerjaanHasKontrak({ ...base, kontrak_count: 2 })).toBe(true)
        expect(
            pekerjaanHasKontrak({
                ...base,
                kontrak: [{ id: 1, nilai_kontrak: 100 } as never],
            }),
        ).toBe(true)
        expect(pekerjaanHasKontrak(base)).toBe(false)
    })

    it('pekerjaanIsCanceled detects canceled status', () => {
        expect(pekerjaanIsCanceled({ ...base, status: 'canceled' })).toBe(true)
        expect(pekerjaanIsCanceled({ ...base, status: 'active' })).toBe(false)
        expect(pekerjaanIsCanceled(base)).toBe(false)
    })

    it('sumNilaiKontrak sums kontrak values', () => {
        expect(sumNilaiKontrak(base)).toBeNull()
        expect(
            sumNilaiKontrak({
                ...base,
                kontrak: [
                    { id: 1, nilai_kontrak: 100_000 } as never,
                    { id: 2, nilai_kontrak: 50_000 } as never,
                ],
            }),
        ).toBe(150_000)
    })

    it('nilai_kontrak column formats in PDF table', () => {
        const cols = getExportColumnsByIds(['no', 'nilai_kontrak'])
        const { body } = buildPdfTable(
            [
                {
                    ...base,
                    kontrak: [{ id: 1, nilai_kontrak: 1_000_000 } as never],
                },
            ],
            cols,
        )
        expect(body[0][0]).toBe('1')
        expect(body[0][1]).toContain('1.000.000')
    })
})

describe('mergeKonsolidasiPekerjaan', () => {
    it('merges 2 pekerjaan sharing 1 kontrak into 1 row', () => {
        const data: Pekerjaan[] = [
            { ...base, id: 1, nama_paket: 'Paket A', pagu: 100_000, kontrak: [{ id: 10, nilai_kontrak: 500_000 } as never] },
            { ...base, id: 2, nama_paket: 'Paket B', pagu: 200_000, kontrak: [{ id: 10, nilai_kontrak: 500_000 } as never] },
        ]
        const result = mergeKonsolidasiPekerjaan(data)
        expect(result).toHaveLength(1)
        expect(result[0].nama_paket).toBe('Paket A + Paket B')
        expect(result[0].pagu).toBe(300_000)
        expect(result[0].kontrak).toHaveLength(1)
        expect(result[0].kontrak![0].nilai_kontrak).toBe(500_000)
    })

    it('keeps standalone pekerjaan as separate rows', () => {
        const data: Pekerjaan[] = [
            { ...base, id: 1, nama_paket: 'Paket A', pagu: 100_000, kontrak: [{ id: 10, nilai_kontrak: 500_000 } as never] },
            { ...base, id: 2, nama_paket: 'Paket B', pagu: 200_000, kontrak: [{ id: 10, nilai_kontrak: 500_000 } as never] },
            { ...base, id: 3, nama_paket: 'Paket C', pagu: 50_000, kontrak: [{ id: 20, nilai_kontrak: 100_000 } as never] },
        ]
        const result = mergeKonsolidasiPekerjaan(data)
        expect(result).toHaveLength(2)
        expect(result.find((r) => r.nama_paket.includes('Paket C'))).toBeTruthy()
    })

    it('does not merge pekerjaan without kontrak', () => {
        const data: Pekerjaan[] = [
            { ...base, id: 1, nama_paket: 'Paket A' },
            { ...base, id: 2, nama_paket: 'Paket B' },
        ]
        const result = mergeKonsolidasiPekerjaan(data)
        expect(result).toHaveLength(2)
    })

    it('sums pagu correctly and deduplicates kontrak', () => {
        const data: Pekerjaan[] = [
            { ...base, id: 1, pagu: 1_000_000, kontrak: [{ id: 5, nilai_kontrak: 2_000_000 } as never] },
            { ...base, id: 2, pagu: 3_000_000, kontrak: [{ id: 5, nilai_kontrak: 2_000_000 } as never] },
            { ...base, id: 3, pagu: 500_000, kontrak: [{ id: 5, nilai_kontrak: 2_000_000 } as never] },
        ]
        const result = mergeKonsolidasiPekerjaan(data)
        expect(result).toHaveLength(1)
        expect(result[0].pagu).toBe(4_500_000)
        expect(sumNilaiKontrak(result[0])).toBe(2_000_000)
    })
})
