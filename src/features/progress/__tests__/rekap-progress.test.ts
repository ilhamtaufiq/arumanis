import { describe, expect, it } from 'vitest'
import {
    buildRekapExportRows,
    compareRekapItems,
    filterRekapGroups,
    groupByKonsolidasi,
    summarizeGroupMoney,
    summarizeGroupProgress,
    type RekapPekerjaanItem,
} from '../lib/rekap-progress'

const item = (overrides: Partial<RekapPekerjaanItem> & { id: number }): RekapPekerjaanItem => ({
    nama_paket: `Paket ${overrides.id}`,
    ...overrides,
})

describe('rekap-progress lib', () => {
    it('groups items sharing kontrak ids', () => {
        const list = [
            item({ id: 1, kontrak: [{ id: 10 } as never] }),
            item({ id: 2, kontrak: [{ id: 10 } as never] }),
            item({ id: 3 }),
        ]
        const groups = groupByKonsolidasi(list)
        expect(groups).toHaveLength(2)
        expect(groups[0]).toHaveLength(2)
        expect(groups[1]).toHaveLength(1)
    })

    it('summarizes group progress as average, not first item', () => {
        const summary = summarizeGroupProgress([
            item({ id: 1, progress_estimasi_fisik: 100, progress_estimasi_keuangan: 90 }),
            item({ id: 2, progress_estimasi_fisik: 20, progress_estimasi_keuangan: 10 }),
        ])
        expect(summary.isKonsolidasi).toBe(true)
        expect(summary.fisik).toBe(60)
        expect(summary.keuangan).toBe(50)
        expect(summary.fisikMin).toBe(20)
        expect(summary.fisikMax).toBe(100)
    })

    it('dedupes shared kontrak in money summary', () => {
        const shared = { id: 10, nilai_kontrak: 100 } as never
        const { totalPagu, totalKontrak, kontrakCount } = summarizeGroupMoney([
            item({ id: 1, pagu: 60, kontrak: [shared] }),
            item({ id: 2, pagu: 40, kontrak: [shared] }),
        ])
        expect(totalPagu).toBe(100)
        expect(totalKontrak).toBe(100)
        expect(kontrakCount).toBe(1)
    })

    it('searches across paket, wilayah, and sub kegiatan', () => {
        const groups = groupByKonsolidasi([
            item({ id: 1, nama_paket: 'Pipa Induk', kecamatan: { nama_kecamatan: 'Cianjur' } }),
            item({ id: 2, nama_paket: 'Sumur Bor', desa: { nama_desa: 'Sukamaju' } }),
        ])
        expect(filterRekapGroups(groups, { mode: 'all', search: 'cianjur' })).toHaveLength(1)
        expect(filterRekapGroups(groups, { mode: 'all', search: 'sukamaju' })).toHaveLength(1)
        expect(filterRekapGroups(groups, { mode: 'all', search: 'pipa' })).toHaveLength(1)
        expect(filterRekapGroups(groups, { mode: 'single', search: '' })).toHaveLength(2)
    })

    it('compares nilai_kontrak with nulls last', () => {
        const a = item({ id: 1 })
        const b = item({ id: 2, kontrak: [{ id: 5, nilai_kontrak: 50 } as never] })
        expect(compareRekapItems(a, b, 'nilai_kontrak')).toBe(1)
        expect(compareRekapItems(b, a, 'nilai_kontrak')).toBe(-1)
    })

    it('builds export rows with averaged progress', () => {
        const rows = buildRekapExportRows([
            [
                item({ id: 1, nama_paket: 'A', pagu: 10, progress_estimasi_fisik: 80 }),
                item({ id: 2, nama_paket: 'B', pagu: 20, progress_estimasi_fisik: 40 }),
            ],
        ])
        expect(rows).toHaveLength(1)
        expect(rows[0]?.namaPaket).toContain('Konsolidasi 2 paket')
        expect(rows[0]?.totalPagu).toBe(30)
        expect(rows[0]?.fisik).toBe(60)
    })
})
