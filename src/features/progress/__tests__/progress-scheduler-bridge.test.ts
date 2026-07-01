import { describe, expect, it } from 'vitest'
import {
    buildSchedulerItems,
    detectProjectTypeFromProgressItems,
    normalizeSchedulerGroupName,
} from '../lib/progress-scheduler-bridge'
import type { EditableProgressItem } from '../types/progress-editor'

describe('progress-scheduler-bridge', () => {
    it('normalizes SPAM JP breadcrumb groups to roman section label', () => {
        expect(
            normalizeSchedulerGroupName('PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS › Pengadaan Pipa › a.'),
        ).toBe('PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS')
    })

    it('builds scheduler tree with normalized group headers', () => {
        const items: EditableProgressItem[] = [
            {
                id: '1',
                nama_item: 'PEKERJAAN PERSIAPAN',
                rincian_item: 'Pembersihan lokasi',
                satuan: 'Ls',
                harga_satuan: 300000,
                target_volume: 1,
                bobot: 0,
                weekly_data: {},
            },
            {
                id: '2',
                nama_item: 'PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS › Pengadaan Pipa › a.',
                rincian_item: 'PVC dia. 3" S-12,5 RRJ',
                satuan: "m'",
                harga_satuan: 100650,
                target_volume: 30,
                bobot: 0,
                weekly_data: {},
            },
        ]

        const schedulerItems = buildSchedulerItems(items)
        const headers = schedulerItems.filter((item) => String(item.id).startsWith('group-'))

        expect(headers).toHaveLength(2)
        expect(headers[1].uraian).toBe('PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS')
    })

    it('detects air_minum from SPAM JP imported items', () => {
        const items: EditableProgressItem[] = [
            {
                id: '1',
                nama_item: 'PEKERJAAN SAMBUNGAN RUMAH',
                rincian_item: 'Pengadaan pipa dan accessories sambungan rumah',
                satuan: 'unit',
                harga_satuan: 1460109.55,
                target_volume: 22,
                bobot: 0,
                weekly_data: {},
            },
            {
                id: '2',
                nama_item: 'PENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS',
                rincian_item: 'PVC dia. 1,5" S-12,5 SCJ',
                satuan: "m'",
                harga_satuan: 32010,
                target_volume: 2460,
                bobot: 0,
                weekly_data: {},
            },
        ]

        expect(detectProjectTypeFromProgressItems(items)).toBe('air_minum')
    })
})