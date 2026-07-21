import { describe, expect, it } from 'vitest'
import {
    formatPekerjaanStatus,
    pekerjaanHasKontrak,
    pekerjaanIsCanceled,
    sumNilaiKontrak,
    buildPdfTable,
    getExportColumnsByIds,
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
